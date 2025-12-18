
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types.ts';
import { db } from '../constants.tsx';
import { ShieldCheck, ArrowLeft, Lock, Terminal, ShieldAlert } from 'lucide-react';

interface Props {
  onLogin: (role: UserRole, school: any, user: any) => void;
}

const SystemAdminLogin: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 font-['Tajawal'] relative overflow-hidden">
      {/* Background decoration for tech vibe */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl p-12 rounded-[3rem] border border-slate-800 max-w-md w-full relative z-10 shadow-2xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]">
            <ShieldCheck size={44} />
          </div>
          <h2 className="text-3xl font-black text-white">بوابة التحكم بالنظام</h2>
          <p className="text-slate-400 mt-3 font-bold flex items-center justify-center gap-2">
            <Terminal size={14} />
            الوصول التقني المتقدم
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center gap-3 font-bold text-sm border border-rose-500/20">
            <ShieldAlert size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-2">Admin Identity</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-5 bg-slate-800/50 border border-slate-700 rounded-2xl font-black text-white focus:ring-2 focus:ring-blue-500/50 transition-all outline-none placeholder:text-slate-600"
              placeholder="Username"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-2">Access Key</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-5 bg-slate-800/50 border border-slate-700 rounded-2xl font-black text-white focus:ring-2 focus:ring-blue-500/50 transition-all outline-none placeholder:text-slate-600"
              placeholder="••••••••"
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
