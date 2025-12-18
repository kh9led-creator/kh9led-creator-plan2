
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../constants.tsx';
import { UserRole, School } from '../types.ts';
import { 
  School as SchoolIcon, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Lock, 
  User, 
  Globe, 
  Zap, 
  Sparkles 
} from 'lucide-react';

interface Props {
  onLogin: (role: UserRole, school: School | null, user: any) => void;
}

const SchoolRegistration: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    slug: '',
    adminName: '',
    adminPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'schoolName') {
        // توليد Slug ذكي من اسم المدرسة
        newData.slug = value.toLowerCase()
          .replace(/[^\u0621-\u064A0-9a-zA-Z\s]/g, '')
          .replace(/\s+/g, '-');
      }
      return newData;
    });
  };

  const handleCreateEnvironment = () => {
    setLoading(true);
    
    // محاكاة عملية "تهيئة الخوادم والبيئة الرقمية" لإعطاء شعور بالاحترافية
    setTimeout(() => {
      const newSchool: School = {
        id: Date.now().toString(),
        name: formData.schoolName,
        slug: formData.slug,
        adminPassword: formData.adminPassword,
        subscriptionActive: true,
        studentCount: 0,
        teacherCount: 0,
        expiryDate: '2026-01-01'
      };
      
      db.saveSchool(newSchool);
      setLoading(false);
      setStep(3);
    }, 2500);
  };

  const handleAutoLogin = () => {
    const schools = db.getSchools();
    const school = schools.find(s => s.slug === formData.slug);
    if (school) {
      onLogin('SCHOOL_ADMIN', school, { name: formData.adminName });
      navigate('/school');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Tajawal']">
      <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl shadow-slate-200 border border-slate-100 max-w-2xl w-full relative overflow-hidden">
        
        {/* Step Progress Bar */}
        {step < 3 && (
          <div className="absolute top-0 left-0 w-full h-2 flex">
            <div className={`h-full transition-all duration-500 bg-blue-600 ${step >= 1 ? 'w-1/2' : 'w-0'}`}></div>
            <div className={`h-full transition-all duration-500 bg-blue-600 ${step >= 2 ? 'w-1/2' : 'w-0'}`}></div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-blue-100">
                <SchoolIcon size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900">هوية مدرستك</h2>
              <p className="text-slate-500 mt-2">لنبدأ بتحديد اسم مدرستك ورابطها الخاص</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500" /> اسم المدرسة
                </label>
                <input 
                  type="text" 
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  placeholder="مثال: مدرسة التميز الأهلية"
                  className="w-full p-5 bg-slate-50 border-none rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                  <Globe size={16} className="text-blue-500" /> رابط الوصول الفريد
                </label>
                <div className="flex items-center gap-3 bg-slate-50 p-5 rounded-3xl border-2 border-transparent focus-within:border-blue-100 transition-all">
                  <span className="text-slate-400 font-bold hidden sm:inline" dir="ltr">app.madrasati.sa/</span>
                  <input 
                    type="text" 
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-none outline-none font-black text-blue-600 text-lg"
                    dir="ltr"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mr-2">هذا الرابط سيستخدمه المعلمون للدخول والطلاب لمشاهدة الخطط.</p>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={!formData.schoolName || !formData.slug}
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-black transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-3"
            >
              متابعة الإعداد
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-blue-100">
                <Lock size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900">حساب المدير</h2>
              <p className="text-slate-500 mt-2">بيانات الدخول للوحة تحكم المدرسة</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                  <User size={16} className="text-blue-500" /> اسم المدير
                </label>
                <input 
                  type="text" 
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  placeholder="الاسم الكامل"
                  className="w-full p-5 bg-slate-50 border-none rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                  <Lock size={16} className="text-blue-500" /> كلمة مرور قوية
                </label>
                <input 
                  type="password" 
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full p-5 bg-slate-50 border-none rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                />
              </div>
            </div>

            <button 
              onClick={handleCreateEnvironment}
              disabled={loading || !formData.adminName || !formData.adminPassword}
              className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  جاري تهيئة البيئة الرقمية...
                </>
              ) : (
                <>
                  <Zap size={24} />
                  إطلاق المنصة الآن
                </>
              )}
            </button>
            
            <button 
              onClick={() => setStep(1)} 
              className="w-full text-slate-400 font-bold text-sm hover:text-slate-600 transition"
            >
              العودة لتعديل بيانات المدرسة
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-6 animate-in zoom-in-95">
             <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-[3.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner relative">
               <CheckCircle2 size={80} />
               <div className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-lg text-blue-600">
                  <Sparkles size={24} />
               </div>
             </div>
             
             <h2 className="text-4xl font-black text-slate-900 mb-4">أهلاً بك في "مدرستي"</h2>
             <p className="text-slate-500 mb-10 font-bold text-lg leading-relaxed">
               لقد تم إنشاء البيئة الرقمية لمدرسة <br/>
               <span className="text-blue-600 font-black">{formData.schoolName}</span> بنجاح!
             </p>

             <div className="grid grid-cols-1 gap-4 mb-10">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-right">
                   <div className="text-xs font-black text-slate-400 uppercase mb-2">رابط المدرسة المخصص</div>
                   <div className="text-lg font-mono text-blue-600">madrasati.sa/p/{formData.slug}</div>
                </div>
             </div>

             <button 
              onClick={handleAutoLogin} 
              className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-4"
             >
               ابدأ الإدارة الآن
               <ArrowRight size={24} />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolRegistration;
