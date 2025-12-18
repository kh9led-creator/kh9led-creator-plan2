
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { School as SchoolIcon, ArrowRight, CheckCircle2, Globe, User, ShieldCheck, Sparkles, Mail, Lock } from 'lucide-react';

const SchoolRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolName: '',
    slug: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug only if it hasn't been manually edited or is empty
      if (name === 'schoolName') {
        newData.slug = value.toLowerCase()
          .replace(/[^\u0621-\u064A0-9a-zA-Z\s]/g, '')
          .replace(/\s+/g, '-');
      }
      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Tajawal']">
      <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl shadow-slate-200 border border-slate-100 max-w-3xl w-full relative overflow-hidden">
        
        {/* Background Decorative Element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-0"></div>

        {step < 3 && (
          <div className="text-center mb-12 relative z-10">
            <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-white shadow-2xl shadow-blue-200 rotate-3">
              <SchoolIcon size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">تأسيس مدرستك الرقمية</h2>
            <p className="text-slate-500 font-medium text-lg">أدخل بيانات مدرستك لتخصيص بيئة عملك المستقلة</p>
            
            {/* Step Indicator */}
            <div className="flex justify-center items-center gap-3 mt-8">
              <div className={`h-2 rounded-full transition-all duration-500 ${step === 1 ? 'w-12 bg-blue-600' : 'w-4 bg-slate-200'}`}></div>
              <div className={`h-2 rounded-full transition-all duration-500 ${step === 2 ? 'w-12 bg-blue-600' : 'w-4 bg-slate-200'}`}></div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 relative z-10">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 flex items-center gap-2 mr-2">
                  <Sparkles size={16} className="text-blue-500" />
                  اسم المدرسة الرسمي
                </label>
                <input 
                  type="text" 
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  placeholder="مثال: مدرسة منارة الهدى النموذجية"
                  className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-3xl font-black text-lg outline-none focus:border-blue-100 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 flex items-center gap-2 mr-2">
                  <Globe size={16} className="text-blue-500" />
                  رابط الوصول الخاص (Slug)
                </label>
                <div className="flex items-center gap-3 bg-slate-50 p-5 rounded-3xl border-2 border-transparent focus-within:border-blue-100 focus-within:bg-white transition-all shadow-inner">
                  <span className="text-slate-400 font-bold text-sm select-none" dir="ltr">madrasati.sa/p/</span>
                  <input 
                    type="text" 
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="al-hoda"
                    className="flex-1 bg-transparent border-none outline-none font-black text-blue-600 text-lg"
                    dir="ltr"
                  />
                </div>
                <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3 items-center text-blue-700 border border-blue-100">
                  <ShieldCheck size={20} className="shrink-0" />
                  <p className="text-xs font-bold leading-relaxed">هذا الرابط سيكون هوية مدرستك الرسمية. سيتم استخدامه من قبل المعلمين والطلاب للوصول لخططكم بشكل مستمر.</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setStep(2)}
              disabled={!formData.schoolName || !formData.slug}
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-black shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              الخطوة التالية
              <ArrowRight size={24} className="rotate-180" />
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-8 animate-in fade-in slide-in-from-left-4 relative z-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 flex items-center gap-2 mr-2">
                  <User size={16} className="text-blue-500" />
                  اسم مدير النظام للمدرسة
                </label>
                <input 
                  type="text" 
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل الاسم الرباعي"
                  className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-3xl font-black outline-none focus:border-blue-100 focus:bg-white transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 flex items-center gap-2 mr-2">
                    <Mail size={16} className="text-blue-500" />
                    البريد الرسمي
                  </label>
                  <input 
                    type="email" 
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    required
                    placeholder="admin@school.com"
                    className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-3xl font-black outline-none focus:border-blue-100 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 flex items-center gap-2 mr-2">
                    <Lock size={16} className="text-blue-500" />
                    كلمة المرور
                  </label>
                  <input 
                    type="password" 
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-3xl font-black outline-none focus:border-blue-100 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
               <button 
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-6 bg-slate-100 text-slate-600 rounded-[2rem] font-black text-xl hover:bg-slate-200 transition-all"
              >
                رجوع
              </button>
              <button 
                type="submit"
                className="flex-[2] py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all active:scale-95"
              >
                تفعيل حساب المدرسة
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-10 animate-in zoom-in-95 relative z-10">
             <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
               <CheckCircle2 size={80} />
             </div>
             <h2 className="text-4xl font-black text-slate-900 mb-6">مبارك! مدرستكم الآن رقمية</h2>
             <p className="text-slate-500 mb-12 max-w-sm mx-auto leading-relaxed font-bold text-lg">
               تم إعداد بيئة مدرسة <span className="text-blue-600 font-black">{formData.schoolName}</span> بنجاح. يمكنك الآن الدخول والبدء برفع بيانات المعلمين والطلاب.
             </p>
             <button 
              onClick={() => navigate('/login')}
              className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl hover:bg-black shadow-2xl shadow-slate-300 transition-all active:scale-95"
            >
              الانتقال لوحة التحكم
            </button>
          </div>
        )}

        <div className="mt-12 pt-8 border-t text-center relative z-10">
          <Link to="/" className="text-slate-400 hover:text-blue-600 font-black text-sm flex items-center justify-center gap-2 transition-colors">
            العودة للرئيسية
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SchoolRegistration;
