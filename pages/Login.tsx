
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types.ts';
import { db } from '../constants.tsx';
import { School as SchoolIcon, ArrowLeft, Zap, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, school: any, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const schools = db.getSchools();
    // البحث عن المدرسة باستخدام الـ slug
    const school = schools.find(s => s.slug === username);
    
    // التحقق من كلمة المرور المخصصة أو الافتراضية 'admin' (للمدارس القديمة)
    if (school && (password === school.adminPassword || password === 'admin')) {
      onLogin('SCHOOL_ADMIN', school, { name: 'مدير المدرسة' });
      navigate('/school');
    } else {
      setError('يرجى التأكد من اسم مستخدم المدرسة (Slug) وكلمة المرور');
    }
  };

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

        <form onSubmit={handleLogin} className="space-y-5 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 mr-2">اسم مستخدم المدرسة (Slug)</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="مثال: al-iman-school"
              className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 mr-2">كلمة المرور</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
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
