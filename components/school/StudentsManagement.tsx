
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../../constants.tsx';
import { Student } from '../../types.ts';
import { 
  Plus, Search, Trash2, CheckCircle2, 
  Upload, X, Sparkles, Loader2, User, 
  Eraser, Phone, GraduationCap, Layout, Edit2, 
  Users, Trash, FileSpreadsheet, AlertCircle, Wand2
} from 'lucide-react';

const StudentsManagement: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
  
  const [importText, setImportText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    setStudents(db.getStudents(schoolId));
  }, [schoolId]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
    setShowForm(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ name: student.name, grade: student.grade, section: student.section, phoneNumber: student.phoneNumber });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    const studentData = { ...formData, id: editingStudent ? editingStudent.id : Date.now().toString(), schoolId };
    db.saveStudent(studentData as any);
    setStudents(db.getStudents(schoolId));
    setShowForm(false);
    db.syncClassesFromStudents(schoolId);
  };

  const deleteStudent = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      const all = JSON.parse(localStorage.getItem('madrasati_students') || '[]');
      const filtered = all.filter((s: any) => s.id !== id);
      localStorage.setItem('madrasati_students', JSON.stringify(filtered));
      setStudents(db.getStudents(schoolId));
      db.syncClassesFromStudents(schoolId);
    }
  };

  const handleDeleteAll = () => {
    if (confirm('تنبيه: سيتم حذف كافة الطلاب المسجلين حالياً لهذه المدرسة. هل أنت متأكد؟')) {
      const all = JSON.parse(localStorage.getItem('madrasati_students') || '[]');
      const filtered = all.filter((s: any) => s.schoolId !== schoolId);
      localStorage.setItem('madrasati_students', JSON.stringify(filtered));
      setStudents([]);
      db.syncClassesFromStudents(schoolId);
    }
  };

  // وظيفة التحليل الذكي للبيانات
  const processImport = () => {
    if (!importText.trim()) {
      setImportError('يرجى لصق بيانات الطلاب أولاً');
      return;
    }

    setIsProcessing(true);
    setImportError('');

    try {
      const lines = importText.trim().split(/\n/);
      const newStudents: any[] = [];
      const gradesKeywords = ['ابتدائي', 'متوسط', 'ثانوي', 'أول', 'ثاني', 'ثالث', 'رابع', 'خامس', 'سادس'];

      lines.forEach(line => {
        if (!line.trim()) return;

        // فصل الأعمدة (دعم Tab من الإكسل، أو الفاصلة)
        const parts = line.split(/\t|,/).map(p => p.trim()).filter(p => p !== "");
        
        if (parts.length > 0) {
          let name = '';
          let grade = 'الأول الابتدائي'; // القيمة الافتراضية
          let section = '1';
          let phone = '';

          // تحليل كل جزء ذكياً
          parts.forEach((part) => {
            // هل هو رقم جوال؟ (يبدأ بـ 05 أو 5 أو يحتوي على 9-10 أرقام)
            if (/^(05|5|\+966|966)[0-9]+$/.test(part.replace(/\s/g, '')) || (part.length >= 9 && /^[0-9]+$/.test(part.replace(/\s/g, '')))) {
              phone = part;
            } 
            // هل هو صف دراسي؟ (يحتوي على كلمات دالة)
            else if (gradesKeywords.some(k => part.includes(k))) {
              grade = part;
            } 
            // هل هو رقم فصل؟ (رقم صغير أو حرف واحد)
            else if (/^[0-9]$/.test(part) || (part.length === 1 && !/^[0-9]$/.test(part))) {
              section = part;
            } 
            // إذا لم يكن مما سبق، فهو غالباً الاسم (نأخذ أطول نص غير مصنف كاسم)
            else if (part.length > 2) {
              if (!name || part.length > name.length) {
                if (name) { 
                   // إذا كان لدينا اسم سابق، ربما يكون الجزء الحالي هو الصف إذا كان يحتوي على أرقام
                   if (/\d/.test(part)) section = part; 
                }
                name = part;
              }
            }
          });

          if (name) {
            newStudents.push({
              id: (Date.now() + Math.random()).toString(),
              name: name,
              grade: grade,
              section: section,
              phoneNumber: phone,
              schoolId: schoolId
            });
          }
        }
      });

      if (newStudents.length > 0) {
        const all = JSON.parse(localStorage.getItem('madrasati_students') || '[]');
        localStorage.setItem('madrasati_students', JSON.stringify([...all, ...newStudents]));
        setStudents(db.getStudents(schoolId));
        db.syncClassesFromStudents(schoolId);
        setShowImport(false);
        setImportText('');
        alert(`تم استيراد ${newStudents.length} طالب بنجاح!`);
      } else {
        setImportError('لم نتمكن من التعرف على أي أسماء طلاب. تأكد من أن البيانات تحتوي على أسماء واضحة.');
      }
    } catch (err) {
      setImportError('حدث خطأ فني أثناء المعالجة. يرجى مراجعة تنسيق البيانات الملصقة.');
    } finally {
      setIsProcessing(false);
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
            onClick={handleDeleteAll} 
            className="p-3.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100 flex items-center justify-center gap-2 font-bold text-sm"
            title="حذف كافة الطلاب"
          >
            <Trash2 size={18} />
          </button>
          <button onClick={() => setShowImport(true)} className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-md text-sm border border-slate-700">
            <Wand2 size={18} className="text-blue-400" /> استيراد ذكي
          </button>
          <button onClick={handleOpenAdd} className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-md text-sm">
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
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-100 transition-all" 
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
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold border border-blue-100">
                        {s.grade}
                      </span>
                    </td>
                    <td className="p-5 border-l border-slate-50 text-center">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold">
                        فصل {s.section}
                      </span>
                    </td>
                    <td className="p-5 border-l border-slate-50 text-center font-mono text-sm text-slate-500">{s.phoneNumber || '---'}</td>
                    <td className="p-5 text-left">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(s)} className="p-2.5 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors" title="تعديل"><Edit2 size={16} /></button>
                        <button onClick={() => deleteStudent(s.id)} className="p-2.5 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-500 hover:text-white transition-colors" title="حذف"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal - Smart Version */}
      {showImport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white p-8 md:p-10 rounded-[3rem] max-w-2xl w-full shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100"><Wand2 size={28} /></div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900">الاستيراد الذكي للطلاب</h3>
                      <p className="text-xs text-slate-400 font-bold mt-1">انسخ الجدول من ملف الإكسل والصقه هنا مباشرة.</p>
                   </div>
                </div>
                <button onClick={() => setShowImport(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500 transition-colors"><X size={24} /></button>
             </div>

             <div className="space-y-6">
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                   <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Sparkles size={14} /> ملاحظات الاستيراد:
                   </h4>
                   <ul className="text-[11px] text-blue-900/70 font-bold space-y-1 list-disc list-inside">
                     <li>لا يشترط ترتيب معين للأعمدة.</li>
                     <li>سيقوم النظام تلقائياً بتمييز (الاسم، الجوال، الصف، الفصل).</li>
                     <li>تأكد من أن كل طالب في سطر منفصل.</li>
                   </ul>
                </div>

                <div className="relative">
                  <textarea 
                    className="w-full h-72 p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 focus:border-blue-400 outline-none font-bold text-sm leading-relaxed shadow-inner transition-all"
                    placeholder="مثال:
محمد أحمد  الأول الابتدائي  1  0512345678
سعد علي  الثاني الابتدائي  2"
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                  />
                  {importText && (
                    <button 
                      onClick={() => setImportText('')} 
                      className="absolute left-6 bottom-6 p-2 bg-white text-rose-500 rounded-full shadow-md hover:bg-rose-500 hover:text-white transition-all"
                      title="مسح النص"
                    >
                      <Eraser size={18} />
                    </button>
                  )}
                </div>

                {importError && (
                  <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-xs font-black animate-in shake">
                    <AlertCircle size={16} /> {importError}
                  </div>
                )}

                <div className="flex gap-4">
                   <button 
                    onClick={() => setShowImport(false)} 
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black transition-all hover:bg-slate-200"
                   >
                     إلغاء
                   </button>
                   <button 
                    onClick={processImport}
                    disabled={isProcessing || !importText.trim()}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> معالجة ذكية واستيراد</>}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl animate-in zoom-in-95 border border-slate-50">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><User size={20} /></div>
                  <h3 className="text-xl font-black text-slate-900">{editingStudent ? 'تعديل بيانات طالب' : 'إضافة طالب جديد'}</h3>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={22} /></button>
             </div>
             <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 mr-1 flex items-center gap-1.5"><User size={12} /> اسم الطالب الكامل</label>
                  <input 
                    placeholder="أدخل الاسم..." 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-sm" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 mr-1 flex items-center gap-1.5"><GraduationCap size={12} /> الصف</label>
                    <select 
                      className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-sm cursor-pointer" 
                      value={formData.grade} 
                      onChange={e => setFormData({...formData, grade: e.target.value})}
                    >
                      {['الأول الابتدائي', 'الثاني الابتدائي', 'الثالث الابتدائي', 'الرابع الابتدائي', 'الخامس الابتدائي', 'السادس الابتدائي', 'الأول المتوسط', 'الثاني المتوسط', 'الثالث المتوسط'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 mr-1 flex items-center gap-1.5"><Layout size={12} /> رقم الفصل</label>
                    <input 
                      placeholder="مثال: 1" 
                      className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-sm" 
                      value={formData.section} 
                      onChange={e => setFormData({...formData, section: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 mr-1 flex items-center gap-1.5"><Phone size={12} /> رقم الجوال</label>
                  <input 
                    placeholder="05xxxxxxxx" 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all text-left shadow-sm" 
                    value={formData.phoneNumber} 
                    dir="ltr"
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                  />
                </div>
                <button 
                  onClick={handleSave} 
                  className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={22} />
                  {editingStudent ? 'تحديث البيانات' : 'حفظ الطالب'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
