
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

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    setImportError('');
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
      
      if (rows.length < 1) {
        setImportError('الملف فارغ.');
        setIsProcessing(false);
        return;
      }

      let headerRowIdx = -1;
      for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const rowStr = rows[i].join(' ').toLowerCase();
        if (rowStr.includes('اسم') || rowStr.includes('طالب') || rowStr.includes('جوال') || rowStr.includes('صف') || rowStr.includes('فصل')) {
          headerRowIdx = i;
          break;
        }
      }

      const startIdx = headerRowIdx === -1 ? 0 : headerRowIdx + 1;
      const headers = headerRowIdx === -1 ? [] : rows[headerRowIdx].map(h => String(h || '').trim());

      let nameIdx = -1, phoneIdx = -1, gradeIdx = -1, sectionIdx = -1;

      headers.forEach((h, idx) => {
        const txt = h.toLowerCase();
        // توسيع كلمات البحث لتشمل كافة الاحتمالات في الملفات المدرسية
        if (txt.includes('اسم') || txt.includes('الطالب')) nameIdx = idx;
        else if (txt.includes('جوال') || txt.includes('هاتف') || (txt.includes('رقم') && !txt.includes('فصل') && !txt.includes('صف'))) phoneIdx = idx;
        else if (txt.includes('صف') || txt.includes('مستوى') || txt.includes('المرحلة')) gradeIdx = idx;
        else if (txt.includes('فصل') || txt.includes('شعبة') || txt.includes('قسم') || txt.includes('مجموعة')) sectionIdx = idx;
      });

      const extracted: Student[] = [];
      const classCheck = new Set();

      for (let i = startIdx; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        let name = String(row[nameIdx] || '').trim();
        let phone = String(row[phoneIdx] || '').trim();
        let grade = String(row[gradeIdx] || '').trim();
        let section = String(row[sectionIdx] || '').trim();

        // تجنب الصفوف الفارغة أو العناوين المكررة
        if (!name || name === 'اسم الطالب' || name.length < 2) continue;

        // ذكاء اصطناعي مبسط: إذا كان "الصف" يحتوي على علامة (/) أو (-) مثل "أول/2"
        if (grade && !section) {
          const separators = ['/', '-', '\\', ' ', '_'];
          for (const sep of separators) {
            if (grade.includes(sep)) {
              const parts = grade.split(sep);
              if (parts.length >= 2) {
                grade = parts[0].trim();
                section = parts[1].trim();
                break;
              }
            }
          }
        }

        // إذا ظل القسم فارغاً بعد كل المحاولات، نعطيه افتراضياً 1 لتمييزه
        if (!section) section = "1";

        extracted.push({
          id: `std-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          name,
          phoneNumber: phone,
          grade,
          section,
          schoolId
        });
        
        classCheck.add(`${grade}|${section}`);
      }

      if (extracted.length > 0) {
        setImportSummary({ 
          count: extracted.length, 
          classCount: classCheck.size,
          samples: extracted.slice(0, 3).map(s => `${s.name} (${s.grade} - فصل ${s.section})`) 
        });
        setTempImportData(extracted);
      } else {
        setImportError('لم يتم العثور على بيانات طلاب. تأكد من وجود أعمدة (الاسم، الصف، الفصل).');
      }
    } catch (err) {
      setImportError('خطأ في معالجة الملف. تأكد أنه ملف Excel صالح.');
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
    if (confirm('سيتم حذف كافة الطلاب والفصول المرتبطة بهم للبدء من جديد. هل أنت متأكد؟')) {
      setLoading(true);
      await db.deleteAllStudents(schoolId);
      await loadData();
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.grade.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-[2rem] border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-xl"><Users size={32} /></div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">إدارة الطلاب</h2>
            <p className="text-slate-400 font-bold text-sm tracking-tight">إجمالي الطلاب: {students.length} | الفصول المكتشفة: {new Set(students.map(s => `${s.grade}|${s.section}`)).size}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={handleDeleteAll} className="flex-1 md:flex-none bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm">
            <Trash2 size={20} /> تفريغ البيانات
          </button>
          <button onClick={() => { setImportError(''); setImportSummary(null); setShowImport(true); }} className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg">
            <FileSpreadsheet size={20} /> استيراد Excel
          </button>
          <button onClick={() => { setEditingStudent(null); setFormData({name:'', grade:'', section:'', phoneNumber:''}); setShowForm(true); }} className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg">
            <Plus size={20} /> إضافة يدوي
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
              placeholder="ابحث عن طالب أو صف معين..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white p-4 pr-12 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="table-container flex-1">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b">
              <tr>
                <th className="p-6">اسم الطالب</th>
                <th className="p-6 text-center">الصف</th>
                <th className="p-6 text-center">الفصل/الشعبة</th>
                <th className="p-6 text-center">الجوال</th>
                <th className="p-6 text-left">خيارات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-bold italic">لا توجد بيانات طلاب حالياً.</td></tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="p-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><User size={20} /></div>
                          <span className="font-black text-slate-700">{s.name}</span>
                       </div>
                    </td>
                    <td className="p-6 text-center"><span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-xl text-xs font-black">{s.grade}</span></td>
                    <td className="p-6 text-center font-black text-slate-500">{s.section}</td>
                    <td className="p-6 text-center font-mono text-xs text-slate-400">{s.phoneNumber || '---'}</td>
                    <td className="p-6 text-left">
                       <button onClick={() => { setEditingStudent(s); setFormData({name:s.name, grade:s.grade, section:s.section, phoneNumber:s.phoneNumber}); setShowForm(true); }} className="p-3 text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"><Edit2 size={18} /></button>
                    </td>
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
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3"><FileSpreadsheet className="text-emerald-600" /> استيراد من ملف Excel</h3>
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
                  <p className="text-slate-500 font-black text-center px-10">اختر ملف الطلاب بصيغة Excel<br/><span className="text-xs text-slate-300 font-bold mt-2 block">سيقوم النظام بتفكيك الصفوف والفصول تلقائياً</span></p>
               </div>
             ) : (
               <div className="space-y-6">
                  <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 shadow-inner">
                    <h4 className="text-xl font-black text-emerald-900 mb-2">تم قراءة البيانات!</h4>
                    <p className="text-sm font-bold text-emerald-600 mb-6">وجدنا {importSummary.count} طالباً موزعين على {importSummary.classCount} فصلاً دراسياً.</p>
                    <div className="space-y-2 mb-8">
                       {importSummary.samples.map((s, i) => (
                         <div key={i} className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center gap-3 font-black text-emerald-800 text-xs">
                            <CheckCircle2 size={14} /> {s}
                         </div>
                       ))}
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => {setImportSummary(null); setTempImportData(null);}} className="flex-1 py-4 bg-white text-slate-600 rounded-2xl font-black border hover:bg-slate-50 transition">تغيير الملف</button>
                       <button onClick={confirmAndSave} disabled={isProcessing} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-emerald-700 transition shadow-xl">
                          {isProcessing ? <Loader2 className="animate-spin" /> : <><CheckCircle2 /> تأكيد واستيراد الفصول</>}
                       </button>
                    </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}
      {/* ... بقية كود النموذج اليدوي يبقى كما هو ... */}
    </div>
  );
};

export default StudentsManagement;
