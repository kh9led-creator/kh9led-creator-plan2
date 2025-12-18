
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { MOCK_SCHOOLS } from '../constants';
import { ShieldCheck, School as SchoolIcon, ArrowLeft, Zap } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, school: any, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'SCHOOL_ADMIN' | 'SYSTEM_ADMIN'>('SCHOOL_ADMIN');

  const handleLogin = () => {
    if (role === 'SYSTEM_ADMIN') {
      onLogin('SYSTEM_ADMIN', null, { name: 'المشرف العام' });
      navigate('/admin');
    } else {
      // افتراضياً يدخل على أول مدرسة للمحاكاة
      onLogin('SCHOOL_ADMIN', MOCK_SCHOOLS[0], { name: 'مدير المدرسة' });
      navigate('/school');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 font-['Tajawal']">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-2xl shadow-blue-100">
            <Zap size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900">بوابة الإدارة</h2>
          <p className="text-slate-500 mt-2">تسجيل الدخول لمديري المدارس والنظام</p>
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-8">
          <button 
            onClick={() => setRole('SCHOOL_ADMIN')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${role === 'SCHOOL_ADMIN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            مدير مدرسة
          </button>
          <button 
            onClick={() => setRole('SYSTEM_ADMIN')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${role === 'SYSTEM_ADMIN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            مدير النظام
          </button>
        </div>

        <div className="space-y-4 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 mr-2">اسم المستخدم</label>
            <input 
              type="text" 
              placeholder="admin"
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 mr-2">كلمة المرور</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>
        </div>

        <button 
          onClick={handleLogin}
          className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          دخول للنظام
          <ArrowLeft size={20} />
        </button>

        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-slate-400 text-sm font-bold">هل أنت معلم؟</p>
          <p className="text-slate-500 text-xs mt-1">يرجى استخدام الرابط الخاص الذي زودتك به إدارة مدرستك.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
