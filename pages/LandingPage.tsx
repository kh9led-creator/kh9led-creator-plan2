
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Zap, Printer, Lock, School as SchoolIcon, ArrowLeft } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col relative min-h-screen bg-white font-['Tajawal'] overflow-x-hidden">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
            <Zap size={24} />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">مدرستي</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-6 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-bold transition">دخول الإدارة</Link>
          <Link to="/register-school" className="px-6 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-black font-bold shadow-xl shadow-slate-200 transition-all active:scale-95">سجل مدرستك</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent -z-10"></div>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-black text-xs mb-8 border border-blue-100 animate-bounce">
            <CheckCircle size={14} />
            نظام الخطط المدرسية الأسرع والأكثر استقلالية
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.15] mb-8">
            بيئة رقمية <span className="text-blue-600">مستقلة</span> لكل مدرسة
          </h1>
          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            امنح مدرستك هويتها الخاصة. نظام متكامل لإدارة الخطط الأسبوعية، الطلاب، والمعلمين، مع استقلالية تامة في البيانات والروابط.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/register-school" className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] text-xl font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
              <SchoolIcon size={24} />
              ابدأ إنشاء مدرستك الآن
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Features */}
      <section className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: 'روابط خاصة', 
              desc: 'كل مدرسة تملك رابط دخول فريد لمعلميها وصفحات عامة تحمل شعارها الخاص.',
              icon: <ShieldCheck size={32} />,
              color: 'blue'
            },
            { 
              title: 'رصد تفصيلي', 
              desc: 'إمكانية رصد عنوان الدرس، الواجبات، والمهام الإثرائية في حقول مستقلة ومنظمة.',
              icon: <Zap size={32} />,
              color: 'emerald'
            },
            { 
              title: 'طباعة احترافية', 
              desc: 'توليد خطط أسبوعية بصيغة PDF قابلة للتوزيع والنشر المباشر لأولياء الأمور.',
              icon: <Printer size={32} />,
              color: 'purple'
            }
          ].map((f, i) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className={`w-16 h-16 bg-${f.color}-50 text-${f.color}-600 rounded-2xl flex items-center justify-center mb-8`}>
                {f.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed font-bold text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hidden Admin Access */}
      <footer className="bg-white border-t py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 grayscale opacity-30">
            <Zap size={20} />
            <span className="text-lg font-black">مدرستي</span>
          </div>
          <p className="text-slate-300 text-xs font-bold">© {new Date().getFullYear()} جميع الحقوق محفوظة</p>
          <div 
            onClick={() => navigate('/system-access-portal')}
            className="w-4 h-4 rounded-full bg-slate-50 hover:bg-slate-100 cursor-default flex items-center justify-center transition-all group"
          >
            <Lock size={8} className="text-slate-200 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
