
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../constants';
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
      if (name === 'schoolName') {
        newData.slug = value.toLowerCase()
          .replace(/[^\u0621-\u064A0-9a-zA-Z\s]/g, '')
          .replace(/\s+/g, '-');
      }
      return newData;
    });
  };

  const handleFinalize = () => {
    const newSchool = {
      id: Date.now().toString(),
      name: formData.schoolName,
      slug: formData.slug,
      subscriptionActive: true,
      studentCount: 0,
      teacherCount: 0,
      expiryDate: '2025-12-30'
    };
    db.saveSchool(newSchool);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Tajawal']">
      <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl shadow-slate-200 border border-slate-100 max-w-3xl w-full relative overflow-hidden">
        
        {step < 3 && (
          <div className="text-center mb-12 relative z-10">
            <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-white shadow-2xl shadow-blue-200">
              <SchoolIcon size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-3">تأسيس مدرستك الرقمية</h2>
            <p className="text-slate-500 font-medium text-lg">أدخل بيانات مدرستك لتفعيل بيئتك المستقلة</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 flex items-center gap-2 mr-2">اسم المدرسة الرسمي</label>
                <input 
                  type="text" 
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  placeholder="مثال: مدرسة منارة الهدى النموذجية"
                  className="w-full p-5 bg-slate-50 border-none rounded-3xl font-black text-lg outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-700 flex items-center gap-2 mr-2">رابط الوصول (Slug)</label>
                <div className="flex items-center gap-3 bg-slate-50 p-5 rounded-3xl">
                  <span className="text-slate-400 font-bold" dir="ltr">madrasati.sa/p/</span>
                  <input 
                    type="text" 
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-none outline-none font-black text-blue-600"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={() => setStep(2)}
              disabled={!formData.schoolName || !formData.slug}
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-black transition-all disabled:opacity-50"
            >
              الخطوة التالية
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); handleFinalize(); }} className="space-y-8 animate-in fade-in slide-in-from-left-4">
             <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 mr-2">اسم مدير المدرسة</label>
                  <input 
                    type="text" 
                    required
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    className="w-full p-5 bg-slate-50 border-none rounded-3xl font-black outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 mr-2">كلمة المرور للمدير (admin)</label>
                  <input 
                    type="password" 
                    required
                    placeholder="سيتم استخدامها للدخول"
                    className="w-full p-5 bg-slate-50 border-none rounded-3xl font-black outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
             </div>
             <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-700">تفعيل حساب المدرسة</button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-10 animate-in zoom-in-95">
             <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-[3rem] flex items-center justify-center mx-auto mb-10">
               <CheckCircle2 size={80} />
             </div>
             <h2 className="text-4xl font-black text-slate-900 mb-6">تمت العملية بنجاح!</h2>
             <p className="text-slate-500 mb-12 font-bold text-lg">مدرستك الآن جاهزة. استخدم الـ Slug الخاص بك كاسم مستخدم للدخول.</p>
             <button onClick={() => navigate('/login')} className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl">الدخول للوحة التحكم</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolRegistration;
