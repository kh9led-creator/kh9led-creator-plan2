
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
  Phone,
  ChevronLeft,
  Eye,
  EyeOff
} from 'lucide-react';

interface Props {
  onLogin: (role: UserRole, school: School | null, user: any) => void;
}

const SchoolRegistration: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Refs for focusing inputs via icons
  const schoolNameRef = useRef<HTMLInputElement>(null);
  const adminUsernameRef = useRef<HTMLInputElement>(null);
  const adminPasswordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const adminPhoneRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    schoolName: '',
    adminUsername: '',
    adminPassword: '',
    email: '',
    adminPhone: '',
    slug: '',
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
        adminUsername: formData.adminUsername,
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
    }, 1500);
  };

  const isStep1Valid = formData.schoolName && formData.adminUsername && formData.adminPassword && formData.email && formData.adminPhone;

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6 font-['Tajawal']">
      <div className="w-full max-w-[580px] animate-in fade-in zoom-in-95 duration-500">
        
        {step < 3 && (
          <div className="flex justify-center gap-2 mb-10">
             <div className={`h-2 w-16 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-100'}`}></div>
             <div className={`h-2 w-16 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-100'}`}></div>
          </div>
        )}

        <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.06)] border border-slate-50 relative overflow-hidden">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
              <div className="text-center">
                <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-4"><Sparkles size={24} /></div>
                <h2 className="text-3xl font-black text-slate-900">بيانات المدرسة والمسؤول</h2>
                <p className="text-slate-400 mt-2 font-bold text-sm">تأسيس الهوية الرقمية للمنصة</p>
              </div>

              <div className="space-y-5">
                {/* اسم المدرسة */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-xs font-black text-slate-500">اسم المدرسة</label>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-md">عربي / إنجليزي</span>
                  </div>
                  <div className="relative group">
                    <button 
                      type="button" 
                      onClick={() => schoolNameRef.current?.focus()}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"
                    >
                      <SchoolIcon size={20} />
                    </button>
                    <input 
                      ref={schoolNameRef}
                      type="text" 
                      name="schoolName" 
                      value={formData.schoolName} 
                      onChange={handleInputChange} 
                      placeholder="مثال: مدرسة التميز الذكية" 
                      className="w-full p-4.5 pr-12 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* اسم المستخدم */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-xs font-black text-slate-500">اسم المستخدم</label>
                      <span className="text-[10px] font-bold text-slate-400">إنجليزي فقط</span>
                    </div>
                    <div className="relative group">
                      <button 
                        type="button" 
                        onClick={() => adminUsernameRef.current?.focus()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"
                      >
                        <User size={18} />
                      </button>
                      <input 
                        ref={adminUsernameRef}
                        type="text" 
                        name="adminUsername" 
                        value={formData.adminUsername} 
                        onChange={handleInputChange} 
                        placeholder="username" 
                        dir="ltr" 
                        className="w-full p-4.5 pr-12 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                  {/* كلمة المرور */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-xs font-black text-slate-500">كلمة المرور</label>
                      <span className="text-[10px] font-bold text-slate-400">إنجليزي</span>
                    </div>
                    <div className="relative group">
                      <button 
                        type="button" 
                        onClick={() => adminPasswordRef.current?.focus()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"
                      >
                        <Lock size={18} />
                      </button>
                      <input 
                        ref={adminPasswordRef}
                        type={showPassword ? "text" : "password"} 
                        name="adminPassword" 
                        value={formData.adminPassword} 
                        onChange={handleInputChange} 
                        placeholder="••••••••" 
                        dir="ltr" 
                        className="w-full p-4.5 pr-12 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-sm" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* البريد الإلكتروني */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-xs font-black text-slate-500">البريد الإلكتروني</label>
                      <span className="text-[10px] font-bold text-slate-400">إنجليزي</span>
                    </div>
                    <div className="relative group">
                      <button 
                        type="button" 
                        onClick={() => emailRef.current?.focus()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"
                      >
                        <Mail size={18} />
                      </button>
                      <input 
                        ref={emailRef}
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        placeholder="admin@school.com" 
                        dir="ltr" 
                        className="w-full p-4.5 pr-12 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                  {/* رقم الجوال */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-xs font-black text-slate-500">رقم الجوال</label>
                      <span className="text-[10px] font-bold text-slate-400">05XXXXXXXX</span>
                    </div>
                    <div className="relative group">
                      <button 
                        type="button" 
                        onClick={() => adminPhoneRef.current?.focus()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"
                      >
                        <Phone size={18} />
                      </button>
                      <input 
                        ref={adminPhoneRef}
                        type="tel" 
                        name="adminPhone" 
                        value={formData.adminPhone} 
                        onChange={handleInputChange} 
                        placeholder="05XXXXXXXX" 
                        dir="ltr" 
                        className="w-full p-4.5 pr-12 bg-slate-50/50 border-2 border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3 shadow-xl shadow-indigo-100"
              >
                اختيار رابط المدرسة
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-6">
              <div className="text-center">
                <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4"><Globe size={24} /></div>
                <h2 className="text-3xl font-black text-slate-900">رابط المنصة واللمسات الأخيرة</h2>
                <p className="text-slate-400 mt-2 font-bold text-sm">حدد الرابط الخاص وارفع شعار مدرستك</p>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-32 h-32 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all relative group overflow-hidden shadow-inner"
                  >
                    {formData.logoUrl ? (
                      <div className="relative w-full h-full p-3 animate-in zoom-in-75">
                         <img src={formData.logoUrl} className="w-full h-full object-contain" alt="Logo" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Camera size={24} />
                         </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-300 group-hover:text-indigo-400 transition-colors">
                        <Camera size={32} />
                        <span className="text-[10px] font-black block mt-2 uppercase">ارفع شعارك</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  {formData.logoUrl && (
                    <button onClick={() => setFormData({...formData, logoUrl: ''})} className="text-rose-500 font-bold text-xs flex items-center gap-1 hover:underline">
                      <X size={14} /> إزالة الشعار
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-xs font-black text-slate-500">رابط المدرسة الفرعي</label>
                    <span className="text-[10px] font-bold text-slate-400">إنجليزي فقط</span>
                  </div>
                  <div className="bg-slate-50/50 p-5 rounded-[1.5rem] border-2 border-transparent flex items-center gap-2 focus-within:bg-white focus-within:border-indigo-100 focus-within:ring-4 focus-within:ring-indigo-50/50 transition-all shadow-sm" dir="ltr">
                    <button type="button" onClick={() => slugRef.current?.focus()} className="text-slate-300"><Globe size={20} /></button>
                    <span className="text-slate-400 font-bold text-sm">/p/</span>
                    <input 
                      ref={slugRef}
                      type="text" 
                      name="slug" 
                      value={formData.slug} 
                      onChange={handleInputChange} 
                      className="flex-1 bg-transparent border-none outline-none font-black text-indigo-600 text-lg placeholder:text-slate-200" 
                      placeholder="school-url" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                   <ChevronLeft className="rotate-180" size={20} /> رجوع
                 </button>
                 <button 
                  onClick={handleCreateEnvironment}
                  disabled={loading || !formData.slug}
                  className="flex-[2] py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 size={24} className="animate-spin" /> : 'إطلاق المنصة'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 animate-in zoom-in-95">
               <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                 <CheckCircle2 size={64} />
               </div>
               <h2 className="text-4xl font-black text-slate-900 mb-4">تم الإعداد بنجاح</h2>
               <p className="text-slate-500 mb-10 font-bold text-base leading-relaxed px-8">
                 مرحباً بك في <span className="text-indigo-600 font-black">نظام خططي</span>. مدرستك الآن جاهزة للعمل، يمكنك البدء بإضافة المعلمين وتوزيع الجداول.
               </p>
               <button 
                onClick={() => navigate('/login')} 
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-4"
               >
                 تسجيل الدخول للمنصة
                 <ArrowRight size={24} />
               </button>
            </div>
          )}
        </div>
        
        {step < 3 && (
          <div className="mt-8 text-center">
            <button onClick={() => navigate('/')} className="text-slate-400 font-bold text-sm hover:text-indigo-600 transition flex items-center justify-center gap-2 mx-auto">
              إلغاء والعودة للرئيسية <ChevronLeft size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolRegistration;
