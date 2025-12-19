
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '../../constants.tsx';
import { Student } from '../../types.ts';
import * as XLSX from 'xlsx';
import { 
  Plus, Search, Trash2, CheckCircle2, 
  X, Sparkles, Loader2, User, 
  FileSpreadsheet, Upload, 
  Edit2, Users, AlertCircle, 
  FileUp, Info
} from 'lucide-react';

const StudentsManagement: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempImportData, setTempImportData] = useState<Student[] | null>(null);
  const [importSummary, setImportSummary] = useState<{count: number, samples: string[]} | null>(null);
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

  const HEADER_MAP = {
    name: ['اسم', 'طالب', 'الاسم', 'Name', 'Student', 'الرباعي', 'الكامل'],
    phone: ['جوال', 'هاتف', 'تواصل', 'رقم', 'Mobile', 'Phone', 'اتصال', 'والد'],
    grade: ['صف', 'Grade', 'المستوى', 'السنة', 'الدراسي'],
    section: ['فصل', 'Section', 'مجموعة', 'رقم الصف']
  };

  const cleanPhoneNumber = (val: any): string => {
    if (!val) return '';
    let str = String(val).replace(/\s+/g, '');
    if (str.includes('E') || str.includes('e')) {
      str = Number(val).toLocaleString('fullwide', {useGrouping:false});
    }
    str = str.replace(/[^0-9]/g, '');
    if (str.startsWith('5') && str.length === 9) return '0' + str;
    return str;
  };

  const standardizeGrade = (val: any): string => {
    let s = String(val || '').trim().replace(/_/g, ' ');
    if (s === '1') return 'الأول الابتدائي';
    if (s === '2') return 'الثاني الابتدائي';
    if (s === '3') return 'الثالث الابتدائي';
    if (s === '4') return 'الرابع الابتدائي';
    if (s === '5') return 'الخامس الابتدائي';
    if (s === '6') return 'السادس الابتدائي';
    return s;
  };

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    setImportError('');
    setImportSummary(null);
    setTempImportData(null);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
      
      if (rows.length < 1) throw new Error('الملف فارغ');

      let colMap = { name: -1, phone: -1, grade: -1, section: -1 };
      let startRowIdx = -1;

      for (let i = 0; i < Math.min(rows.length, 50); i++) {
        const row = rows[i];
        row.forEach((cell, idx) => {
          const val = String(cell).toLowerCase().trim();
          if (!val) return;
          if (colMap.name === -1 && HEADER_MAP.name.some(h => val.includes(h.toLowerCase()))) colMap.name = idx;
          if (colMap.phone === -1 && HEADER_MAP.phone.some(h => val.includes(h.toLowerCase()))) colMap.phone = idx;
          if (colMap.grade === -1 && HEADER_MAP.grade.some(h => val.includes(h.toLowerCase()))) colMap.grade = idx;
          if (colMap.section === -1 && HEADER_MAP.section.some(h => val.includes(h.toLowerCase()))) colMap.section = idx;
        });
        if (colMap.name !== -1) { startRowIdx = i + 1; break; }
      }

      const extractedStudents: Student[] = [];
      const rowsToProcess = startRowIdx !== -1 ? rows.slice(startRowIdx) : rows;
      const timestamp = Date.now().toString(36);

      rowsToProcess.forEach((row, index) => {
        let name = '', phone = '', grade = '', section = '1';
        if (colMap.name !== -1) {
          name = String(row[colMap.name] || '').trim();
          phone = colMap.phone !== -1 ? cleanPhoneNumber(row[colMap.phone]) : '';
          grade = colMap.grade !== -1 ? standardizeGrade(row[colMap.grade]) : '';
          section = colMap.section !== -1 ? String(row[colMap.section] || '1').trim() : '1';
        } else {
          row.forEach(cell => {
            const val = String(cell).trim();
            if (/^[0-9+]{8,15}$/.test(val)) phone = cleanPhoneNumber(val);
            else if (val.length > 5 && !name && !/[0-9]/.test(val)) name = val;
          });
        }

        const isHeaderWord = HEADER_MAP.name.some(h => name.toLowerCase() === h.toLowerCase());
        const isNumeric = /^[0-9 ]+$/.test(name);

        if (name && name.length > 3 && !isHeaderWord && !isNumeric) {
          extractedStudents.push({
            // استخدام معرف قصير جداً لتوفير مساحة التخزين
            id: `s${timestamp}${index.toString(36)}`,
            name: name.substring(0, 100), // تقليل الطول في حال وجود نصوص ضخمة
            phoneNumber: phone, 
            grade: grade || 'غير محدد', 
            section: section || '1', 
            schoolId: schoolId
          });
        }
      });

      if (extractedStudents.length > 0) {
        setImportSummary({
          count: extractedStudents.length,
          samples: extractedStudents.slice(0, 3).map(s => s.name)
        });
        setTempImportData(extractedStudents);
      } else {
        setImportError('لم نستطع التعرف على بيانات الطلاب. تأكد أن الملف يحتوي على أسماء في عمود واضح.');
      }
    } catch (err) {
      setImportError('حدث خطأ أثناء قراءة الملف.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAndSave = () => {
    if (!tempImportData || tempImportData.length === 0) return;

    try {
      const STORAGE_KEY = 'madrasati_students';
      const existingRaw = localStorage.getItem(STORAGE_KEY) || '[]';
      let existingStudents = JSON.parse(existingRaw);
      
      // دمج البيانات الجديدة مع القديمة
      const updatedAll = [...existingStudents, ...tempImportData];
      
      // محاولة الحفظ مع ضغط السلسلة النصية (إزالة المسافات)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAll));
      
      setStudents(db.getStudents(schoolId));
      db.syncClassesFromStudents(schoolId);
      
      setShowImport(false);
      setImportSummary(null);
      setTempImportData(null);
      
      alert(`بنجاح! تم حفظ ${tempImportData.length} طالباً.`);
    } catch (e) {
      console.error("Storage Error:", e);
      alert('عذراً، ذاكرة المتصفح ممتلئة. يرجى مسح بعض البيانات القديمة أو استخدام متصفح آخر.');
    }
  };

  const handleSaveManual = () => {
    if (!formData.name || !formData.grade || !formData.section) {
      alert('يرجى تعبئة كافة الحقول الأساسية');
      return;
    }

    const student: Student = {
      id: editingStudent ? editingStudent.id : `m${Date.now().toString(36)}`,
      name: formData.name,
      grade: formData.grade,
      section: formData.section,
      phoneNumber: formData.phoneNumber,
      schoolId: schoolId
    };

    db.saveStudent(student);
    setStudents(db.getStudents(schoolId));
    db.syncClassesFromStudents(schoolId);
    setShowForm(false);
    setEditingStudent(null);
    setFormData({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processExcelFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Users size={28} /></div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">إدارة الطلاب</h2>
            <p className="text-slate-400 font-bold text-sm">إجمالي المسجلين: {students.length}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={() => {
              if (confirm('سيتم مسح كافة الطلاب الحاليين للمدرسة. هل تريد المتابعة؟')) {
                const all = JSON.parse(localStorage.getItem('madrasati_students') || '[]');
                localStorage.setItem('madrasati_students', JSON.stringify(all.filter((s: any) => s.schoolId !== schoolId)));
                setStudents([]);
                db.syncClassesFromStudents(schoolId);
              }
            }} 
            className="p-3.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
          >
            <Trash2 size={18} />
          </button>
          <button onClick={() => { setShowImport(true); setImportSummary(null); setTempImportData(null); }} className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-md text-sm border border-emerald-500/20">
            <FileSpreadsheet size={18} /> استيراد ذكي (Excel)
          </button>
          <button onClick={() => { setEditingStudent(null); setFormData({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' }); setShowForm(true); }} className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-md text-sm">
            <Plus size={18} /> إضافة يدوي
          </button>
        </div>
      </div>

      <div className="card-neo overflow-hidden">
        <div className="p-6 border-b bg-slate-50/20 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute right-4 top-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث بالاسم، الصف، أو الجوال..." 
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
                <th className="p-5 border-l border-slate-50 text-center">رقم التواصل</th>
                <th className="p-5 text-left">التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">لا توجد بيانات طلاب.</td></tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-5 border-l border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">{s.name[0]}</div>
                        <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-5 border-l border-slate-50 text-center">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[11px] font-bold border border-blue-100">{s.grade}</span>
                    </td>
                    <td className="p-5 border-l border-slate-50 text-center">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[11px] font-bold">{s.section}</span>
                    </td>
                    <td className="p-5 border-l border-slate-50 text-center font-mono text-xs text-slate-500">{s.phoneNumber || '---'}</td>
                    <td className="p-5 text-left">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingStudent(s); setFormData({ name: s.name, grade: s.grade, section: s.section, phoneNumber: s.phoneNumber }); setShowForm(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => { if (confirm('حذف؟')) { const all = JSON.parse(localStorage.getItem('madrasati_students') || '[]'); localStorage.setItem('madrasati_students', JSON.stringify(all.filter((st: any) => st.id !== s.id))); setStudents(db.getStudents(schoolId)); db.syncClassesFromStudents(schoolId); } }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
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
          <div className="bg-white p-8 md:p-10 rounded-[3rem] max-w-xl w-full shadow-2xl animate-in zoom-in-95 border border-white/20">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><FileUp size={28} /></div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900">محرك الاستيراد الذكي</h3>
                      <p className="text-xs text-slate-400 font-bold mt-1">ارفع ملف إكسل وسنتولى نحن الباقي.</p>
                   </div>
                </div>
                <button onClick={() => {setShowImport(false); setImportSummary(null); setTempImportData(null);}} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500 transition-colors"><X size={24} /></button>
             </div>

             <div className="space-y-6">
                {!importSummary ? (
                  <div 
                    className={`relative h-64 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-300 ${dragActive ? 'border-emerald-500 bg-emerald-50 scale-[1.02]' : 'border-slate-100 bg-slate-50 hover:border-emerald-200'}`}
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                  >
                    <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={(e) => e.target.files?.[0] && processExcelFile(e.target.files[0])} />
                    
                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-4 animate-in fade-in">
                         <Loader2 className="animate-spin text-emerald-600" size={48} />
                         <p className="text-emerald-700 font-black">جاري تحليل البيانات بذكاء...</p>
                      </div>
                    ) : (
                      <>
                         <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm mb-4"><Upload size={32} /></div>
                         <p className="text-slate-700 font-black text-lg">اسحب ملف إكسل هنا</p>
                         <button onClick={() => fileInputRef.current?.click()} className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-lg hover:bg-emerald-700 transition-all">اختيار من الجهاز</button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 animate-in zoom-in-95">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center"><CheckCircle2 size={24} /></div>
                        <div>
                           <h4 className="text-xl font-black text-emerald-900">جاهز للاستيراد</h4>
                           <p className="text-sm font-bold text-emerald-600">تم اكتشاف {importSummary.count} طالباً بنجاح.</p>
                        </div>
                     </div>
                     <div className="space-y-2 mb-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">عينة من الأسماء المكتشفة:</p>
                        <div className="flex flex-wrap gap-2">
                           {importSummary.samples.map((name, i) => (
                             <span key={i} className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-emerald-100">{name}</span>
                           ))}
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <button onClick={() => { setImportSummary(null); setTempImportData(null); }} className="flex-1 py-4 bg-white text-slate-600 rounded-2xl font-black border border-slate-200">إلغاء</button>
                        <button onClick={confirmAndSave} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">تأكيد وحفظ البيانات</button>
                     </div>
                  </div>
                )}

                {importError && (
                  <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-xs font-black animate-in shake">
                    <AlertCircle size={18} /> {importError}
                  </div>
                )}

                {!importSummary && (
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex gap-4">
                     <div className="text-blue-600 shrink-0"><Info size={20} /></div>
                     <div className="space-y-1">
                        <h4 className="text-sm font-black text-blue-900 italic">ملاحظة تقنية:</h4>
                        <p className="text-[10px] text-blue-800/70 font-bold leading-relaxed">
                          نستخدم تقنيات ضغط البيانات (Short Identifiers) لضمان حفظ كميات كبيرة من الطلاب في ذاكرة المتصفح دون مشاكل.
                        </p>
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900">{editingStudent ? 'تعديل بيانات طالب' : 'إضافة طالب جديد'}</h3>
                <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-rose-50"><X size={22} /></button>
             </div>
             <div className="space-y-5">
                <input placeholder="اسم الطالب..." className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="الصف الدراسي" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} />
                  <input placeholder="الفصل" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} />
                </div>
                <input placeholder="رقم الجوال" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                <button onClick={handleSaveManual} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg">حفظ الطالب</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
