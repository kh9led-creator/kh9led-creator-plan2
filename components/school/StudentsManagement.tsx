
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
  const [showImport, setShowImport] = useState(false);
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

  // محلل ذكي مطور لاستخلاص الصفوف (خاصة رابع وخامس وسادس) وتجاهل الإنجليزي
  const cleanGradeName = (rawName: string): string => {
    let name = rawName.trim();
    if (!name) return "غير محدد";

    // مصفوفة الكلمات المفتاحية بالترتيب
    const gradeMap: Record<string, string> = {
      'أول': 'الأول الابتدائي', 'اول': 'الأول الابتدائي',
      'ثاني': 'الثاني الابتدائي', 'ثان': 'الثاني الابتدائي',
      'ثالث': 'الثالث الابتدائي',
      'رابع': 'الرابع الابتدائي',
      'خامس': 'الخامس الابتدائي',
      'سادس': 'السادس الابتدائي',
      'Primary 4': 'الرابع الابتدائي',
      'Primary 5': 'الخامس الابتدائي',
      'Primary 6': 'السادس الابتدائي'
    };

    // البحث عن الجذر العربي أولاً
    for (const key in gradeMap) {
      if (name.includes(key)) {
        return gradeMap[key];
      }
    }

    // إذا لم يجد، يقوم بحذف الحروف الإنجليزية والرموز والإبقاء على النص العربي
    const arabicOnly = name.replace(/[a-zA-Z]/g, '').replace(/[0-9]/g, '').replace(/[^\u0621-\u064A\s]/g, '').trim();
    return arabicOnly || name;
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

        let grade = cleanGradeName(rawGrade);
        let section = rawSection.replace(/[^0-9أ-ي]/g, '').trim() || "1";

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
          samples: extracted.slice(0, 3).map(s => `${s.name} (${s.grade} - ${s.section})`) 
        });
        setTempImportData(extracted);
      } else {
        setImportError('لم يتم العثور على بيانات طلاب. تأكد من مسميات الأعمدة.');
      }
    } catch (err) {
      setImportError('خطأ في قراءة ملف الإكسل.');
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
    if (confirm('سيتم حذف جميع الطلاب الحاليين، هل أنت متأكد؟')) {
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
            <p className="text-slate-400 font-bold text-sm">عدد الطلاب: {students.length} | الفصول: {new Set(students.map(s => `${s.grade}|${s.section}`)).size}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={handleDeleteAll} className="flex-1 md:flex-none bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl font-black hover:bg-rose-600 hover:text-white transition-all border border-rose-100">
            <Trash2 size={20} className="inline ml-2" /> حذف الكل
          </button>
          <button onClick={() => setShowImport(true)} className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg">
            <FileSpreadsheet size={20} className="inline ml-2" /> استيراد ملف نور
          </button>
        </div>
      </div>

      <div className="card-neo overflow-hidden flex flex-col relative min-h-[400px]">
        {loading && <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>}
        <div className="p-6 border-b bg-slate-50/30">
          <div className="relative max-w-md">
            <Search className="absolute right-4 top-4 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن طالب أو صف..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white p-4 pr-12 rounded-2xl border font-bold outline-none focus:ring-4 focus:ring-indigo-50"
            />
          </div>
        </div>

        <div className="table-container flex-1">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-400 text-xs font-black uppercase border-b">
              <tr>
                <th className="p-6">اسم الطالب</th>
                <th className="p-6 text-center">الصف الدراسي</th>
                <th className="p-6 text-center">الفصل</th>
                <th className="p-6 text-center">الجوال</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map(s => (
                <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="p-6 font-black text-slate-700">{s.name}</td>
                  <td className="p-6 text-center"><span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-xl text-xs font-black">{s.grade}</span></td>
                  <td className="p-6 text-center font-black text-slate-500">{s.section}</td>
                  <td className="p-6 text-center font-mono text-xs text-slate-400">{s.phoneNumber || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[3.5rem] max-w-xl w-full shadow-2xl">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900">استيراد البيانات الذكي</h3>
                <button onClick={() => setShowImport(false)} className="p-2 text-slate-400 hover:text-rose-500"><X size={28} /></button>
             </div>

             {!importSummary ? (
               <div className="border-4 border-dashed rounded-[3rem] h-64 flex flex-col items-center justify-center bg-slate-50 hover:bg-indigo-50 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => e.target.files?.[0] && processExcelFile(e.target.files[0])} />
                  <Upload size={48} className="text-slate-300 mb-4" />
                  <p className="text-slate-500 font-black">اضغط لرفع ملف الإكسل المستخرج من نور</p>
                  <p className="text-xs text-slate-400 mt-2 font-bold">سيتعرف النظام تلقائياً على رابع وخامس وسادس حتى مع وجود الإنجليزي</p>
               </div>
             ) : (
               <div className="space-y-6">
                  <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 text-center">
                    <h4 className="text-xl font-black text-emerald-900 mb-2">تم تحليل الملف بنجاح!</h4>
                    <p className="text-sm font-bold text-emerald-600 mb-6">وجدنا {importSummary.count} طالباً موزعين على {importSummary.classCount} فصلاً.</p>
                    <div className="flex gap-4">
                       <button onClick={() => setImportSummary(null)} className="flex-1 py-4 bg-white text-slate-600 rounded-2xl font-black border">تراجع</button>
                       <button onClick={confirmAndSave} disabled={isProcessing} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl">
                          {isProcessing ? <Loader2 className="animate-spin inline ml-2" /> : <CheckCircle2 className="inline ml-2" />} تأكيد الاستيراد
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
