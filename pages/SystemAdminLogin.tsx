
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
      setError(result.error || 'فشل تسجيل الدخول. تحقق من البيانات.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6 relative font-['Tajawal']" dir="rtl">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-800 max-w-md w-full relative z-10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black text-white">مركز التحكم</h2>
          <p className="text-slate-400 mt-2 font-bold text-xs uppercase tracking-widest">Master Administration</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3 text-sm font-bold">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">هوية المسؤول</label>
            <div className="relative group">
              <UserIcon className="absolute right-4 top-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 pr-12 bg-slate-800/50 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-left"
                placeholder="admin"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">مفتاح الوصول</label>
            <div className="relative group">
              <Lock className="absolute right-4 top-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pr-12 bg-slate-800/50 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-left"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-500 shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'تسجيل الدخول للنظام'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SystemAdminLogin;
