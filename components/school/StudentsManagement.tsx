
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../../constants.tsx';
import { Student } from '../../types.ts';
import { 
  Plus, Search, Trash2, CheckCircle2, 
  Upload, X, Sparkles, Loader2, User, 
  Eraser, Phone, GraduationCap, Layout, Edit2, 
  Users, Trash
} from 'lucide-react';

const StudentsManagement: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
  
  const [importStep, setImportStep] = useState<'upload' | 'preview'>('upload');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStudents(db.getStudents(schoolId));
  }, [schoolId]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
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
    db.saveStudent(studentData);
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
          <button onClick={() => setShowImport(true)} className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-md text-sm">
            <Sparkles size={18} className="text-blue-400" /> استيراد
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
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5 border-l border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm">{s.name[0]}</div>
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

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] max-w-md w-full shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">{editingStudent ? 'تعديل طالب' : 'إضافة طالب جديد'}</h3>
                <button onClick={() => setShowForm(false)} className="p-2 text-slate-400"><X size={20} /></button>
             </div>
             <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 mr-1">اسم الطالب الكامل</label>
                  <input 
                    placeholder="أدخل الاسم..." 
                    className="w-full p-3.5 bg-slate-50 rounded-xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 transition-all" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 mr-1">الصف</label>
                    <select 
                      className="w-full p-3.5 bg-slate-50 rounded-xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 transition-all" 
                      value={formData.grade} 
                      onChange={e => setFormData({...formData, grade: e.target.value})}
                    >
                      {['الأول الابتدائي', 'الثاني الابتدائي', 'الثالث الابتدائي', 'الرابع الابتدائي', 'الخامس الابتدائي', 'السادس الابتدائي', 'الأول المتوسط', 'الثاني المتوسط', 'الثالث المتوسط'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 mr-1">رقم الفصل</label>
                    <input 
                      placeholder="مثال: 1" 
                      className="w-full p-3.5 bg-slate-50 rounded-xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 transition-all" 
                      value={formData.section} 
                      onChange={e => setFormData({...formData, section: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 mr-1">رقم الجوال</label>
                  <input 
                    placeholder="05xxxxxxxx" 
                    className="w-full p-3.5 bg-slate-50 rounded-xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-100 transition-all text-left" 
                    value={formData.phoneNumber} 
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                  />
                </div>
                <button 
                  onClick={handleSave} 
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-base shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4"
                >
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
