
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '../../constants.tsx';
import { Student } from '../../types.ts';
import * as XLSX from 'xlsx';
import { 
  Plus, Search, Trash2, CheckCircle2, 
  X, Sparkles, Loader2, User, 
  FileSpreadsheet, Upload, 
  Edit2, Users, AlertCircle, 
  FileUp, Info, Eraser, Phone, AlertTriangle
} from 'lucide-react';

const StudentsManagement: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', grade: '', section: '', phoneNumber: '' });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempImportData, setTempImportData] = useState<Student[] | null>(null);
  const [importSummary, setImportSummary] = useState<{count: number, classCount: number, samples: string[]} | null>(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await db.getStudents(schoolId);
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  // وظيفة ذكية لتنظيف اسم الصف من الإنجليزي والشوائب
  const cleanGradeName = (rawName: string): string => {
    let name = rawName.trim();
    if (!name) return "";

    // البحث عن الكلمات المفتاحية العربية فقط
    const keywords = [
      'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس',
      'أول', 'ثاني', 'ثالث', 'رابع', 'خامس', 'سادس',
      'ابتدائي', 'المتوسط', 'الثانوي'
    ];

    let detectedGrade = "";
    for (const word of keywords) {
      if (name.includes(word)) {
        detectedGrade += (detectedGrade ? " " : "") + word;
      }
    }

    // إذا لم يجد كلمات مفتاحية، نكتفي بحذف الحروف الإنجليزية
    if (!detectedGrade) {
      return name.replace(/[a-zA-Z]/g, '').replace(/\s+/g, ' ').trim();
    }

    // إضافة كلمة "ابتدائي" إذا لم تكن موجودة وكان الصف من 1-6
    if (!detectedGrade.includes('ابتدائي') && /أول|ثاني|ثالث|رابع|خامس|سادس/.test(detectedGrade)) {
        detectedGrade += " الابتدائي";
    }

    return detectedGrade;
  };

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    setImportError('');
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
      
      if (rows.length < 1) {
        setImportError('الملف فارغ.');
        setIsProcessing(false);
        return;
      }

      // البحث عن صف العناوين
      let headerRowIdx = -1;
      for (let i = 0; i < Math.min(rows.length, 15); i++) {
        const rowStr = rows[i].join(' ');
        if (rowStr.includes('اسم') || rowStr.includes('الطالب') || rowStr.includes('الصف')) {
          headerRowIdx = i;
          break;
        }
      }

      const startIdx = headerRowIdx === -1 ? 0 : headerRowIdx + 1;
      const headers = headerRowIdx === -1 ? [] : rows[headerRowIdx].map(h => String(h || '').trim());

      let nameIdx = -1, phoneIdx = -1, gradeIdx = -1, sectionIdx = -1;

      headers.forEach((h, idx) => {
        const txt = h.toLowerCase();
        if (txt.includes('اسم') || txt.includes('طالب')) nameIdx = idx;
        else if (txt.includes('جوال') || txt.includes('هاتف')) phoneIdx = idx;
        else if (txt.includes('صف') || txt.includes('مستوى') || txt.includes('grade')) gradeIdx = idx;
        else if (txt.includes('فصل') || txt.includes('شعبة') || txt.includes('section')) sectionIdx = idx;
      });

      // إذا لم يجد الأعمدة، نحاول تخمينها بالترتيب الشائع
      if (nameIdx === -1) nameIdx = 0;
      if (gradeIdx === -1) gradeIdx = 1;
      if (sectionIdx === -1) sectionIdx = 2;

      const extracted: Student[] = [];
      const classKeys = new Set<string>();

      for (let i = startIdx; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 2) continue;

        let rawName = String(row[nameIdx] || '').trim();
        let rawGrade = String(row[gradeIdx] || '').trim();
        let rawSection = String(row[sectionIdx] || '').trim();
        let phone = String(row[phoneIdx] || '').trim();

        if (!rawName || rawName === 'الاسم' || rawName.length < 3) continue;

        // تنظيف الصف
        let grade = cleanGradeName(rawGrade);
        let section = rawSection.replace(/[^0-9أ-ي]/g, '').trim();

        // معالجة حالة الدمج (الصف/الفصل) في خلية واحدة
        if (rawGrade && !section) {
           const separators = ['/', '-', ' ', '\\'];
           for (const sep of separators) {
             if (rawGrade.includes(sep)) {
               const parts = rawGrade.split(sep);
               grade = cleanGradeName(parts[0]);
               section = parts[1].replace(/[^0-9أ-ي]/g, '').trim();
               if (grade && section) break;
             }
           }
        }

        if (!section) section = "1";
        if (!grade) grade = "غير محدد";

        extracted.push({
          id: `std-${Date.now()}-${i}`,
          name: rawName,
          phoneNumber: phone,
          grade,
          section,
          schoolId
        });
        
        classKeys.add(`${grade}|${section}`);
      }

      if (extracted.length > 0) {
        setImportSummary({ 
          count: extracted.length, 
          classCount: classKeys.size,
          samples: extracted.slice(0, 3).map(s => `${s.name} (${s.grade} - فصل ${s.section})`) 
        });
        setTempImportData(extracted);
      } else {
        setImportError('لم نستطع قراءة البيانات بشكل صحيح. يرجى التأكد من أسماء الأعمدة.');
      }
    } catch (err) {
      setImportError('خطأ فني في معالجة الملف.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAndSave = async () => {
    if (!tempImportData) return;
    setIsProcessing(true);
    await db.saveBulkStudents(tempImportData);
    await loadData();
    setShowImport(false);
    setTempImportData(null);
    setIsProcessing(false);
  };

  const handleDeleteAll = async () => {
    if (confirm('سيتم مسح كافة البيانات للبدء من جديد. هل أنت متأكد؟')) {
      setLoading(true);
      await db.deleteAllStudents(schoolId);
      await loadData();
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.includes(searchTerm) || s.grade.includes(searchTerm));
  }, [students, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-[2rem] border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-xl"><Users size={32} /></div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">إدارة الطلاب</h2>
            <p className="text-slate-400 font-bold text-sm">إجمالي الطلاب: {students.length} | الفصول المكتشفة: {new Set(students.map(s => `${s.grade}|${s.section}`)).size}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={handleDeleteAll} className="flex-1 md:flex-none bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm">
            <Trash2 size={20} /> تفريغ البيانات
          </button>
          <button onClick={() => { setImportError(''); setImportSummary(null); setShowImport(true); }} className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg">
            <FileSpreadsheet size={20} /> استيراد الطلاب
          </button>
        </div>
      </div>

      <div className="card-neo overflow-hidden flex flex-col relative min-h-[500px]">
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
             <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        )}

        <div className="p-6 border-b bg-slate-50/30">
          <div className="relative max-w-md">
            <Search className="absolute right-4 top-4 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن اسم طالب أو صف..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white p-4 pr-12 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
            />
          </div>
        </div>

        <div className="table-container flex-1">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b">
              <tr>
                <th className="p-6">اسم الطالب</th>
                <th className="p-6 text-center">الصف</th>
                <th className="p-6 text-center">الفصل</th>
                <th className="p-6 text-center">الجوال</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={4} className="p-32 text-center text-slate-300 font-bold italic">لا توجد بيانات طلاب حالياً.</td></tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="p-6 font-black text-slate-700">{s.name}</td>
                    <td className="p-6 text-center"><span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-xl text-xs font-black">{s.grade}</span></td>
                    <td className="p-6 text-center font-black text-slate-500">{s.section}</td>
                    <td className="p-6 text-center font-mono text-xs text-slate-400">{s.phoneNumber || '---'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[3.5rem] max-w-xl w-full shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3"><FileSpreadsheet className="text-emerald-600" /> استيراد الطلاب</h3>
                <button onClick={() => setShowImport(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={28} /></button>
             </div>

             {importError && (
               <div className="mb-6 p-5 bg-rose-50 text-rose-600 rounded-[1.5rem] flex items-center gap-4 font-bold border border-rose-100 animate-in shake">
                  <AlertTriangle size={24} /> {importError}
               </div>
             )}

             {!importSummary ? (
               <div className="border-4 border-dashed rounded-[3rem] h-80 flex flex-col items-center justify-center bg-slate-50 group hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => e.target.files?.[0] && processExcelFile(e.target.files[0])} />
                  <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Upload size={32} className="text-slate-300 group-hover:text-indigo-600" /></div>
                  <p className="text-slate-500 font-black text-center px-10">اختر ملف Excel يحتوي على بيانات الطلاب<br/><span className="text-xs text-slate-300 font-bold mt-2 block">سيتجاهل النظام تلقائياً أي نصوص إنجليزية بجوار الصفوف</span></p>
               </div>
             ) : (
               <div className="space-y-6">
                  <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 shadow-inner text-center">
                    <h4 className="text-xl font-black text-emerald-900 mb-2">تحليل الملف ناجح!</h4>
                    <p className="text-sm font-bold text-emerald-600 mb-6">وجدنا {importSummary.count} طالباً موزعين على {importSummary.classCount} فصلاً دراسياً دقيقاً.</p>
                    <div className="space-y-2 mb-8 text-right">
                       <p className="text-[10px] font-black text-slate-400 mb-2">أمثلة على الفصول المكتشفة:</p>
                       {importSummary.samples.map((s, i) => (
                         <div key={i} className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center gap-3 font-black text-emerald-800 text-xs">
                            <CheckCircle2 size={14} /> {s}
                         </div>
                       ))}
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => {setImportSummary(null); setTempImportData(null);}} className="flex-1 py-4 bg-white text-slate-600 rounded-2xl font-black border hover:bg-slate-50 transition">تغيير الملف</button>
                       <button onClick={confirmAndSave} disabled={isProcessing} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-emerald-700 transition shadow-xl">
                          {isProcessing ? <Loader2 className="animate-spin" /> : <><CheckCircle2 /> استيراد {importSummary.classCount} فصلاً</>}
                       </button>
                    </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
