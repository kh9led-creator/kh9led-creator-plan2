
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../../constants.tsx';
import { Student } from '../../types.ts';
import { 
  Plus, Search, Trash2, CheckCircle2, 
  Upload, X, Sparkles, Loader2, User, 
  Eraser, Phone, GraduationCap, Layout, Edit2, 
  Users, ChevronLeft, ArrowUpRight
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

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-100 transition-transform hover:scale-105 duration-500">
            <Users size={36} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">إدارة شؤون الطلاب</h2>
            <p className="text-slate-500 font-bold mt-1 text-lg">تحكم كامل في بيانات {students.length} طالب مسجل.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <button onClick={() => setShowImport(true)} className="flex-1 lg:flex-none bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 transition-all hover:bg-black active:scale-95 text-lg btn-glow">
            <Sparkles size={24} className="text-indigo-400" /> استيراد ذكي
          </button>
          <button onClick={handleOpenAdd} className="flex-1 lg:flex-none bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 transition-all hover:bg-indigo-700 active:scale-95 text-lg btn-glow">
            <Plus size={24} /> إضافة طالب
          </button>
        </div>
      </div>

      {/* Search and Table Section */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden w-full">
        <div className="p-10 border-b bg-slate-50/20">
          <div className="relative w-full max-w-3xl mx-auto">
            <Search size={22} className="absolute right-6 top-5.5 text-slate-300" />
            <input 
              type="text" 
              placeholder="ابحث عن أي طالب بالاسم أو الصف..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[2rem] py-5 pr-16 pl-8 text-lg font-bold shadow-sm outline-none focus:ring-8 focus:ring-indigo-50 focus:border-indigo-200 transition-all placeholder:text-slate-300" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="p-10 border-l border-slate-50/50">اسم الطالب</th>
                <th className="p-10 border-l border-slate-50/50 text-center">المرحلة / الصف</th>
                <th className="p-10 border-l border-slate-50/50 text-center">رقم الفصل</th>
                <th className="p-10 border-l border-slate-50/50 text-center">رقم الجوال</th>
                <th className="p-10 text-left">التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-40 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <Users size={80} />
                      <p className="text-2xl font-black">لا توجد بيانات مطابقة للبحث</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="p-10 border-l border-slate-50/50">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white text-indigo-600 border border-slate-100 rounded-[1.2rem] flex items-center justify-center font-black shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all text-xl">{s.name[0]}</div>
                        <span className="font-black text-slate-800 text-xl tracking-tight">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-10 border-l border-slate-50/50 text-center">
                      <span className="bg-indigo-50 text-indigo-700 px-8 py-3 rounded-full text-sm font-black border border-indigo-100/50">
                        {s.grade}
                      </span>
                    </td>
                    <td className="p-10 border-l border-slate-50/50 text-center">
                      <div className="inline-flex items-center gap-2 bg-slate-50 px-6 py-2 rounded-xl text-slate-600 font-black text-base border border-slate-100">
                        <Layout size={16} className="text-slate-400" />
                        فصل {s.section}
                      </div>
                    </td>
                    <td className="p-10 border-l border-slate-50/50 text-center font-mono font-bold text-slate-400 text-lg tracking-widest">{s.phoneNumber || '---'}</td>
                    <td className="p-10 text-left">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleOpenEdit(s)} className="p-5 bg-white text-indigo-600 border border-slate-100 rounded-[1.2rem] shadow-sm hover:bg-indigo-600 hover:text-white transition-all active:scale-90" title="تعديل"><Edit2 size={24} /></button>
                        <button onClick={() => deleteStudent(s.id)} className="p-5 bg-white text-rose-500 border border-slate-100 rounded-[1.2rem] shadow-sm hover:bg-rose-500 hover:text-white transition-all active:scale-90" title="حذف"><Trash2 size={24} /></button>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-12 rounded-[4rem] max-w-xl w-full shadow-2xl animate-in slide-in-from-bottom-12 duration-500 relative">
             <button onClick={() => setShowForm(false)} className="absolute top-10 left-10 p-4 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 rounded-2xl"><X size={28} /></button>
             
             <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                   {editingStudent ? <Edit2 size={32} /> : <User size={32} />}
                </div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900">{editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h3>
                   <p className="text-slate-400 font-bold">أدخل البيانات المطلوبة بدقة للحفاظ على جودة الجدول.</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 mr-2 flex items-center gap-2"><User size={16}/> اسم الطالب الكامل</label>
                  <input 
                    placeholder="الاسم الرباعي كما في نظام نور..." 
                    className="w-full p-5 bg-slate-50/50 rounded-[1.5rem] border-2 border-transparent outline-none font-black text-xl focus:bg-white focus:border-indigo-100 transition-all shadow-inner" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 mr-2 flex items-center gap-2"><GraduationCap size={16}/> الصف الدراسي</label>
                    <select 
                      className="w-full p-5 bg-slate-50/50 rounded-[1.5rem] border-2 border-transparent outline-none font-black text-lg focus:bg-white focus:border-indigo-100 transition-all shadow-inner cursor-pointer" 
                      value={formData.grade} 
                      onChange={e => setFormData({...formData, grade: e.target.value})}
                    >
                      {['الأول الابتدائي', 'الثاني الابتدائي', 'الثالث الابتدائي', 'الرابع الابتدائي', 'الخامس الابتدائي', 'السادس الابتدائي', 'الأول المتوسط', 'الثاني المتوسط', 'الثالث المتوسط'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 mr-2 flex items-center gap-2"><Layout size={16}/> رقم الفصل</label>
                    <input 
                      placeholder="رقم 1" 
                      className="w-full p-5 bg-slate-50/50 rounded-[1.5rem] border-2 border-transparent outline-none font-black text-lg focus:bg-white focus:border-indigo-100 transition-all shadow-inner" 
                      value={formData.section} 
                      onChange={e => setFormData({...formData, section: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 mr-2 flex items-center gap-2"><Phone size={16}/> رقم الجوال للتواصل</label>
                  <input 
                    placeholder="05xxxxxxxx" 
                    className="w-full p-5 bg-slate-50/50 rounded-[1.5rem] border-2 border-transparent outline-none font-black text-xl focus:bg-white focus:border-indigo-100 transition-all shadow-inner text-left" 
                    value={formData.phoneNumber} 
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                  />
                </div>

                <button 
                  onClick={handleSave} 
                  className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-2xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 mt-10"
                >
                  {editingStudent ? 'تحديث البيانات' : 'حفظ بيانات الطالب'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
