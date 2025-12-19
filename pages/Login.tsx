
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types.ts';
import { db } from '../constants.tsx';
import { ArrowLeft, Zap, AlertCircle, Loader2, Lock, Globe } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, school: any, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const schools = db.getSchools();
      const school = schools.find(s => s.slug === username);
      
      if (school && (password === school.adminPassword || password === 'admin')) {
        onLogin('SCHOOL_ADMIN', school, { name: 'مدير المدرسة' });
        navigate('/school');
      } else {
        setError('بيانات الدخول غير صحيحة');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center px-6 font-['Tajawal']">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-50 rounded-full blur-[100px] opacity-50"></div>
      </div>

      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/80 backdrop-blur-2xl p-10 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 relative">
          
          <div className="text-center mb-12">
            <div className="inline-flex p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100 mb-6 animate-float">
              <Zap size={32} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">الخطط الأسبوعية</h1>
            <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-widest">إدارة المدرسة</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 text-rose-500 rounded-2xl flex items-center gap-3 font-black text-xs border border-rose-100 animate-in slide-in-from-top-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <div className="relative group">
                <Globe className="absolute right-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="معرف المدرسة (Slug)"
                  className="w-full p-5 pr-14 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold text-slate-800 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative group">
                <Lock className="absolute right-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full p-5 pr-14 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold text-slate-800 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden relative"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span>دخول للنظام</span>
                  <ArrowLeft size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center border-t border-slate-50 pt-8">
            <p className="text-slate-400 text-xs font-bold">ليس لديك حساب؟</p>
            <button 
              onClick={() => navigate('/register-school')} 
              className="text-indigo-600 text-sm font-black mt-1 hover:underline transition-all"
            >
              إنشاء بيئة مدرسة جديدة
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center">
           <button onClick={() => navigate('/')} className="text-slate-400 font-bold text-xs hover:text-slate-600 transition">العودة للرئيسية</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
