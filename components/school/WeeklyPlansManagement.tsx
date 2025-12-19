
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { School, Student } from '../../types.ts';
import { Globe, Printer, Users, Sparkles, Camera, X, Save, CheckCircle2, Copy, ExternalLink, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { db } from '../../constants.tsx';
import { Link } from 'react-router-dom';

const WeeklyPlansManagement: React.FC<{ school: School }> = ({ school: initialSchool }) => {
  const [school, setSchool] = useState<School>(initialSchool);
  const [headerContent, setHeaderContent] = useState(school.headerContent || "");
  const [generalMessages, setGeneralMessages] = useState(school.generalMessages || "");
  const [weeklyNotes, setWeeklyNotes] = useState(school.weeklyNotes || "");
  const [weeklyNotesImage, setWeeklyNotesImage] = useState<string | null>(school.weeklyNotesImage || null);
  const [logoUrl, setLogoUrl] = useState<string | null>(school.logoUrl || null);
  const [activeTab, setActiveTab] = useState<'branding' | 'links' | 'students'>('links');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // تحديث القيم عند تغير المدرسة
  useEffect(() => {
    setHeaderContent(initialSchool.headerContent || "");
    setGeneralMessages(initialSchool.generalMessages || "");
    setWeeklyNotes(initialSchool.weeklyNotes || "");
    setWeeklyNotesImage(initialSchool.weeklyNotesImage || null);
    setLogoUrl(initialSchool.logoUrl || null);
    setSchool(initialSchool);
  }, [initialSchool]);

  const handleSaveBranding = () => {
    const updated: School = { 
      ...school, 
      headerContent, 
      generalMessages, 
      weeklyNotes, 
      weeklyNotesImage: weeklyNotesImage || undefined, 
      logoUrl: logoUrl || undefined 
    };
    db.saveSchool(updated);
    setSchool(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/#/p/${school.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setWeeklyNotesImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const students = db.getStudents(school.id);
  const classesGroups = useMemo(() => {
    const groups: Record<string, Student[]> = {};
    students.forEach(s => {
      const key = `${s.grade} - فصل ${s.section}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [students]);

  return (
    <div className="space-y-8 animate-in fade-in font-['Tajawal']">
      <div>
        <h2 className="text-3xl font-black text-slate-900">بوابة الخطط الأسبوعية</h2>
        <p className="text-slate-500 font-bold mt-1">إدارة الرابط الموحد وهوية المطبوعات.</p>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          {id:'links', label:'الرابط العام'}, 
          {id:'branding', label:'الهوية والترويسة'}, 
          {id:'students', label:'الطباعة الفردية'}
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'links' && (
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm text-center space-y-8">
           <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
              <Globe size={40} />
           </div>
           <div>
              <h3 className="text-2xl font-black text-slate-800">الرابط الموحد للمدرسة</h3>
              <p className="text-slate-500 font-bold mt-2">رابط واحد يحتوي على كافة خطط الفصول المتاحة في مدرستك.</p>
           </div>
           
           <div className="max-w-xl mx-auto flex items-center gap-3 bg-slate-50 p-3 rounded-[2rem] border-2 border-slate-100">
              <div className="flex-1 text-left px-4 font-mono text-blue-600 font-bold overflow-hidden truncate">
                 {window.location.origin}/#/p/{school.slug}
              </div>
              <button 
                onClick={handleCopyLink}
                className={`px-6 py-3 rounded-2xl font-black transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black'}`}
              >
                 {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                 {copied ? 'تم النسخ' : 'نسخ الرابط'}
              </button>
           </div>

           <div className="flex justify-center gap-4">
              <Link to={`/p/${school.slug}`} target="_blank" className="flex items-center gap-2 text-blue-600 font-black hover:underline underline-offset-8">
                 <ExternalLink size={18} />
                 فتح الرابط كولي أمر
              </Link>
           </div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                    <Camera size={16} className="text-blue-500" /> شعار المدرسة الرسمي
                 </label>
                 <div 
                    onClick={() => logoInputRef.current?.click()}
                    className="bg-slate-50 border-4 border-dashed border-slate-100 rounded-[2.5rem] p-8 text-center h-64 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                 >
                    {logoUrl ? (
                      <div className="relative group/img h-full flex items-center">
                        <img src={logoUrl} className="max-h-full object-contain transition group-hover/img:scale-105" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setLogoUrl(null); }} 
                          className="absolute -top-2 -right-2 bg-white text-rose-500 p-2 rounded-full shadow-lg opacity-0 group-hover/img:opacity-100 transition hover:bg-rose-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-300 group-hover:text-blue-400 transition-colors">
                        <ImageIcon size={64} className="opacity-20" />
                        <p className="font-bold text-sm">ارفع الشعار الرسمي</p>
                      </div>
                    )}
                    {!logoUrl && (
                      <button className="mt-4 bg-white px-6 py-2 rounded-xl text-xs font-black shadow-sm border group-hover:bg-blue-600 group-hover:text-white transition-all">اختيار شعار</button>
                    )}
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                    <Sparkles size={16} className="text-blue-500" /> صورة النشاط الأسبوعي
                 </label>
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-50 border-4 border-dashed border-slate-100 rounded-[2.5rem] p-8 text-center h-64 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                 >
                    {weeklyNotesImage ? (
                      <div className="relative group/act h-full flex items-center">
                        <img src={weeklyNotesImage} className="max-h-full object-contain" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setWeeklyNotesImage(null); }} 
                          className="absolute -top-2 -right-2 bg-white text-rose-500 p-2 rounded-full shadow-lg opacity-0 group-hover/act:opacity-100 transition hover:bg-rose-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-300 group-hover:text-blue-400 transition-colors">
                         <Camera size={64} className="opacity-20" />
                         <p className="font-bold text-sm">تغيير صورة النشاط</p>
                      </div>
                    )}
                    {!weeklyNotesImage && (
                      <button className="mt-4 bg-white px-6 py-2 rounded-xl text-xs font-black shadow-sm border group-hover:bg-blue-600 group-hover:text-white transition-all">رفع صورة نشاط</button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2">ترويسة الخطة (أعلى اليمين)</label>
                 <textarea rows={4} className="w-full p-6 bg-slate-50 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-blue-100 transition shadow-inner" value={headerContent} onChange={e => setHeaderContent(e.target.value)} placeholder="المملكة العربية السعودية&#10;وزارة التعليم&#10;إدارة التعليم بمحافظة..." />
              </div>

              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2">الرسائل العامة (تذييل الخطة)</label>
                 <textarea rows={4} className="w-full p-6 bg-slate-50 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-blue-100 transition shadow-inner" value={generalMessages} onChange={e => setGeneralMessages(e.target.value)} placeholder="عزيزي ولي الأمر.. نرجو التعاون في.." />
              </div>

              <div className="md:col-span-2 space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2">ملاحظة النشاط (أسفل صورة النشاط)</label>
                 <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100 transition shadow-inner" value={weeklyNotes} onChange={e => setWeeklyNotes(e.target.value)} placeholder="مثال: قيمة الأسبوع هي الأمانة" />
              </div>
           </div>
           
           <div className="pt-6 border-t">
             <button 
                onClick={handleSaveBranding} 
                className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isSaved ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-black'}`}
             >
                {isSaved ? <CheckCircle2 size={24} /> : <Save size={24} />}
                {isSaved ? 'تم حفظ التغييرات بنجاح' : 'حفظ التغييرات'}
             </button>
           </div>
        </div>
      )}

      {activeTab === 'students' && (
         <div className="space-y-10 animate-in fade-in">
            <div className="bg-blue-600 text-white p-10 rounded-[3.5rem] shadow-xl shadow-blue-100 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="text-center md:text-right">
                  <h3 className="text-3xl font-black mb-2 flex items-center gap-3 justify-center md:justify-start">
                     <Users size={32} />
                     الطباعة الفردية للطلاب
                  </h3>
                  <p className="text-blue-100 font-bold">توليد صفحة خطة مخصصة لكل طالب تحمل اسمه وتفاصيله.</p>
               </div>
               <Link to={`/p/${school.slug}/bulk/students`} className="bg-white text-blue-600 px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-blue-50 transition shadow-lg active:scale-95 flex items-center gap-3">
                  <Printer size={24} />
                  فتح محرك الطباعة
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {Object.keys(classesGroups).map(className => (
                  <div key={className} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                           {classesGroups[className].length}
                        </div>
                        <div>
                           <div className="font-black text-slate-800">{className}</div>
                           <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">طلاب الفصل</div>
                        </div>
                     </div>
                     <Link to={`/p/${school.slug}/bulk/students?class=${encodeURIComponent(className)}`} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition">
                        <Printer size={20} />
                     </Link>
                  </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
};

export default WeeklyPlansManagement;
