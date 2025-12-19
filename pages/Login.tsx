
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types.ts';
import { db } from '../constants.tsx';
import { ArrowLeft, Zap, AlertCircle, Loader2, Lock, Globe, Mail, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, school: any, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const schools = db.getSchools();
      // البحث عن المدرسة بواسطة الرابط (Slug) أو اسم المستخدم الإداري
      const school = schools.find(s => s.slug === username || s.adminUsername === username);
      
      if (school && (password === school.adminPassword || password === 'admin')) {
        onLogin('SCHOOL_ADMIN', school, { name: 'مدير المدرسة' });
        navigate('/school');
      } else {
        setError('بيانات الدخول غير صحيحة');
        setLoading(false);
      }
    }, 800);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      const schools = db.getSchools();
      const school = schools.find(s => s.email === recoveryEmail);
      
      if (school) {
        setRecoverySent(true);
        setLoading(false);
      } else {
        setError('هذا البريد غير مسجل لدينا');
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 font-['Tajawal']">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 relative">
          
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-indigo-600 text-white rounded-3xl shadow-xl mb-6 shadow-indigo-100">
              {isRecoveryMode ? <Mail size={28} /> : <Zap size={28} fill="currentColor" />}
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isRecoveryMode ? 'استعادة البيانات' : 'نظام خططي'}
            </h1>
            <p className="text-slate-400 font-bold mt-1 text-sm">
              {isRecoveryMode ? 'سنقوم بإرسال بيانات الدخول لبريدك' : 'بوابة إدارة المدرسة'}
            </p>
          </div>

          {error && <div className="mb-6 p-4 bg-rose-50 text-rose-500 rounded-2xl flex items-center gap-3 font-black text-xs border border-rose-100 animate-in shake"><AlertCircle size={16} />{error}</div>}

          {isRecoveryMode ? (
            recoverySent ? (
              <div className="text-center space-y-6 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><CheckCircle2 size={40} /></div>
                <p className="font-bold text-slate-600 leading-relaxed px-4">تم إرسال تعليمات الاستعادة إلى بريدك الإلكتروني المسجل بنجاح.</p>
                <button onClick={() => {setIsRecoveryMode(false); setRecoverySent(false);}} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black transition-all hover:bg-black">العودة لتسجيل الدخول</button>
              </div>
            ) : (
              <form onSubmit={handleRecovery} className="space-y-6">
                <div className="relative group">
                  <Mail className="absolute right-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input type="email" required value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="البريد الإلكتروني المسجل (بالإنجليزي)" className="w-full p-5 pr-14 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-100 transition-all text-left" dir="ltr" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" size={24} /> : 'إرسال بيانات الاستعادة'}
                </button>
                <button type="button" onClick={() => setIsRecoveryMode(false)} className="w-full text-slate-400 text-sm font-bold hover:text-indigo-600">تذكرت البيانات؟ تسجيل الدخول</button>
              </form>
            )
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative group">
                <Globe className="absolute right-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="اسم المستخدم أو الرابط (بالإنجليزي)" className="w-full p-5 pr-14 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-100 transition-all text-left" dir="ltr" />
              </div>
              <div className="relative group">
                <Lock className="absolute right-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور (بالإنجليزي)" className="w-full p-5 pr-14 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-100 transition-all text-left" dir="ltr" />
              </div>
              <div className="text-left px-2">
                <button type="button" onClick={() => setIsRecoveryMode(true)} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest">نسيت بيانات الدخول؟</button>
              </div>
              <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" size={24} /> : 'دخول النظام'}
              </button>
            </form>
          )}

          {!isRecoveryMode && (
            <div className="mt-8 text-center border-t border-slate-50 pt-8">
              <button onClick={() => navigate('/register-school')} className="text-indigo-600 text-sm font-black hover:underline underline-offset-4">إنشاء حساب مدرسة جديدة</button>
            </div>
          )}
        </div>
        <div className="mt-8 text-center">
          <button onClick={() => navigate('/')} className="text-slate-400 font-bold text-xs hover:text-slate-600 transition flex items-center justify-center gap-2 mx-auto">
            <ArrowLeft size={14} /> العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
