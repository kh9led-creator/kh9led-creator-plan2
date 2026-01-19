
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { db } from '../constants';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

const SystemAdminLogin: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await db.adminLogin({ username, password });

    if (result.success && result.data) {
      onLogin(result.data);
      navigate('/admin-dashboard');
    } else {
      setError(result.message || result.error || 'خطأ في بيانات الدخول');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6 font-['Tajawal']" dir="rtl">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600 via-transparent to-transparent blur-[120px]"></div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-2xl p-10 md:p-14 rounded-[3.5rem] border border-slate-800 max-w-md w-full relative z-10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-white shadow-2xl shadow-blue-500/20">
            <ShieldCheck size={48} />
          </div>
          <h2 className="text-4xl font-black text-white">مركز التحكم</h2>
          <p className="text-slate-500 mt-2 font-bold text-xs uppercase tracking-[0.2em]">Khotati Administration</p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">هوية المسؤول</label>
            <div className="relative group">
              <UserIcon className="absolute right-5 top-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-5 pr-14 bg-slate-800/40 border border-slate-700 rounded-3xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-left font-mono"
                placeholder="Admin ID"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">مفتاح الدخول</label>
            <div className="relative group">
              <Lock className="absolute right-5 top-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-5 pr-14 bg-slate-800/40 border border-slate-700 rounded-3xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-left font-mono"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-500 shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'تسجيل الدخول الآمن'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SystemAdminLogin;
