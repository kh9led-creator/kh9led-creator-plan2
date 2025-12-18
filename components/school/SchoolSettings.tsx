
import React, { useState, useEffect } from 'react';
import { School, Subject, Teacher } from '../../types.ts';
import { BookOpen, UserPlus, Trash2, Key, User, Save, ListChecks, Edit2, Calendar } from 'lucide-react';
import { MOCK_SUBJECTS, db } from '../../constants.tsx';
import ScheduleManagement from './ScheduleManagement.tsx';

const SchoolSettings: React.FC<{ school: School }> = ({ school }) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'subjects' | 'schedule'>('accounts');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  useEffect(() => {
    setTeachers(db.getTeachers(school.id));
  }, [school.id]);

  const addTeacher = () => {
    if (!teacherName || !teacherUsername) return;
    const teacher: Teacher = {
      id: Date.now().toString(),
      name: teacherName,
      username: teacherUsername,
      password: teacherPassword,
      subjects: [],
      schoolId: school.id
    };
    db.saveTeacher(teacher);
    setTeachers(db.getTeachers(school.id));
    setTeacherName(''); setTeacherUsername(''); setTeacherPassword('');
  };

  const deleteTeacher = (id: string) => {
    if (confirm('هل أنت متأكد من حذف حساب المعلم؟')) {
      db.deleteTeacher(id);
      setTeachers(db.getTeachers(school.id));
    }
  };

  return (
    <div className="space-y-10 max-w-6xl pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إعدادات المدرسة</h2>
          <p className="text-slate-500 mt-1">أدِر المعلمين، المواد، والجدول المدرسي.</p>
        </div>
        <div className="flex gap-2 p-1 bg-white border rounded-2xl shadow-sm">
          {['accounts', 'subjects', 'schedule'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              {tab === 'accounts' ? 'المعلمون' : tab === 'subjects' ? 'المواد' : 'الجدول'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'accounts' && (
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input placeholder="اسم المعلم" className="p-4 bg-slate-50 rounded-2xl font-bold outline-none" value={teacherName} onChange={e => setTeacherName(e.target.value)} />
            <input placeholder="اسم المستخدم" className="p-4 bg-slate-50 rounded-2xl font-bold outline-none" value={teacherUsername} onChange={e => setTeacherUsername(e.target.value)} />
            <input placeholder="كلمة المرور" type="password" className="p-4 bg-slate-50 rounded-2xl font-bold outline-none" value={teacherPassword} onChange={e => setTeacherPassword(e.target.value)} />
            <button onClick={addTeacher} className="bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2"><UserPlus size={18} /> إضافة</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map(t => (
              <div key={t.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black">{t.name[0]}</div>
                  <div className="flex flex-col">
                     <span className="font-bold">{t.name}</span>
                     <span className="text-[10px] text-slate-400 font-mono">@{t.username}</span>
                  </div>
                </div>
                <button onClick={() => deleteTeacher(t.id)} className="p-2 text-rose-500 hover:bg-white rounded-lg transition"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center text-slate-400 font-bold">استخدم قائمة المواد الافتراضية المتاحة حالياً.</div>
      )}

      {activeTab === 'schedule' && <ScheduleManagement school={school} />}
    </div>
  );
};

export default SchoolSettings;
