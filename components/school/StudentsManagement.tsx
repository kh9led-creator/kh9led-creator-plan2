
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '../../constants.tsx';
import { Student } from '../../types.ts';
import * as XLSX from 'xlsx';
import { 
  Plus, Search, Trash2, CheckCircle2, 
  X, Sparkles, Loader2, User, 
  Eraser, FileSpreadsheet, Upload, 
  Edit2, Users, AlertCircle, Wand2, 
  FileUp, Check, Info
} from 'lucide-react';

const StudentsManagement: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [importError, setImportError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStudents(db.getStudents(schoolId));
  }, [schoolId]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleSave = () => {
    if (!formData.name) return;
    const studentData = { ...formData, id: editingStudent ? editingStudent.id : Date.now().toString(), schoolId };
    db.saveStudent(studentData as any);
    setStudents(db.getStudents(schoolId));
    setShowForm(false);
    db.syncClassesFromStudents(schoolId);
  };

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    setImportError('');
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // تحويل لصفوف (مصفوفة من المصفوفات) للحصول على تحكم كامل
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (rows.length < 2) {
        setImportError('الملف يبدو فارغاً أو لا يحتوي على بيانات كافية.');
        setIsProcessing(false);
        return;
      }

      const newStudents: any[] = [];
      let colIdx = { phone: -1, section: -1, grade: -1, name: -1 };
      let headersFound = false;

      // 1. البحث عن سطر الترويسة في أول 20 سطر (لتجاوز أي شعارات أو عناوين في الملف)
      for (let i = 0; i < Math.min(rows.length, 20); i++) {
        const row = rows[i];
        if (!row) continue;
        
        row.forEach((cell, idx) => {
          const val = String(cell || '').trim();
          if (val.includes("جوال") || val.includes("هاتف") || val.includes("Mobile")) colIdx.phone = idx;
          if (val.includes("فصل") || val.includes("Section") || val.includes("رقم الصف")) colIdx.section = idx;
          if (val.includes("صف") || val.includes("Grade") || (val.includes("رقم") && val.includes("الصف"))) colIdx.grade = idx;
          if (val.includes("اسم") || val.includes("طالب") || val.includes("Name")) colIdx.name = idx;
        });

        // إذا وجدنا الاسم على الأقل، نعتبر هذا هو سطر الترويسة
        if (colIdx.name !== -1) {
          headersFound = true;
          // ابدأ المعالجة من السطر التالي لهذا السطر
          processDataRows(rows.slice(i + 1));
          break;
        }
      }

      // 2. محاولة التخمين إذا لم نجد ترويسة واضحة
      if (!headersFound) {
        processDataRows(rows);
      }

      function processDataRows(dataRows: any[][]) {
        dataRows.forEach(row => {
          if (!row || row.length === 0) return;

          let name = '', grade = '', section = '1', phone = '';

          if (headersFound) {
            name = String(row[colIdx.name] || '').trim();
            grade = colIdx.grade !== -1 ? String(row[colIdx.grade] || '').trim() : '';
            section = colIdx.section !== -1 ? String(row[colIdx.section] || '1').trim() : '1';
            phone = colIdx.phone !== -1 ? String(row[colIdx.phone] || '').trim() : '';
          } else {
            // تخمين ذكي بناءً على المحتوى
            row.forEach(cell => {
              const val = String(cell || '').trim();
              if (/^(966|05|5)[0-9]{8,12}$/.test(val.replace(/\s/g, ''))) phone = val;
              else if (val.includes("ابتدائي") || val.includes("متوسط") || val.includes("_")) grade = val;
              else if (val.length > 5 && !name) name = val;
              else if (/^[0-9]{1,2}$/.test(val) && !section) section = val;
            });
          }

          // تنظيف نهائي
          if (name && name.length > 2 && !name.includes("اسم الطالب")) {
            newStudents.push({
              id: (Date.now() + Math.random()).toString(),
              name: name.replace(/\s+/g, ' ').replace(/[0-9]/g, '').trim(),
              grade: grade.replace(/_/g, ' ') || 'غير محدد',
              section: section || '1',
              phoneNumber: phone,
              schoolId: schoolId
            });
          }
        });
      }

      if (newStudents.length > 0) {
        const currentAll = JSON.parse(localStorage.getItem('madrasati_students') || '[]');
        localStorage.setItem('madrasati_students', JSON.stringify([...currentAll, ...newStudents]));
        setStudents(db.getStudents(schoolId));
        db.syncClassesFromStudents(schoolId);
        setShowImport(false);
        alert(`تم بنجاح! استيراد ${newStudents.length} طالباً بنظام المعالجة الذكية لملفات إكسل.`);
      } else {
        setImportError('لم يتم العثور على بيانات طلاب صالحة داخل الملف. تأكد من جودة الملف.');
      }
    } catch (err) {
      console.error(err);
      setImportError('فشل قراءة ملف الإكسل. تأكد من أنه غير محمي بكلمة مرور.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100"><Users size={28} /></div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">شؤون الطلاب</h2>
            <p className="text-slate-400 font-bold text-sm">إجمالي المسجلين: {students.length} طالب</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={() => {
              if (confirm('تنبيه: سيتم حذف كافة الطلاب المسجلين حالياً لهذه المدرسة. هل أنت متأكد؟')) {
                const all = JSON.parse(localStorage.getItem('madrasati_students') || '[]');
                const filtered = all.filter((s: any) => s.schoolId !== schoolId);
                localStorage.setItem('madrasati_students', JSON.stringify(filtered));
                setStudents([]);
                db.syncClassesFromStudents(schoolId);
              }
            }} 
            className="p-3.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center justify-center gap-2 font-bold text-sm"
          >
            <Trash2 size={18} />
          </button>
          <button onClick={() => setShowImport(true)} className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-md text-sm border border-emerald-500/20">
            <FileSpreadsheet size={18} className="text-white" /> استيراد إكسل مباشر
          </button>
          <button onClick={() => { setEditingStudent(null); setFormData({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' }); setShowForm(true); }} className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-md text-sm">
            <Plus size={18} /> إضافة طالب
          </button>
        </div>
      </div>

      <div className="card-neo overflow-hidden">
        <div className="p-6 border-b bg-slate-50/20">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute right-4 top-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو الصف..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" 
            />
          </div>
        </div>
        
        <div className="table-container">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-5 border-l border-slate-50">اسم الطالب</th>
                <th className="p-5 border-l border-slate-50 text-center">الصف</th>
                <th className="p-5 border-l border-slate-50 text-center">الفصل</th>
                <th className="p-5 border-l border-slate-50 text-center">الجوال</th>
                <th className="p-5 text-left">خيارات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold">لا توجد بيانات طلاب حالياً.</td></tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-5 border-l border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">{s.name[0]}</div>
                        <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-5 border-l border-slate-50 text-center">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold border border-blue-100">{s.grade}</span>
                    </td>
                    <td className="p-5 border-l border-slate-50 text-center">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold">فصل {s.section}</span>
                    </td>
                    <td className="p-5 border-l border-slate-50 text-center font-mono text-sm text-slate-500">{s.phoneNumber || '---'}</td>
                    <td className="p-5 text-left">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingStudent(s); setFormData({ name: s.name, grade: s.grade, section: s.section, phoneNumber: s.phoneNumber }); setShowForm(true); }} className="p-2.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => { if (confirm('حذف؟')) { const all = JSON.parse(localStorage.getItem('madrasati_students') || '[]'); localStorage.setItem('madrasati_students', JSON.stringify(all.filter((st: any) => st.id !== s.id))); setStudents(db.getStudents(schoolId)); db.syncClassesFromStudents(schoolId); } }} className="p-2.5 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-500 hover:text-white transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4" onDragEnter={handleDrag}>
          <div className="bg-white p-8 md:p-10 rounded-[3rem] max-w-2xl w-full shadow-2xl animate-in zoom-in-95 border border-white/20">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100"><FileUp size={28} /></div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900">استيراد إكسل ذكي</h3>
                      <p className="text-xs text-slate-400 font-bold mt-1">ارفع ملفك وسيقوم النظام بتحليله آلياً.</p>
                   </div>
                </div>
                <button onClick={() => setShowImport(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500 transition-colors"><X size={24} /></button>
             </div>

             <div className="space-y-6">
                <div 
                  className={`relative h-64 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-300 ${dragActive ? 'border-emerald-500 bg-emerald-50 scale-[1.02]' : 'border-slate-100 bg-slate-50 hover:border-emerald-200'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept=".xlsx, .xls, .csv" 
                    onChange={(e) => e.target.files?.[0] && processExcelFile(e.target.files[0])}
                  />
                  
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in">
                       <Loader2 className="animate-spin text-emerald-600" size={48} />
                       <p className="text-emerald-700 font-black">جاري تحليل بيانات الطلاب...</p>
                    </div>
                  ) : (
                    <>
                       <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-emerald-600 shadow-sm mb-4">
                          <Upload size={36} />
                       </div>
                       <p className="text-slate-700 font-black text-lg">اسحب ملف الإكسل هنا</p>
                       <p className="text-slate-400 font-bold text-xs mt-1">أو انقر لاختيار ملف من جهازك</p>
                       <button onClick={() => fileInputRef.current?.click()} className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-lg hover:bg-emerald-700 transition-all active:scale-95">اختيار ملف</button>
                    </>
                  )}
                </div>

                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex gap-4">
                   <div className="text-blue-600 shrink-0 mt-0.5"><Info size={20} /></div>
                   <div className="space-y-1">
                      <h4 className="text-sm font-black text-blue-900">لماذا الاستيراد الذكي؟</h4>
                      <p className="text-[11px] text-blue-800/70 font-bold leading-relaxed">
                        لا تشغل بالك بترتيب الأعمدة؛ النظام يبحث تلقائياً عن (اسم الطالب، الجوال، الصف، الفصل) في أي مكان داخل الملف ويقوم بتنظيفها لك.
                      </p>
                   </div>
                </div>

                {importError && (
                  <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-xs font-black animate-in shake">
                    <AlertCircle size={16} /> {importError}
                  </div>
                )}

                <div className="flex gap-4">
                   <button onClick={() => setShowImport(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black transition-all hover:bg-slate-200">إلغاء</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl animate-in zoom-in-95 border border-slate-50">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><User size={20} /></div>
                  <h3 className="text-xl font-black text-slate-900">{editingStudent ? 'تعديل طالب' : 'إضافة طالب'}</h3>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={22} /></button>
             </div>
             <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 mr-1">الاسم الكامل</label>
                  <input placeholder="أدخل الاسم..." className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 mr-1">الصف</label>
                    <input placeholder="مثال: الأول الابتدائي" className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-sm" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 mr-1">الفصل</label>
                    <input placeholder="1" className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-sm" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 mr-1">رقم الجوال</label>
                  <input placeholder="05xxxxxxxx" className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all text-left shadow-sm" value={formData.phoneNumber} dir="ltr" onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                </div>
                <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4 flex items-center justify-center gap-2">
                  <CheckCircle2 size={22} />
                  {editingStudent ? 'حفظ التعديلات' : 'حفظ الطالب'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
