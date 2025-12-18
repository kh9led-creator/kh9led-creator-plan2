
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { School, Student } from '../../types.ts';
import { Image as ImageIcon, Globe, Printer, Share2, Users, Archive, History, Sparkles, MessageCircle, StickyNote, Camera, Trash2, ExternalLink, X, Save, FileText } from 'lucide-react';
import { db } from '../../constants.tsx';
import { Link } from 'react-router-dom';

const WeeklyPlansManagement: React.FC<{ school: School }> = ({ school }) => {
  const [headerContent, setHeaderContent] = useState(school.headerContent || "");
  const [generalMessages, setGeneralMessages] = useState(school.generalMessages || "");
  const [weeklyNotes, setWeeklyNotes] = useState(school.weeklyNotes || "");
  const [weeklyNotesImage, setWeeklyNotesImage] = useState<string | null>(school.weeklyNotesImage || null);
  const [logoUrl, setLogoUrl] = useState<string | null>(school.logoUrl || null);
  const [activeTab, setActiveTab] = useState<'branding' | 'general' | 'students'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  const handleSaveBranding = () => {
    const updated = { ...school, headerContent, generalMessages, weeklyNotes, weeklyNotesImage, logoUrl: logoUrl || undefined };
    db.saveSchool(updated);
    alert('تم حفظ كافة إعدادات الهوية والترويسة بنجاح');
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

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إدارة الخطط الأسبوعية</h2>
          <p className="text-slate-500 font-bold mt-1">تحكم في الروابط العامة وهوية الخطط المطبوعة.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {[{id:'general', label:'روابط الفصول'}, {id:'branding', label:'الهوية والترويسة'}, {id:'students', label:'الطباعة الفردية'}].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="grid grid-cols-1 gap-6">
          {Object.keys(classesGroups).length === 0 ? (
            <div className="bg-white p-24 rounded-[3.5rem] text-center font-black text-slate-300 border-4 border-dashed">يرجى إضافة طلاب أولاً لتوليد روابط الفصول.</div>
          ) : (
            Object.keys(classesGroups).map(className => (
              <div key={className} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition group">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition">
                      {className[0]}
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-800">{className}</h3>
                      <div className="text-xs font-mono text-blue-500 mt-1 flex items-center gap-1">
                        <Globe size={12} /> /p/{school.slug}/{className.replace(/\s+/g, '-')}
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <Link to={`/p/${school.slug}/${className.replace(/\s+/g, '-')}`} target="_blank" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-slate-200 hover:bg-black transition active:scale-95">
                      <ExternalLink size={18} /> معاينة وطباعة الفصل
                   </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                    <Camera size={16} className="text-blue-500" /> شعار المدرسة الرسمي
                 </label>
                 <div className="bg-slate-50 border-4 border-dashed border-slate-100 rounded-[2.5rem] p-8 text-center group relative overflow-hidden h-64 flex flex-col items-center justify-center">
                    {logoUrl ? (
                      <div className="relative group/img h-full">
                        <img src={logoUrl} className="h-full object-contain mb-4 transition group-hover/img:scale-105" />
                        <button onClick={() => setLogoUrl(null)} className="absolute -top-2 -right-2 bg-white text-rose-500 p-2 rounded-full shadow-lg opacity-0 group-hover/img:opacity-100 transition"><X size={16} /></button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-300">
                        <ImageIcon size={64} className="opacity-20" />
                        <p className="font-bold text-sm">ارفع الشعار الرسمي للمدرسة</p>
                      </div>
                    )}
                    <button onClick={() => logoInputRef.current?.click()} className="mt-4 bg-white px-6 py-2.5 rounded-xl text-xs font-black shadow-sm border border-slate-100 hover:bg-blue-600 hover:text-white transition">اختيار شعار</button>
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                    <Sparkles size={16} className="text-blue-500" /> صورة النشاط الأسبوعي
                 </label>
                 <div className="bg-slate-50 border-4 border-dashed border-slate-100 rounded-[2.5rem] p-8 text-center h-64 flex flex-col items-center justify-center relative">
                    {weeklyNotesImage ? (
                      <div className="relative group/act h-full">
                        <img src={weeklyNotesImage} className="h-full object-contain mb-4" />
                        <button onClick={() => setWeeklyNotesImage(null)} className="absolute -top-2 -right-2 bg-white text-rose-500 p-2 rounded-full shadow-lg opacity-0 group-hover/act:opacity-100 transition"><X size={16} /></button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-300">
                         <Camera size={64} className="opacity-20" />
                         <p className="font-bold text-sm">تغيير صورة النشاط (أسفل الخطة)</p>
                      </div>
                    )}
                    <button onClick={() => fileInputRef.current?.click()} className="mt-4 bg-white px-6 py-2.5 rounded-xl text-xs font-black shadow-sm border border-slate-100 hover:bg-blue-600 hover:text-white transition">رفع صورة نشاط</button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2">ترويسة الخطة (أعلى اليمين)</label>
                 <textarea 
                  rows={5} 
                  className="w-full p-6 bg-slate-50 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-blue-100 transition shadow-inner" 
                  value={headerContent} 
                  onChange={e => setHeaderContent(e.target.value)} 
                  placeholder="المملكة العربية السعودية&#10;وزارة التعليم&#10;إدارة التعليم بمحافظة..."
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2">الرسائل العامة (أسفل اليمين)</label>
                 <textarea 
                  rows={5} 
                  className="w-full p-6 bg-slate-50 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-blue-100 transition shadow-inner" 
                  value={generalMessages} 
                  onChange={e => setGeneralMessages(e.target.value)} 
                  placeholder="عزيزي ولي الأمر.. نرجو التعاون في.."
                 />
              </div>

              <div className="md:col-span-2 space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2">ملاحظة أسفل صورة النشاط</label>
                 <input 
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100 transition shadow-inner" 
                  value={weeklyNotes} 
                  onChange={e => setWeeklyNotes(e.target.value)} 
                  placeholder="مثال: كن فطناً.. أو قيمة الأسبوع هي.."
                 />
              </div>
           </div>
           
           <div className="pt-6 border-t border-slate-50">
             <button onClick={handleSaveBranding} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3">
                <Save size={24} className="text-blue-400" />
                حفظ كافة تعديلات الهوية
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
                  <p className="text-blue-100 font-bold">هذه الميزة تولد ملف PDF يحتوي على صفحة مخصصة لكل طالب باسمه.</p>
               </div>
               <Link 
                  to={`/p/${school.slug}/bulk/students`} 
                  className="bg-white text-blue-600 px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-blue-50 transition shadow-lg active:scale-95 flex items-center gap-3"
               >
                  <Printer size={24} />
                  فتح محرك الطباعة الجماعي
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
                           <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">عدد الطلاب المسجلين</div>
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
