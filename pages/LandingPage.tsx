
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ChevronLeft, Lock, School as SchoolIcon, UserPlus, LogIn, Sparkles } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col relative min-h-screen bg-white font-['Tajawal'] overflow-x-hidden selection:bg-indigo-100">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] opacity-40"></div>
      </div>

      {/* Header */}
      <nav className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-100">
            <Zap size={22} fill="white" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">مدرستي</span>
        </div>
        <div className="hidden sm:block">
           <span className="text-slate-400 font-bold text-xs">نظام الخطط الأسبوعية الذكي</span>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-50 text-slate-500 font-black text-xs mb-8 border border-slate-100 shadow-sm">
          <Sparkles size={14} className="text-indigo-500" />
          أسهل وسيلة لإدارة الجداول والخطط المدرسية
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
          نظم مدرستك <br/> 
          <span className="bg-clip-text text-transparent bg-gradient-to-l from-indigo-600 to-blue-500">بلمسة احترافية</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-16 max-w-2xl leading-relaxed font-medium">
          بوابة متكاملة للمدارس لإنشاء الخطط الأسبوعية، رصد الغياب، ومشاركة النتائج مع أولياء الأمور في بيئة رقمية واحدة مخصصة.
        </p>

        {/* Primary CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-lg">
          <Link 
            to="/login" 
            className="group flex flex-col items-center gap-4 p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1.5 transition-all duration-300"
          >
            <div className="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <LogIn size={28} />
            </div>
            <span className="text-xl font-black">دخول المدرسة</span>
          </Link>

          <Link 
            to="/register-school" 
            className="group flex flex-col items-center gap-4 p-8 bg-white text-slate-800 border-2 border-slate-100 rounded-[2.5rem] shadow-xl hover:border-indigo-100 hover:bg-indigo-50/30 hover:-translate-y-1.5 transition-all duration-300"
          >
            <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
              <UserPlus size={28} />
            </div>
            <span className="text-xl font-black">تسجيل مدرسة جديدة</span>
          </Link>
        </div>

        {/* Public Link Helper */}
        <div className="mt-16 flex items-center gap-2 text-slate-400 font-bold text-sm">
          <ChevronLeft size={16} className="text-indigo-400" />
          <span>هل أنت ولي أمر؟ استعرض خطة طفلك عبر الرابط المباشر للمدرسة</span>
        </div>
      </main>

      {/* Footer & Admin Entry */}
      <footer className="mt-auto px-10 py-10 flex justify-between items-center border-t border-slate-50 bg-slate-50/50">
        <p className="text-slate-400 font-bold text-xs">© {new Date().getFullYear()} مدرستي. جميع الحقوق محفوظة.</p>
        
        {/* Hidden System Admin Entrance */}
        <button 
          onClick={() => navigate('/system-access-portal')}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-300 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-sm transition-all"
          title="مدير النظام"
        >
          <Lock size={14} />
          <span className="text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">إدارة النظام</span>
        </button>
      </footer>
    </div>
  );
};

export default LandingPage;
