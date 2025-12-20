
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '../../constants.tsx';
import { Student } from '../../types.ts';
import * as XLSX from 'xlsx';
import { 
  Plus, Search, Trash2, CheckCircle2, 
  X, Sparkles, Loader2, User, 
  FileSpreadsheet, Upload, 
  Edit2, Users, AlertCircle, 
  FileUp, Info, Eraser, Phone
} from 'lucide-react';

const StudentsManagement: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempImportData, setTempImportData] = useState<Student[] | null>(null);
  const [importSummary, setImportSummary] = useState<{count: number, samples: string[]} | null>(null);
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
      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = workbook.Sheets[firstSheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
      
      if (rows.length < 2) {
        setImportError('الملف فارغ أو لا يحتوي على بيانات كافية.');
        setIsProcessing(false);
        return;
      }

      // @google/genai: الكشف الذكي عن الأعمدة بناءً على العناوين في الصف الأول
      const headers = rows[0].map(h => String(h || '').trim());
      let nameIdx = -1, phoneIdx = -1, gradeIdx = -1, sectionIdx = -1;

      headers.forEach((h, idx) => {
        const headerText = h.toLowerCase();
        if (headerText.includes('اسم') || headerText.includes('الطالب') || headerText.includes('الاسم')) nameIdx = idx;
        if (headerText.includes('جوال') || headerText.includes('هاتف') || headerText.includes('رقم') || headerText.includes('موبايل')) phoneIdx = idx;
        if (headerText.includes('صف') || headerText.includes('المستوى') || headerText.includes('الدرجة')) gradeIdx = idx;
        if (headerText.includes('فصل') || headerText.includes('مجموعة') || headerText.includes('قسم')) sectionIdx = idx;
      });

      // إعداد افتراضي إذا لم يتم العثور على العناوين (متوافق مع نظام نور أو الترتيب الشائع)
      if (nameIdx === -1) nameIdx = 0;
      if (phoneIdx === -1) phoneIdx = 1;
      if (gradeIdx === -1) gradeIdx = 2;
      if (sectionIdx === -1) sectionIdx = 3;

      const extracted: Student[] = [];
      const timestamp = Date.now().toString(36);

      // البدء من الصف الثاني لتجاهل العناوين
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const name = String(row[nameIdx] || '').trim();
        const phoneNumber = String(row[phoneIdx] || '').trim();
        const grade = String(row[gradeIdx] || 'غير محدد').trim();
        const section = String(row[sectionIdx] || '1').trim();

        // تجنب استيراد صف العناوين إذا تكرر أو كان يحتوي على كلمات العناوين
        if (name && name !== 'اسم الطالب' && name !== 'الاسم' && name.length >= 2) {
          extracted.push({
            id: `s-${timestamp}-${i}-${Math.random().toString(36).substr(2, 5)}`,
            name,
            phoneNumber,
            grade,
            section,
            schoolId
          });
        }
      }

      if (extracted.length > 0) {
        setImportSummary({ 
          count: extracted.length, 
          samples: extracted.slice(0, 3).map(s => `${s.name} (${s.grade})`) 
        });
        setTempImportData(extracted);
      } else {
        setImportError('لم يتم العthور على بيانات طلاب صالحة. يرجى التأكد من محتوى الملف.');
      }
    } catch (err) { 
      setImportError('حدث خطأ أثناء معالجة الملف. تأكد من أنه ملف Excel سليم.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAndSave = async () => {
    if (!tempImportData || tempImportData.length === 0) return;
    setIsProcessing(true);
    try {
      await db.saveBulkStudents(tempImportData);
      await loadData();
      setShowImport(false);
      setTempImportData(null);
      setImportSummary(null);
      alert(`تم بنجاح استيراد ${tempImportData.length} طالباً بنجاح.`);
    } catch (err: any) {
      setImportError(err.message || 'حدث خطأ أثناء الحفظ.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAll = async () => {
    if (students.length === 0) return;
    if (confirm('تحذير: هل أنت متأكد من حذف كافة الطلاب؟ سيؤدي ذلك لتفريغ القائمة تماماً.')) {
      setLoading(true);
      await db.deleteAllStudents(schoolId);
      await loadData();
    }
  };

  const handleSaveManual = async () => {
    if (!formData.name.trim()) return alert('الاسم مطلوب');
    const student: Student = {
      id: editingStudent ? editingStudent.id : `m-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ...formData,
      schoolId
    };
    await db.saveStudent(student);
    await loadData();
    setShowForm(false);
    setEditingStudent(null);
    setFormData({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Users size={28} /></div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">إدارة الطلاب</h2>
            <p className="text-slate-400 font-bold text-sm">الإجمالي: {students.length} طالب مسجل</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {students.length > 0 && (
            <button onClick={handleDeleteAll} className="bg-rose-50 text-rose-600 px-5 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-600 hover:text-white transition shadow-sm border border-rose-100 text-sm">
              <Eraser size={18} /> تفريغ القائمة
            </button>
          )}
          <button onClick={() => { setImportError(''); setImportSummary(null); setShowImport(true); }} className="bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition shadow-md text-sm">
            <FileSpreadsheet size={18} /> استيراد من Excel
          </button>
          <button onClick={() => { setEditingStudent(null); setFormData({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' }); setShowForm(true); }} className="bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-md text-sm">
            <Plus size={18} /> إضافة طالب جديد
          </button>
        </div>
      </div>

      <div className="card-neo overflow-hidden min-h-[400px] flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
             <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <span className="font-black text-slate-600">جاري معالجة البيانات...</span>
             </div>
          </div>
        )}
        
        <div className="p-6 border-b bg-slate-50/20">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute right-4 top-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث بالاسم، الصف، أو الفصل..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" 
            />
          </div>
        </div>
        
        <div className="table-container flex-1">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-5 text-right">اسم الطالب</th>
                <th className="p-5 text-center">الصف الدراسي</th>
                <th className="p-5 text-center">الفصل</th>
                <th className="p-5 text-center">الجوال</th>
                <th className="p-5 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 && !loading ? (
                <tr><td colSpan={5} className="p-24 text-center text-slate-300 font-bold italic">لا توجد بيانات طلاب حالياً في هذا القسم.</td></tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="p-5">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><User size={18} /></div>
                          <span className="font-bold text-slate-700">{s.name}</span>
                       </div>
                    </td>
                    <td className="p-5 text-center"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-black">{s.grade}</span></td>
                    <td className="p-5 text-center font-bold text-slate-500">{s.section}</td>
                    <td className="p-5 text-center font-mono text-xs text-slate-400">{s.phoneNumber || '---'}</td>
                    <td className="p-5 text-left">
                       <button onClick={() => { setEditingStudent(s); setFormData({name:s.name, grade:s.grade, section:s.section, phoneNumber:s.phoneNumber}); setShowForm(true); }} className="p-2.5 text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[3rem] max-w-xl w-full shadow-2xl animate-in zoom-in-95 overflow-hidden">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><FileSpreadsheet size={24} /></div>
                   <h3 className="text-xl font-black text-slate-900">استيراد ذكي من Excel</h3>
                </div>
                <button onClick={() => setShowImport(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
             </div>

             {importError && (
               <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 font-bold text-xs border border-rose-100 animate-in shake duration-300">
                  <AlertCircle size={18} /> {importError}
               </div>
             )}

             {!importSummary ? (
               <div className="border-4 border-dashed rounded-[2.5rem] h-72 flex flex-col items-center justify-center bg-slate-50 relative group transition-all hover:bg-slate-100">
                  <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => e.target.files?.[0] && processExcelFile(e.target.files[0])} />
                  <Upload size={48} className="text-slate-300 mb-4 group-hover:text-indigo-400 transition-colors" />
                  <p className="text-slate-500 font-bold text-sm mb-2 text-center px-8">اختر ملف Excel لاستيراد الطلاب</p>
                  <p className="text-[10px] text-slate-400 font-bold mb-6 text-center px-10 leading-relaxed">سيقوم النظام تلقائياً بتحديد أعمدة الاسم، الجوال، الصف، والفصل بناءً على العناوين الموجودة بالملف.</p>
                  <button onClick={() => fileInputRef.current?.click()} className="px-10 py-3.5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition shadow-lg active:scale-95">اختيار الملف</button>
               </div>
             ) : (
               <div className="space-y-6">
                  <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="text-lg font-black text-emerald-900">تحليل الملف ناجح</h4>
                       <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-black">{importSummary.count} سجل</span>
                    </div>
                    <p className="text-xs font-bold text-emerald-600 mb-4">نماذج من البيانات التي سيتم استيرادها:</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                       {importSummary.samples.map((sample, i) => <span key={i} className="bg-white px-3 py-1.5 rounded-xl text-[10px] font-black text-emerald-800 border border-emerald-200">{sample}</span>)}
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => {setImportSummary(null); setTempImportData(null);}} className="flex-1 py-4 bg-white text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition border">إلغاء</button>
                       <button onClick={confirmAndSave} disabled={isProcessing} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95">
                          {isProcessing ? <Loader2 className="animate-spin" /> : 'تأكيد الحفظ والمزامنة'}
                       </button>
                    </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[3rem] max-w-lg w-full shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900">{editingStudent ? 'تعديل بيانات طالب' : 'إضافة طالب جديد'}</h3>
                <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
             </div>

             <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 mr-2">اسم الطالب الثلاثي</label>
                  <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 mr-2">الصف الدراسي</label>
                    <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} placeholder="الأول الابتدائي" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 mr-2">رقم الفصل</label>
                    <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} placeholder="1" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 mr-2 flex items-center gap-1.5"><Phone size={12} /> رقم جوال ولي الأمر (اختياري)</label>
                  <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                </div>
                
                <button onClick={handleSaveManual} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-6 active:scale-95">حفظ البيانات</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
