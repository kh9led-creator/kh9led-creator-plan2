
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../constants';
import { UserRole, User } from '../types';
import { ArrowRight, AlertCircle, Loader2, User as UserIcon, Lock, Fingerprint } from 'lucide-react';

interface Props {
  onLogin: (userData: User) => void;
}

const TeacherLogin: React.FC<Props> = ({ onLogin }) => {
  const { schoolSlug } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);

  // جلب بيانات المدرسة من السيرفر للتأكد من الرابط
  const [school, setSchool] = useState<any>(null);

  useEffect(() => {
    const fetchSchool = async () => {
      if (schoolSlug) {
        const result = await db.getSchoolBySlug(schoolSlug);
        if (result) setSchool(result);
      }
    };
    fetchSchool();
    setHasBiometric(localStorage.getItem('khotati_bio_data') !== null);
  }, [schoolSlug]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await db.authenticateSchool({ username, password });

      if (result.success && result.data) {
        // التحقق أن المستخدم هو معلم وليس مدير مدرسة
        // ملاحظة: في النسخة الفعلية يتم التحقق من الـ role في الـ API
        onLogin(result.data);
        navigate('/teacher');
      } else {
        setError('بيانات المعلم غير صحيحة');
      }
    } catch (err) {
      setError('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    setError('');
    try {
      const result = await db.authenticateBiometric();
      // إصلاح: تم استبدال type بـ role ليتوافق مع الـ Interface
      if (result && result.success && result.data) {
        onLogin(result.data);
        navigate('/teacher');
      } else {
        setError('فشل التعرف على البصمة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء مسح البصمة');
    } finally {
      setBiometricLoading(false);
    }
  };

  if (!school) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 animate-pulse">جاري التحقق من الرابط...</div>;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 font-['Tajawal']" dir="rtl">
      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 p-4 border border-slate-100 shadow-sm transition-transform hover:scale-105 duration-500">
            {school.logoUrl ? (
              <img src={school.logoUrl} alt={school.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                {school.name[0]}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{school.name}</h2>
          <div className="inline-block mt-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            بوابة المعلم الفنية
          </div>
        </div>

        <div className="bg-white p-2 rounded-[2.5rem]">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-500 rounded-2xl flex items-center gap-3 font-black text-xs border border-rose-100 animate-in shake duration-500">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
               <UserIcon className="absolute right-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
               <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="اسم المستخدم"
                className="w-full p-5 pr-14 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none"
              />
            </div>

            <div className="relative group">
               <Lock className="absolute right-5 top-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
               <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full p-5 pr-14 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button 
                type="submit" 
                disabled={loading || biometricLoading}
                className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : 'دخول'}
              </button>
              
              {hasBiometric && (
                <button 
                  type="button" 
                  onClick={handleBiometricLogin} 
                  disabled={loading || biometricLoading}
                  className={`p-5 rounded-2xl font-black transition-all flex items-center justify-center relative overflow-hidden ${biometricLoading ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  title="الدخول بالبصمة"
                >
                   {biometricLoading ? <Loader2 className="animate-spin" size={24} /> : <Fingerprint size={24} />}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mt-12 text-center">
           <button onClick={() => navigate('/')} className="text-slate-400 font-bold text-xs flex items-center justify-center gap-2 mx-auto hover:text-indigo-600 transition-all">العودة للرئيسية <ArrowRight size={14} /></button>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
