
import React, { useState } from 'react';
import { School, Subject, Teacher } from '../../types';
import { BookOpen, UserPlus, Trash2, Key, User, Save, ListChecks, Edit2, Calendar } from 'lucide-react';
import { MOCK_SUBJECTS, MOCK_TEACHERS } from '../../constants';
import ScheduleManagement from './ScheduleManagement';

const SchoolSettings: React.FC<{ school: School }> = ({ school }) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'subjects' | 'schedule'>('accounts');
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [teachers, setTeachers] = useState<Teacher[]>(MOCK_TEACHERS);
  const [newSubject, setNewSubject] = useState('');
  
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherName, setTeacherName] = useState('');
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  const addOrUpdateTeacher = () => {
    if (!teacherName || !teacherUsername) return;
    
    if (editingTeacher) {
      setTeachers(teachers.map(t => t.id === editingTeacher.id ? { ...t, name: teacherName, username: teacherUsername } : t));
      setEditingTeacher(null);
    } else {
      setTeachers([...teachers, { id: Date.now().toString(), name: teacherName, username: teacherUsername, subjects: [] }]);
    }
    
    setTeacherName('');
    setTeacherUsername('');
    setTeacherPassword('');
  };

  const handleEditTeacher = (t: Teacher) => {
    setEditingTeacher(t);
    setTeacherName(t.name);
    setTeacherUsername(t.username || t.name.split(' ')[1]);
  };

  const deleteTeacher = (id: string) => {
    if(confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-10 max-w-6xl pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إعدادات المدرسة</h2>
          <p className="text-slate-500 mt-1">إدارة الحسابات، المواد، والجدول الدراسي في مكان واحد.</p>
        </div>
        <div className="flex gap-2 p-1 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <button 
            onClick={() => setActiveTab('accounts')}
            className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === 'accounts' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            حسابات المعلمين
          </button>
          <button 
            onClick={() => setActiveTab('subjects')}
            className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === 'subjects' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            المواد الدراسية
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === 'schedule' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            الجدول الدراسي
          </button>
        </div>
      </div>

      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              <UserPlus size={22} className="text-blue-600" />
              {editingTeacher ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                type="text" 
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="الاسم الكامل"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold"
              />
              <input 
                type="text" 
                value={teacherUsername}
                onChange={(e) => setTeacherUsername(e.target.value)}
                placeholder="اسم المستخدم"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold"
              />
              <input 
                type="password" 
                value={teacherPassword}
                onChange={(e) => setTeacherPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={addOrUpdateTeacher} className="px-10 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-50 hover:scale-105 transition">
                {editingTeacher ? 'تحديث البيانات' : 'حفظ المعلم'}
              </button>
              {editingTeacher && <button onClick={() => {setEditingTeacher(null); setTeacherName(''); setTeacherUsername('');}} className="bg-slate-100 px-8 rounded-2xl font-bold">إلغاء</button>}
            </div>

            <div className="mt-8 space-y-3">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">قائمة المعلمين المضافين</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teachers.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-sm transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black">{t.name[0]}</div>
                      <span className="font-bold">{t.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditTeacher(t)} className="p-2 text-blue-600 hover:bg-white rounded-lg transition"><Edit2 size={18} /></button>
                      <button onClick={() => deleteTeacher(t.id)} className="p-2 text-rose-500 hover:bg-white rounded-lg transition"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xl font-black flex items-center gap-2">
            <BookOpen size={22} className="text-purple-600" />
            إدارة المواد الدراسية المتاحة
          </h3>
          <div className="flex gap-2 max-w-xl">
            <input 
              type="text" 
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="اسم المادة (مثلاً: لغتي، رياضيات...)"
              className="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-bold"
            />
            <button onClick={() => {if(newSubject) setSubjects([...subjects, {id: Date.now().toString(), name: newSubject}]); setNewSubject('');}} className="bg-purple-600 text-white px-8 rounded-2xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-50">إضافة مادة</button>
          </div>
          <div className="flex flex-wrap gap-3 pt-4">
            {subjects.map(s => (
              <div key={s.id} className="bg-purple-50 text-purple-700 px-6 py-3 rounded-2xl font-bold border border-purple-100 flex items-center gap-3 group">
                {s.name}
                <button onClick={() => setSubjects(subjects.filter(sub => sub.id !== s.id))} className="text-rose-400 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
           <ScheduleManagement school={school} />
        </div>
      )}
    </div>
  );
};

export default SchoolSettings;
