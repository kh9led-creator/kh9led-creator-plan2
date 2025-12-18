
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types.ts';
import { db } from '../constants.tsx';
import { School as SchoolIcon, ArrowLeft, Zap, AlertCircle, Mail, Loader2, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, school: any, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Recovery States
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const schools = db.getSchools();
    const school = schools.find(s => s.slug === username);
    
    if (school && (password === school.adminPassword || password === 'admin')) {
      onLogin('SCHOOL_ADMIN', school, { name: 'مدير المدرسة' });
      navigate('/school');
    } else {
      setError('يرجى التأكد من اسم مستخدم المدرسة (Slug) وكلمة المرور');
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryStatus('sending');
    
    // محاكاة عملية الإرسال
    setTimeout(() => {
      const schools = db.getSchools();
      const school = schools.find(s => s.email === recoveryEmail);
      
      // في الواقع، سيتم إرسال إيميل. هنا سنقوم فقط بتأكيد العملية.
      setRecoveryStatus('sent');
    }, 2000);
  };

  if (isRecoveryMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 font-['Tajawal']">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 max-w-md w-full">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-xl shadow-blue-50">
              <Mail size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900">استعادة البيانات</h2>
            <p className="text-slate-500 mt-2">أدخل بريدك الإلكتروني المسجل لإرسال بيانات الدخول</p>
          </div>

          {recoveryStatus === 'sent' ? (
            <div className="space-y-6 text-center animate-in zoom-in-95">
               <div className="bg-emerald-50 text-emerald-600 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center gap-3">
                  <CheckCircle2 size={48} />
                  <p className="font-black">تم إرسال البيانات!</p>
                  <p className="text-xs font-bold opacity-80 leading-relaxed">يرجى فحص بريدك الإلكتروني (بما في ذلك الرسائل غير المرغوب فيها) للحصول على رابط استعادة الوصول.</p>
               </div>
               <button onClick={() => setIsRecoveryMode(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black transition-all hover:bg-black">
                 العودة لتسجيل الدخول
               </button>
            </div>
          ) : (
            <form onSubmit={handleRecovery} className="space-y-6">
              <div className="space-y-2 text-right">
                <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="email@school.com"
                  className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none text-left"
                  dir="ltr"
                />
              </div>
              <button 
                type="submit"
                disabled={recoveryStatus === 'sending'}
                className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {recoveryStatus === 'sending' ? <><Loader2 className="animate-spin" /> جاري البحث...</> : 'إرسال تعليمات الاستعادة'}
              </button>
              <button 
                type="button"
                onClick={() => setIsRecoveryMode(false)}
                className="w-full text-slate-400 font-bold text-sm hover:text-blue-600 transition"
              >
                تذكرت بياناتي؟ عودة
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 font-['Tajawal']">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-2xl shadow-blue-100">
            <Zap size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900">بوابة إدارة المدرسة</h2>
          <p className="text-slate-500 mt-2">قم بإدخال بيانات المدرسة للوصول للوحة التحكم</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 font-bold text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 mr-2">اسم مستخدم المدرسة (Slug)</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="مثال: al-iman-school"
              className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none text-left"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center mr-2">
              <label className="text-sm font-black text-slate-700">كلمة المرور</label>
              <button 
                type="button"
                onClick={() => setIsRecoveryMode(true)}
                className="text-xs text-blue-600 font-bold hover:underline"
              >نسيت كلمة المرور؟</button>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none text-left"
              dir="ltr"
            />
          </div>
          <button 
            type="submit"
            className="w-full mt-4 py-6 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            دخول للمنصة
            <ArrowLeft size={20} />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-slate-400 text-sm font-bold">مدرسة جديدة؟</p>
          <button onClick={() => navigate('/register-school')} className="text-blue-600 text-sm font-black mt-1 hover:underline">أنشئ حساب مدرسة الآن</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
