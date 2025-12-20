
import React, { useState, useEffect } from 'react';
import { School, Subject, Teacher, SchoolClass } from '../../types.ts';
import { 
  BookOpen, UserPlus, Trash2, Key, User, Save, ListChecks, 
  Edit2, Calendar, Plus, Book, LayoutGrid, X, 
  GraduationCap, RefreshCw, Fingerprint, ShieldCheck,
  CheckCircle2, Loader2, AlertCircle
} from 'lucide-react';
import { db } from '../../constants.tsx';
import ScheduleManagement from './ScheduleManagement.tsx';

const SchoolSettings: React.FC<{ school: School }> = ({ school }) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'subjects' | 'schedule' | 'security'>('accounts');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  
  const [teacherName, setTeacherName] = useState('');
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  const [showClassesModal, setShowClassesModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [newClass, setNewClass] = useState({ grade: 'الأول الابتدائي', section: '1' });
  const [newSubjectName, setNewSubjectName] = useState('');
  
  const [isBioLoading, setIsBioLoading] = useState(false);
  const [isBioEnabled, setIsBioEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = async () => {
    setTeachers(await db.getTeachers(school.id));
    setSubjects(await db.getSubjects(school.id));
    setClasses(await db.getClasses(school.id));
    setIsBioEnabled(localStorage.getItem('local_biometric_key') !== null);
  };

  useEffect(() => {
    loadData();
  }, [school.id]);

  const handleToggleBiometric = async () => {
    if (isBioEnabled) {
      if (confirm('هل تريد إلغاء ربط هذا الجهاز بالبصمة؟')) {
        localStorage.removeItem('local_biometric_key');
        setIsBioEnabled(false);
      }
      return;
    }

    setIsBioLoading(true);
    const success = await db.registerBiometric(school.id, 'SCHOOL');
    if (success) {
      alert('تم ربط هذا الجهاز بنجاح! يمكنك الآن الدخول بالبصمة.');
      setIsBioEnabled(true);
    } else {
      alert('عذراً، جهازك لا يدعم هذه الميزة أو تم رفض الطلب.');
    }
    setIsBioLoading(false);
  };

  const addTeacher = async () => {
    if (!teacherName || !teacherUsername) return;
    const teacher: Teacher = {
      id: Date.now().toString(),
      name: teacherName,
      username: teacherUsername,
      password: teacherPassword,
      subjects: [],
      schoolId: school.id
    };
    await db.saveTeacher(teacher);
    await loadData();
    setTeacherName(''); setTeacherUsername(''); setTeacherPassword('');
  };

  const deleteTeacher = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف حساب المعلم؟')) {
      await db.deleteTeacher(id);
      await loadData();
    }
  };

  const handleSaveClass = async () => {
    if (!newClass.grade || !newClass.section) return;
    const classData: SchoolClass = {
      id: editingClass ? editingClass.id : `c-${Date.now()}`,
      grade: newClass.grade,
      section: newClass.section,
      schoolId: school.id
    };
    await db.saveClass(classData);
    await loadData();
    setNewClass({ grade: 'الأول الابتدائي', section: '1' });
    setEditingClass(null);
  };

  const handleDeleteClass = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفصل؟')) {
      await db.deleteClass(school.id, id);
      await loadData();
    }
  };

  const syncClasses = async () => {
    if (confirm('سيقوم النظام الآن بتنظيف قائمة الفصول وحذف أي فصول خاطئة (مثل الأسماء أو الجوالات) وإعادة بنائها بناءً على قائمة الطلاب الحالية فقط. هل تريد الاستمرار؟')) {
       setIsSyncing(true);
       await db.syncClassesFromStudents(school.id);
       await loadData();
       setIsSyncing(false);
       alert('تم تطهير ومزامنة الفصول بنجاح.');
    }
  };

  const addSubject = async () => {
    if (!newSubjectName.trim()) return;
    const subject: Subject = { id: Date.now().toString(), name: newSubjectName.trim() };
    await db.saveSubject(school.id, subject);
    await loadData();
    setNewSubjectName('');
  };

  const deleteSubject = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      await db.deleteSubject(school.id, id);
      await loadData();
    }
  };

  return (
    <div className="space-y-10 max-w-6xl pb-20 font-['Tajawal']">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إعدادات المدرسة</h2>
          <p className="text-slate-500 mt-1">المعلمون، الفصول، المواد، والجدول.</p>
        </div>
        <div className="flex gap-2 p-1 bg-white border rounded-2xl shadow-sm overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'accounts', label: 'المعلمون' },
            { id: 'subjects', label: 'المواد' },
            { id: 'schedule', label: 'الجدول' },
            { id: 'security', label: 'الأمان' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2 rounded-xl font-bold transition whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'accounts' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[2rem] border shadow-sm gap-4">
             <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100"><User size={24} /></div>
                <div>
                   <h3 className="text-xl font-black text-slate-800">إدارة المعلمين والفصول</h3>
                   <p className="text-xs text-slate-400 font-bold">لديك {teachers.length} معلم و {classes.length} فصل دراسي</p>
                </div>
             </div>
             <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={syncClasses} 
                  disabled={isSyncing}
                  className="flex-1 md:flex-none bg-emerald-50 text-emerald-600 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition shadow-sm border border-emerald-100 disabled:opacity-50"
                >
                  {isSyncing ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
                  تطهير ومزامنة الفصول
                </button>
                <button onClick={() => setShowClassesModal(true)} className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg">
                  <LayoutGrid size={20} className="text-blue-400" /> إدارة الفصول
                </button>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input placeholder="اسم المعلم" className="p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100 transition" value={teacherName} onChange={e => setTeacherName(e.target.value)} />
              <input placeholder="اسم المستخدم" className="p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100 transition" value={teacherUsername} onChange={e => setTeacherUsername(e.target.value)} />
              <input placeholder="كلمة المرور" type="password" className="p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100 transition" value={teacherPassword} onChange={e => setTeacherPassword(e.target.value)} />
              <button onClick={addTeacher} className="bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-50"><UserPlus size={18} /> إضافة معلم</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map(t => (
                <div key={t.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border hover:border-blue-100 transition group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition">{t.name[0]}</div>
                    <div className="flex flex-col">
                       <span className="font-bold">{t.name}</span>
                       <span className="text-[10px] text-slate-400 font-mono">@{t.username}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteTeacher(t.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8 animate-in fade-in">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Book className="absolute right-4 top-4 text-slate-300" size={20} />
              <input placeholder="اسم المادة الجديدة..." className="w-full p-4 pr-12 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100 transition" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} />
            </div>
            <button onClick={addSubject} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg">إضافة للمواد</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {subjects.map(s => (
              <div key={s.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group text-center hover:bg-white hover:border-blue-100 transition">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-blue-600 transition shadow-sm"><Book size={24} /></div>
                <h4 className="font-black text-slate-700">{s.name}</h4>
                <button onClick={() => deleteSubject(s.id)} className="absolute top-2 left-2 p-2 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && <ScheduleManagement school={school} />}

      {activeTab === 'security' && (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
           <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-xl flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl transition-all duration-700 ${isBioEnabled ? 'bg-emerald-500 text-white rotate-[360deg]' : 'bg-indigo-600 text-white'}`}>
                 {isBioEnabled ? <ShieldCheck size={48} /> : <Fingerprint size={48} />}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">الدخول السريع بالبصمة</h3>
              <p className="text-slate-500 font-bold text-base leading-relaxed mb-10 px-6">
                بإمكانك ربط هذا المتصفح بحسابك لتسجيل الدخول مستقبلاً باستخدام البصمة أو التعرف على الوجه دون الحاجة لكتابة كلمة المرور.
              </p>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={handleToggleBiometric} 
                  disabled={isBioLoading}
                  className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-4 active:scale-95 ${isBioEnabled ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700'}`}
                >
                  {isBioLoading ? <Loader2 className="animate-spin" /> : (isBioEnabled ? <Trash2 size={20} /> : <CheckCircle2 size={20} />)}
                  {isBioEnabled ? 'إلغاء ربط هذا الجهاز' : 'تفعيل البصمة لهذا الجهاز'}
                </button>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-right">
                   <h4 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">معلومات الأمان:</h4>
                   <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                     نحن لا نخزن بياناتك البيومترية أبداً. نستخدم تقنية WebAuthn لربط مفتاح تشفير آمن بين متصفحك ونظامنا، ويتم التحقق من هويتك من خلال نظام الأمان الخاص بجهازك.
                   </p>
                </div>
              </div>
           </div>
        </div>
      )}

      {showClassesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><LayoutGrid size={24} /></div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900">إدارة الفصول الدراسية</h3>
                    <p className="text-sm text-slate-500 font-bold">إجمالي الفصول: {classes.length}</p>
                 </div>
              </div>
              <button onClick={() => {setShowClassesModal(false); setEditingClass(null);}} className="p-3 bg-white text-slate-400 rounded-2xl hover:text-rose-500 shadow-sm transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8">
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-start gap-3 mb-6">
                 <AlertCircle className="text-amber-600 shrink-0" size={20} />
                 <p className="text-xs font-bold text-amber-800 leading-relaxed">
                    ملاحظة: الفصول تظهر هنا بناءً على الطلاب المسجلين. إذا وجدت أسماء طلاب هنا، يرجى حذف الطلاب الخطأ من "إدارة الطلاب" ثم العودة هنا والضغط على زر "تطهير ومزامنة الفصول" في القائمة الرئيسية.
                 </p>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 mb-8 space-y-4">
                 <h4 className="font-black text-blue-800 text-sm">{editingClass ? 'تعديل الفصل' : 'إضافة فصل يدوي'}</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select className="w-full p-4 bg-white rounded-2xl border-none outline-none font-black shadow-sm" value={newClass.grade} onChange={e => setNewClass({...newClass, grade: e.target.value})}>
                      <option>الأول الابتدائي</option><option>الثاني الابتدائي</option><option>الثالث الابتدائي</option><option>الرابع الابتدائي</option><option>الخامس الابتدائي</option><option>السادس الابتدائي</option>
                    </select>
                    <input placeholder="رقم الفصل (1)" className="w-full p-4 bg-white rounded-2xl border-none outline-none font-black shadow-sm" value={newClass.section} onChange={e => setNewClass({...newClass, section: e.target.value})} />
                 </div>
                 <button onClick={handleSaveClass} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition">{editingClass ? 'تحديث الفصل' : 'إضافة الفصل للقائمة'}</button>
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-3 px-2 custom-scrollbar">
                {classes.length === 0 ? (
                  <div className="text-center p-10 text-slate-300 font-bold">لا توجد فصول دراسية.</div>
                ) : (
                  classes.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border hover:border-blue-100 transition group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><GraduationCap size={20} /></div>
                         <div className="flex flex-col">
                            <span className="font-black text-slate-800">{c.grade}</span>
                            <span className="text-xs text-slate-400 font-bold">فصل رقم {c.section}</span>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => { setEditingClass(c); setNewClass({ grade: c.grade, section: c.section }); }} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition opacity-0 group-hover:opacity-100"><Edit2 size={18} /></button>
                         <button onClick={() => handleDeleteClass(c.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSettings;
