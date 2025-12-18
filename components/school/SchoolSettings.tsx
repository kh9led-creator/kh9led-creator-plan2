
import React, { useState, useEffect } from 'react';
import { School, Subject, Teacher } from '../../types.ts';
import { BookOpen, UserPlus, Trash2, Key, User, Save, ListChecks, Edit2, Calendar, Plus, Book } from 'lucide-react';
import { db } from '../../constants.tsx';
import ScheduleManagement from './ScheduleManagement.tsx';

const SchoolSettings: React.FC<{ school: School }> = ({ school }) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'subjects' | 'schedule'>('accounts');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // معالجة المعلمين
  const [teacherName, setTeacherName] = useState('');
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  // معالجة المواد
  const [newSubjectName, setNewSubjectName] = useState('');

  useEffect(() => {
    setTeachers(db.getTeachers(school.id));
    setSubjects(db.getSubjects(school.id));
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

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubjectName.trim()
    };
    db.saveSubject(school.id, subject);
    setSubjects(db.getSubjects(school.id));
    setNewSubjectName('');
  };

  const deleteSubject = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المادة؟ قد يؤثر ذلك على الجداول الحالية.')) {
      db.deleteSubject(school.id, id);
      setSubjects(db.getSubjects(school.id));
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
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input placeholder="اسم المعلم" className="p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100 transition" value={teacherName} onChange={e => setTeacherName(e.target.value)} />
            <input placeholder="اسم المستخدم" className="p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100 transition" value={teacherUsername} onChange={e => setTeacherUsername(e.target.value)} />
            <input placeholder="كلمة المرور" type="password" className="p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100 transition" value={teacherPassword} onChange={e => setTeacherPassword(e.target.value)} />
            <button onClick={addTeacher} className="bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition active:scale-95"><UserPlus size={18} /> إضافة معلم</button>
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
      )}

      {activeTab === 'subjects' && (
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Book className="absolute right-4 top-4 text-slate-300" size={20} />
              <input 
                placeholder="اسم المادة الجديدة (مثال: كيمياء، اجتماعيات...)" 
                className="w-full p-4 pr-12 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100 transition" 
                value={newSubjectName} 
                onChange={e => setNewSubjectName(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && addSubject()}
              />
            </div>
            <button onClick={addSubject} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition active:scale-95 whitespace-nowrap">
              <Plus size={20} /> إضافة للمواد
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {subjects.map(s => (
              <div key={s.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group text-center hover:bg-white hover:border-blue-100 transition">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-blue-600 transition shadow-sm">
                  <Book size={24} />
                </div>
                <h4 className="font-black text-slate-700">{s.name}</h4>
                <button 
                  onClick={() => deleteSubject(s.id)} 
                  className="absolute top-2 left-2 p-2 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && <ScheduleManagement school={school} />}
    </div>
  );
};

export default SchoolSettings;
