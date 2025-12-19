
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Zap, Printer, Lock, School as SchoolIcon, ArrowLeft, ChevronLeft, Globe, Sparkles } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col relative min-h-screen bg-white font-['Tajawal'] overflow-x-hidden">
      {/* Header */}
      <nav className="glass border-b border-slate-100 px-8 py-5 flex justify-between items-center sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-200">
            <Zap size={22} fill="white" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">مدرستي</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-bold transition-colors">دخول الإدارة</Link>
          <Link to="/register-school" className="px-8 py-3.5 rounded-2xl bg-slate-900 text-white hover:bg-black font-black shadow-2xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2">
            ابدأ مجاناً
            <ChevronLeft size={18} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] opacity-40"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 text-indigo-700 font-black text-sm mb-10 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles size={16} />
            الجيل الجديد من إدارة الخطط المدرسية
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.1] mb-10 tracking-tight">
            مدرستك، هويتها <br/> 
            <span className="bg-clip-text text-transparent bg-gradient-to-l from-indigo-600 to-blue-500">وقرارها الرقمي</span>
          </h1>
          <p className="text-xl text-slate-500 mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
            امنح مدرستك القوة لتصميم خططها الأسبوعية بشكل مستقل تماماً. رابط واحد، هوية واحدة، وتنظيم لا مثيل له للطلاب والمعلمين.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link to="/register-school" className="group px-14 py-6 bg-indigo-600 text-white rounded-[2.5rem] text-2xl font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-4">
              <SchoolIcon size={28} />
              أنشئ بيئة مدرستك
            </Link>
            <Link to="/login" className="px-10 py-6 text-slate-700 font-black text-xl hover:bg-slate-50 rounded-[2.5rem] transition-colors">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Feature Cards */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { 
              title: 'روابط مخصصة', 
              desc: 'تحصل كل مدرسة على عنوان URL فريد (slug) يمثل هويتها الرقمية المستقلة.',
              icon: <Globe size={32} />,
              color: 'indigo'
            },
            { 
              title: 'تنظيم ذكي', 
              desc: 'أدوات رصد متقدمة للدروس، الواجبات، والأنشطة الإثرائية في واجهة واحدة مبسطة.',
              icon: <Zap size={32} />,
              color: 'blue'
            },
            { 
              title: 'توزيع فوري', 
              desc: 'أنشئ الخطط واطبعها أو شاركها مع أولياء الأمور بضغطة زر واحدة واحترافية تامة.',
              icon: <Printer size={32} />,
              color: 'slate'
            }
          ].map((f, i) => (
            <div key={i} className="group bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-700 flex flex-col items-center text-center">
              <div className={`w-20 h-20 bg-${f.color}-50 text-${f.color}-600 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500`}>
                {f.icon}
              </div>
              <h3 className="text-2xl font-black mb-6 text-slate-900">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed font-bold">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-20 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3 opacity-50">
            <Zap size={24} className="text-indigo-600" />
            <span className="text-xl font-black">مدرستي</span>
          </div>
          <div className="flex gap-10 text-slate-400 font-bold text-sm">
            <a href="#" className="hover:text-indigo-600 transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">شروط الاستخدام</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">الدعم الفني</a>
          </div>
          <div 
            onClick={() => navigate('/system-access-portal')}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 cursor-pointer flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all group shadow-sm"
          >
            <Lock size={12} className="opacity-40 group-hover:opacity-100" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
