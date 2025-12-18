
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../constants';
import { UserRole } from '../types';
import { Users, Lock, LogIn, ArrowRight, AlertCircle } from 'lucide-react';

interface Props {
  onLogin: (role: UserRole, school: any, user: any) => void;
}

const TeacherLogin: React.FC<Props> = ({ onLogin }) => {
  const { schoolSlug } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const school = useMemo(() => {
    const schools = db.getSchools();
    return schools.find(s => s.slug === schoolSlug);
  }, [schoolSlug]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!school) {
      setError('هذه المدرسة غير موجودة في النظام');
      return;
    }

    // البحث عن المعلم في قاعدة البيانات المحلية لهذه المدرسة
    const teachers = db.getTeachers(school.id);
    const teacher = teachers.find(t => t.username === username);

    if (teacher) {
      onLogin('TEACHER', school, teacher);
      navigate('/teacher');
    } else {
      setError('خطأ في اسم المستخدم أو كلمة المرور للمعلم');
    }
  };

  if (!school) return <div className="min-h-screen flex items-center justify-center font-bold">عذراً، الرابط غير صحيح.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 font-['Tajawal']">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 p-4 border border-slate-100">
            {school.logoUrl ? (
              <img src={school.logoUrl} alt={school.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <Users className="text-blue-600" size={40} />
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900">{school.name}</h2>
          <p className="text-blue-600 font-black text-sm mt-1 uppercase tracking-widest">بوابة دخول المعلمين</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 font-bold text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">اسم المستخدم</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">كلمة المرور</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-black shadow-xl transition-all">دخول لحسابي</button>
        </form>

        <div className="mt-10 text-center">
           <button onClick={() => navigate('/')} className="text-slate-400 font-bold text-sm flex items-center justify-center gap-2 mx-auto transition hover:text-slate-600">العودة للرئيسية <ArrowRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
