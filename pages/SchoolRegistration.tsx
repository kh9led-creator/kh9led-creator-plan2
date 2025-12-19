
import React, { useState, useRef } from 'react';
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
  Sparkles,
  Camera,
  X,
  Mail,
  Phone
} from 'lucide-react';

interface Props {
  onLogin: (role: UserRole, school: School | null, user: any) => void;
}

const SchoolRegistration: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    schoolName: '',
    slug: '',
    email: '',
    adminPhone: '',
    adminName: '',
    adminPassword: '',
    logoUrl: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'schoolName') {
        newData.slug = value.toLowerCase()
          .replace(/[^\u0621-\u064A0-9a-zA-Z\s]/g, '')
          .replace(/\s+/g, '-');
      }
      return newData;
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEnvironment = () => {
    setLoading(true);
    setTimeout(() => {
      const newSchool: School = {
        id: Date.now().toString(),
        name: formData.schoolName,
        slug: formData.slug,
        email: formData.email,
        adminPhone: formData.adminPhone,
        logoUrl: formData.logoUrl,
        adminPassword: formData.adminPassword,
        subscriptionActive: true,
        studentCount: 0,
        teacherCount: 0,
        expiryDate: '2026-01-01'
      };
      
      db.saveSchool(newSchool);
      setLoading(false);
      setStep(3);
    }, 2000);
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
    <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6 font-['Tajawal']">
      <div className="w-full max-w-[540px] animate-in fade-in zoom-in-95 duration-700">
        
        {step < 3 && (
          <div className="flex justify-center gap-2 mb-8">
             <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
             <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
          </div>
        )}

        <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-50 relative overflow-hidden">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h2 className="text-3xl font-black text-slate-900">هوية مدرستك</h2>
                <p className="text-slate-400 mt-2 font-bold text-sm leading-relaxed">أدخل المسمى الرسمي للمدرسة ليتم إنشاء الرابط</p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all relative group overflow-hidden"
                  >
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-300 group-hover:text-indigo-500 transition">
                        <Camera size={28} />
                        <span className="text-[9px] font-black mt-1 uppercase">شعار المدرسة</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </div>

                <div className="space-y-1.5">
                  <input 
                    type="text" 
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    placeholder="اسم المدرسة (مثال: مدرسة التميز)"
                    className="w-full p-5 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold text-lg outline-none focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="bg-slate-50/50 p-5 rounded-2xl border-2 border-transparent flex items-center gap-2" dir="ltr">
                    <Globe size={18} className="text-slate-300" />
                    <span className="text-slate-400 font-bold text-sm">/p/</span>
                    <input 
                      type="text" 
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent border-none outline-none font-black text-indigo-600 text-lg"
                      placeholder="school-slug"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mr-2">هذا الرابط سيستخدمه أولياء الأمور والطلاب.</p>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!formData.schoolName || !formData.slug}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3 shadow-xl shadow-indigo-100"
              >
                متابعة الخطوات
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
              <div className="text-center">
                <h2 className="text-3xl font-black text-slate-900">بيانات الإدارة</h2>
                <p className="text-slate-400 mt-2 font-bold text-sm leading-relaxed">أدخل بيانات التواصل والتحقق للمدير</p>
              </div>

              <div className="space-y-5">
                <div className="relative group">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="text" 
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    placeholder="الاسم الكامل للمدير"
                    className="w-full p-5 pr-12 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all"
                  />
                </div>

                <div className="relative group">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="البريد الإلكتروني للمدير"
                    className="w-full p-5 pr-12 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all text-left"
                    dir="ltr"
                  />
                </div>

                <div className="relative group">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="tel" 
                    name="adminPhone"
                    value={formData.adminPhone}
                    onChange={handleInputChange}
                    placeholder="رقم جوال المدير"
                    className="w-full p-5 pr-12 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all text-left"
                    dir="ltr"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="password" 
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleInputChange}
                    placeholder="كلمة المرور للإدارة"
                    className="w-full p-5 pr-12 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all">رجوع</button>
                 <button 
                  onClick={handleCreateEnvironment}
                  disabled={loading || !formData.adminName || !formData.adminPassword || !formData.email || !formData.adminPhone}
                  className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 size={24} className="animate-spin" /> : 'إنشاء المنصة'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 animate-in zoom-in-95">
               <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                 <CheckCircle2 size={54} />
               </div>
               
               <h2 className="text-3xl font-black text-slate-900 mb-4">مبارك! مدرستك جاهزة</h2>
               <p className="text-slate-500 mb-10 font-bold text-sm leading-relaxed px-6">
                 لقد تم إنشاء البيئة الرقمية لمدرسة <span className="text-indigo-600 font-black">{formData.schoolName}</span> بنجاح. يمكنك الآن البدء بإضافة المعلمين والطلاب.
               </p>

               <button 
                onClick={handleAutoLogin} 
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xl hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-4"
               >
                 دخول للوحة التحكم
                 <ArrowRight size={24} />
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolRegistration;
