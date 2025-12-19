
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Lock, UserPlus, LogIn, Sparkles } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col relative min-h-screen bg-white font-['Tajawal'] overflow-x-hidden selection:bg-indigo-100">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px]"></div>
      </div>

      <nav className="px-8 py-8 flex justify-center items-center max-w-7xl mx-auto w-full">
        <div className="bg-indigo-600 p-3 rounded-[1.5rem] text-white shadow-2xl shadow-indigo-200 animate-float">
          <Zap size={28} fill="white" />
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto -mt-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 text-slate-400 font-black text-[10px] mb-6 border border-slate-100 uppercase tracking-widest">
          <Sparkles size={12} className="text-indigo-500" />
          منصة خططي لإدارة الأسبوع الدراسي
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-12 tracking-tighter">
          نظام الخطط المدرسية <br/> 
          <span className="text-indigo-600 underline decoration-indigo-100 decoration-8 underline-offset-8">خططي الذكي</span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
          <Link 
            to="/login" 
            className="group flex flex-col items-center gap-5 p-10 bg-indigo-600 text-white rounded-[3rem] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-2 transition-all duration-500"
          >
            <div className="bg-white/20 p-5 rounded-2xl group-hover:scale-110 transition-transform"><LogIn size={32} /></div>
            <span className="text-2xl font-black">دخول المدرسة</span>
          </Link>

          <Link 
            to="/register-school" 
            className="group flex flex-col items-center gap-5 p-10 bg-white text-slate-800 border-2 border-slate-100 rounded-[3rem] shadow-xl hover:border-indigo-100 hover:bg-indigo-50/30 hover:-translate-y-2 transition-all duration-500"
          >
            <div className="bg-indigo-50 p-5 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform"><UserPlus size={32} /></div>
            <span className="text-2xl font-black">تسجيل جديد</span>
          </Link>
        </div>
      </main>

      <footer className="mt-auto px-10 py-10 flex flex-col items-center gap-6">
        <div className="w-10 h-1 bg-slate-100 rounded-full"></div>
        <button 
          onClick={() => navigate('/system-access-portal')}
          className="group p-4 bg-white border border-slate-100 text-slate-200 rounded-2xl hover:text-indigo-600 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-500 flex items-center gap-3"
          title="دخول مدير النظام"
        >
          <Lock size={18} />
          <span className="text-xs font-black opacity-0 group-hover:opacity-100 transition-all">بوابة مدير النظام</span>
        </button>
        <p className="text-slate-300 font-bold text-[10px]">© {new Date().getFullYear()} نظام خططي - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};

export default LandingPage;
