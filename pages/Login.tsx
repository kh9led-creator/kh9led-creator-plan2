
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../constants';
import { 
  ArrowLeft, 
  Zap, 
  AlertCircle, 
  Loader2, 
  Lock, 
  User as UserIcon, 
  Fingerprint, 
  Eye, 
  EyeOff 
} from 'lucide-react';

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);

  useEffect(() => {
    // التحقق من وجود بيانات بصمة محفوظة محلياً
    const bioData = localStorage.getItem('khotati_bio_data');
    setHasBiometric(!!bioData);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await db.authenticateSchool({ username, password });

      if (result.success && result.data) {
        // حفظ بيانات البصمة تلقائياً عند الدخول الناجح لأول مرة لسهولة الاستخدام
        localStorage.setItem('khotati_bio_data', JSON.stringify({ username, password }));
        onLogin(result.data);
        navigate('/school');
      } else {
        setError(result.message || result.error || 'بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setError('');
    setBiometricLoading(true);

    try {
      const result = await db.authenticateBiometric();
      if (result.success && result.data) {
        onLogin(result.data);
        navigate('/school');
      } else {
        setError(result.error || 'فشل التعرف على البصمة');
      }
    } catch (err) {
      setError('جهازك لا يدعم تسجيل الدخول بالبصمة حالياً');
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 font-['Tajawal']" dir="rtl">
      <div className="w-full max-w-[460px] animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="text-center mb-10">
            <div className="inline-flex p-5 bg-indigo-600 text-white rounded-[1.8rem] mb-6 shadow-xl shadow-indigo-100">
              <Zap size={32} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">بوابة المدارس</h1>
            <p className="text-slate-400 font-bold mt-2 text-sm">سجل دخولك لإدارة خطتك الأسبوعية</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl flex items-center gap-3 text-xs font-black animate-in shake duration-500">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 mr-2">اسم المستخدم</label>
              <div className="relative group">
                <UserIcon className="absolute right-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="w-full p-5 pr-14 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 mr-2">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute right-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-5 pr-14 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-5 top-5 text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="submit" 
                disabled={loading || biometricLoading}
                className="flex-[3] py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : 'دخول'}
              </button>
              
              {hasBiometric && (
                <button 
                  type="button" 
                  onClick={handleBiometricLogin}
                  disabled={loading || biometricLoading}
                  className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black flex items-center justify-center hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-100 disabled:opacity-50"
                  title="دخول بالبصمة"
                >
                  {biometricLoading ? <Loader2 className="animate-spin" size={20} /> : <Fingerprint size={28} />}
                </button>
              )}
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <button 
              onClick={() => navigate('/')} 
              className="text-slate-400 font-bold text-xs flex items-center justify-center gap-2 mx-auto hover:text-indigo-600 transition-all"
            >
              <ArrowLeft size={14} className="rotate-180" />
              العودة للرئيسية
            </button>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} Khotati Smart System
        </p>
      </div>
    </div>
  );
};

export default Login;
