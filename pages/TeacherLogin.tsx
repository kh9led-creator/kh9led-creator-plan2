
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_SCHOOLS, MOCK_TEACHERS } from '../constants';
import { UserRole } from '../types';
import { Users, Lock, LogIn, ArrowRight } from 'lucide-react';

interface Props {
  onLogin: (role: UserRole, school: any, user: any) => void;
}

const TeacherLogin: React.FC<Props> = ({ onLogin }) => {
  const { schoolSlug } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const school = useMemo(() => 
    MOCK_SCHOOLS.find(s => s.slug === schoolSlug) || MOCK_SCHOOLS[0]
  , [schoolSlug]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // محاكاة تسجيل دخول معلم
    onLogin('TEACHER', school, MOCK_TEACHERS[0]);
    navigate('/teacher');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 font-['Tajawal']">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 max-w-md w-full relative overflow-hidden">
        {/* Branding decoration */}
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

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
              <Users size={16} className="text-slate-400" />
              اسم المستخدم
            </label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
              <Lock size={16} className="text-slate-400" />
              كلمة المرور
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            دخول لحسابي
            <LogIn size={20} />
          </button>
        </form>

        <div className="mt-10 text-center">
           <button 
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm flex items-center justify-center gap-2 mx-auto"
           >
             العودة للرئيسية
             <ArrowRight size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
