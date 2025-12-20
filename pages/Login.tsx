
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types.ts';
import { db } from '../constants.tsx';
import { ArrowLeft, Zap, AlertCircle, Loader2, Lock, Globe, Mail, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, school: any, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // محاكاة طلب API حقيقي مع التحقق من كلمة المرور المشفرة
      const school = await db.authenticateSchool(username, password);
      
      if (school) {
        onLogin('SCHOOL_ADMIN', school, { name: 'مدير المدرسة' });
        navigate('/school');
      } else {
        setError('خطأ في اسم المستخدم أو كلمة المرور');
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 font-['Tajawal']">
      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-indigo-600 text-white rounded-3xl mb-6 shadow-xl shadow-indigo-100">
              <Zap size={28} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">بوابة المدرسة الآمنة</h1>
            <p className="text-slate-400 font-bold mt-1 text-sm">بياناتك محمية بأنظمة التشفير المتقدمة</p>
          </div>

          {error && <div className="mb-6 p-4 bg-rose-50 text-rose-500 rounded-2xl flex items-center gap-3 font-black text-xs border border-rose-100"><AlertCircle size={16} />{error}</div>}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 mr-2">اسم المستخدم / الرابط</label>
              <div className="relative group">
                <Globe className="absolute right-5 top-5 text-slate-300" size={20} />
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" dir="ltr" className="w-full p-5 pr-14 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition-all shadow-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 mr-2">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute right-5 top-5 text-slate-300" size={20} />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" className="w-full p-5 pr-14 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition-all shadow-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-5 text-slate-300">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'تسجيل دخول آمن'}
            </button>
          </form>
        </div>
        <div className="mt-8 text-center">
          <button onClick={() => navigate('/')} className="text-slate-400 font-bold text-xs flex items-center justify-center gap-2 mx-auto">
            <ArrowLeft size={14} /> العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
