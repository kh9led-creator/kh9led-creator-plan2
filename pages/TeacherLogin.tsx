
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../constants';
import { UserRole } from '../types';
import { ArrowRight, AlertCircle, Loader2, User, Lock } from 'lucide-react';

interface Props {
  onLogin: (role: UserRole, school: any, user: any) => void;
}

const TeacherLogin: React.FC<Props> = ({ onLogin }) => {
  const { schoolSlug } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const school = useMemo(() => {
    const schools = db.getSchools();
    return schools.find(s => s.slug === schoolSlug);
  }, [schoolSlug]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (!school) {
        setError('المدرسة غير موجودة');
        setLoading(false);
        return;
      }

      const teachers = db.getTeachers(school.id);
      const teacher = teachers.find(t => t.username === username);

      if (teacher) {
        onLogin('TEACHER', school, teacher);
        navigate('/teacher');
      } else {
        setError('بيانات المعلم غير صحيحة');
        setLoading(false);
      }
    }, 800);
  };

  if (!school) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 animate-pulse">جاري التحقق من الرابط...</div>;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 font-['Tajawal']">
      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 p-4 border border-slate-100 shadow-sm transition-transform hover:scale-105 duration-500">
            {school.logoUrl ? (
              <img src={school.logoUrl} alt={school.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-indigo-600 rounded-2xl"></div>
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{school.name}</h2>
          <div className="inline-block mt-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            بوابة المعلم الفنية
          </div>
        </div>

        <div className="bg-white p-2 rounded-[2.5rem]">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-500 rounded-2xl flex items-center gap-3 font-black text-xs border border-rose-100 animate-in shake duration-500">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
               <User className="absolute right-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
               <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="اسم المستخدم"
                className="w-full p-5 pr-14 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none"
              />
            </div>

            <div className="relative group">
               <Lock className="absolute right-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
               <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full p-5 pr-14 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'دخول للمنصة'}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
           <button onClick={() => navigate('/')} className="text-slate-400 font-bold text-xs flex items-center justify-center gap-2 mx-auto hover:text-indigo-600 transition-all">العودة للرئيسية <ArrowRight size={14} /></button>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
