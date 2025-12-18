
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types.ts';
import { db } from '../constants.tsx';
import { ShieldCheck, ArrowLeft, Lock, Terminal, ShieldAlert, Mail, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  onLogin: (role: UserRole, school: any, user: any) => void;
}

const SystemAdminLogin: React.FC<Props> = ({ onLogin }) => {
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

    const admin = db.getSystemAdmin();
    if (username === admin.username && password === admin.password) {
      onLogin('SYSTEM_ADMIN', null, { name: 'المشرف العام' });
      navigate('/admin');
    } else {
      setError('إذن الوصول مرفوض. بيانات الاعتماد غير صالحة.');
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryStatus('sending');
    
    // محاكاة إرسال بريد المشرف
    setTimeout(() => {
      setRecoveryStatus('sent');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 font-['Tajawal'] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl p-12 rounded-[3rem] border border-slate-800 max-w-md w-full relative z-10 shadow-2xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]">
            {isRecoveryMode ? <Mail size={44} /> : <ShieldCheck size={44} />}
          </div>
          <h2 className="text-3xl font-black text-white">{isRecoveryMode ? 'استعادة المشرف' : 'بوابة التحكم بالنظام'}</h2>
          <p className="text-slate-400 mt-3 font-bold flex items-center justify-center gap-2">
            <Terminal size={14} />
            {isRecoveryMode ? 'تأكيد الهوية البريدية' : 'الوصول التقني المتقدم'}
          </p>
        </div>

        {isRecoveryMode ? (
          <div className="space-y-6">
            {recoveryStatus === 'sent' ? (
              <div className="text-center space-y-6 animate-in zoom-in-95">
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-3xl flex flex-col items-center gap-3">
                  <CheckCircle2 size={48} />
                  <p className="font-black">تم إرسال المفتاح!</p>
                  <p className="text-xs font-bold leading-relaxed">تم إرسال بيانات الدخول إلى البريد الإلكتروني الخاص بالمشرف التقني.</p>
                </div>
                <button onClick={() => setIsRecoveryMode(false)} className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black transition-all hover:bg-slate-100">
                  العودة للبوابة
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecovery} className="space-y-6">
                <div className="space-y-3 text-right">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-2">Admin Email</label>
                  <input 
                    type="email" 
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full p-5 bg-slate-800/50 border border-slate-700 rounded-2xl font-black text-white focus:ring-2 focus:ring-blue-500/50 transition-all outline-none text-left"
                    placeholder="admin@system.com"
                    dir="ltr"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={recoveryStatus === 'sending'}
                  className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {recoveryStatus === 'sending' ? <Loader2 className="animate-spin" /> : 'استعادة الوصول'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsRecoveryMode(false)}
                  className="w-full text-slate-500 text-sm font-bold hover:text-white transition"
                >إلغاء الاستعادة</button>
              </form>
            )}
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-8 p-4 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center gap-3 font-bold text-sm border border-rose-500/20">
                <ShieldAlert size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3 text-right">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-2">Admin Identity</label>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-5 bg-slate-800/50 border border-slate-700 rounded-2xl font-black text-white focus:ring-2 focus:ring-blue-500/50 transition-all outline-none text-left"
                  placeholder="Username"
                  dir="ltr"
                />
              </div>
              <div className="space-y-3 text-right">
                <div className="flex justify-between items-center mr-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Access Key</label>
                  <button 
                    type="button" 
                    onClick={() => setIsRecoveryMode(true)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold"
                  >نسيت المفتاح؟</button>
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-5 bg-slate-800/50 border border-slate-700 rounded-2xl font-black text-white focus:ring-2 focus:ring-blue-500/50 transition-all outline-none text-left"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full mt-6 py-6 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-500 shadow-[0_10px_40px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                بدء جلسة الإدارة
                <ArrowLeft size={20} />
              </button>
            </form>
          </>
        )}

        <div className="mt-12 text-center">
          <button 
            onClick={() => navigate('/')} 
            className="text-slate-500 text-sm font-bold hover:text-slate-300 transition"
          >
            العودة للواجهة العامة
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemAdminLogin;
