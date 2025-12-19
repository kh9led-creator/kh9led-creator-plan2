
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { School, Student, AcademicWeek } from '../../types.ts';
import { Globe, Printer, Users, Sparkles, Camera, X, Save, CheckCircle2, Copy, ExternalLink, Link as LinkIcon, Image as ImageIcon, UserCircle, Archive, History, Trash2, Calendar, Plus, CheckCircle } from 'lucide-react';
import { db } from '../../constants.tsx';
import { Link } from 'react-router-dom';

const WeeklyPlansManagement: React.FC<{ school: School }> = ({ school: initialSchool }) => {
  const [school, setSchool] = useState<School>(initialSchool);
  const [headerContent, setHeaderContent] = useState(school.headerContent || "");
  const [generalMessages, setGeneralMessages] = useState(school.generalMessages || "");
  const [weeklyNotes, setWeeklyNotes] = useState(school.weeklyNotes || "");
  const [weeklyNotesImage, setWeeklyNotesImage] = useState<string | null>(school.weeklyNotesImage || null);
  const [logoUrl, setLogoUrl] = useState<string | null>(school.logoUrl || null);
  const [activeTab, setActiveTab] = useState<'branding' | 'links' | 'students' | 'weeks'>('weeks');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  
  // حالات الأسابيع
  const [weeks, setWeeks] = useState<AcademicWeek[]>([]);
  const [newWeek, setNewWeek] = useState({ name: '', startDate: '', endDate: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHeaderContent(initialSchool.headerContent || "");
    setGeneralMessages(initialSchool.generalMessages || "");
    setWeeklyNotes(initialSchool.weeklyNotes || "");
    setWeeklyNotesImage(initialSchool.weeklyNotesImage || null);
    setLogoUrl(initialSchool.logoUrl || null);
    setSchool(initialSchool);
    setWeeks(db.getWeeks(initialSchool.id));
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

  const handleAddWeek = () => {
    if (!newWeek.name || !newWeek.startDate || !newWeek.endDate) {
      alert('يرجى إكمال بيانات الأسبوع');
      return;
    }
    const week: AcademicWeek = {
      id: Date.now().toString(),
      name: newWeek.name,
      startDate: newWeek.startDate,
      endDate: newWeek.endDate,
      isActive: weeks.length === 0 // أول أسبوع يضاف يكون نشطاً تلقائياً
    };
    db.saveWeek(school.id, week);
    setWeeks(db.getWeeks(school.id));
    setNewWeek({ name: '', startDate: '', endDate: '' });
  };

  const toggleWeekActive = (id: string) => {
    db.setActiveWeek(school.id, id);
    setWeeks(db.getWeeks(school.id));
  };

  const deleteWeek = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الأسبوع؟ سيتم حذف جميع الخطط المرتبطة به.')) {
      db.deleteWeek(school.id, id);
      setWeeks(db.getWeeks(school.id));
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
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

  const publicLink = `${window.location.origin}/#/p/${school.slug}`;
  const teacherLink = `${window.location.origin}/#/school/${school.slug}/teacher-login`;

  return (
    <div className="space-y-8 animate-in fade-in font-['Tajawal'] pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إدارة الخطط الدراسية</h2>
          <p className="text-slate-500 font-bold mt-1">حدد الأسابيع المتاحة للرصد وتحكم في هوية المطبوعات.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          {id:'weeks', label:'إدارة الأسابيع'},
          {id:'links', label:'روابط الوصول'}, 
          {id:'branding', label:'الهوية والترويسة'}, 
          {id:'students', label:'الطباعة الفردية'}
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'weeks' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
             <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">إضافة أسبوع دراسي جديد</h3>
                  <p className="text-sm text-slate-500 font-bold">قم بتحديد مسمى الأسبوع والنطاق الزمني له لتمكين المعلمين من الرصد.</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 mr-2">مسمى الأسبوع</label>
                   <input 
                    type="text" 
                    placeholder="مثال: الأسبوع الثاني"
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition"
                    value={newWeek.name}
                    onChange={e => setNewWeek({...newWeek, name: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 mr-2">من تاريخ</label>
                   <input 
                    type="date" 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition"
                    value={newWeek.startDate}
                    onChange={e => setNewWeek({...newWeek, startDate: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 mr-2">إلى تاريخ</label>
                   <input 
                    type="date" 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition"
                    value={newWeek.endDate}
                    onChange={e => setNewWeek({...newWeek, endDate: e.target.value})}
                   />
                </div>
             </div>
             <button 
                onClick={handleAddWeek}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95"
             >حفظ الأسبوع الدراسي</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {weeks.length === 0 ? (
               <div className="col-span-full p-24 text-center text-slate-300 font-bold border-4 border-dashed rounded-[3.5rem]">
                  لا توجد أسابيع دراسية مضافة. ابدأ بإضافة الأسبوع الأول أعلاه.
               </div>
             ) : (
               weeks.map(week => (
                 <div key={week.id} className={`bg-white p-8 rounded-[3rem] border-2 transition-all relative overflow-hidden group ${week.isActive ? 'border-indigo-600 shadow-xl shadow-indigo-50' : 'border-slate-100 shadow-sm opacity-80'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${week.isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <Calendar size={28} />
                       </div>
                       <button onClick={() => deleteWeek(week.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                    </div>
                    
                    <h4 className="text-xl font-black text-slate-900 mb-2">{week.name}</h4>
                    <div className="space-y-1 mb-6">
                       <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          من: {week.startDate}
                       </p>
                       <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          إلى: {week.endDate}
                       </p>
                    </div>

                    <button 
                      onClick={() => toggleWeekActive(week.id)}
                      disabled={week.isActive}
                      className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${week.isActive ? 'bg-emerald-500 text-white cursor-default' : 'bg-slate-900 text-white hover:bg-black'}`}
                    >
                       {week.isActive ? <><CheckCircle size={16} /> متاح للرصد الآن</> : 'تفعيل للرصد حالياً'}
                    </button>
                 </div>
               ))
             )}
          </div>
        </div>
      )}

      {activeTab === 'links' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-inner"><Globe size={32} /></div>
              <div>
                 <h3 className="text-xl font-black text-slate-800">رابط أولياء الأمور</h3>
                 <p className="text-slate-500 font-bold text-sm mt-1 leading-relaxed">الرابط العام الذي يتم نشره للأهالي لمتابعة خطط أبنائهم.</p>
              </div>
              <div className="w-full bg-slate-50 p-3 rounded-2xl border-2 border-slate-100 flex items-center gap-3">
                 <div className="flex-1 text-left px-2 font-mono text-blue-600 font-bold text-xs truncate" dir="ltr">{publicLink}</div>
                 <button onClick={() => handleCopy(publicLink, 'public')} className={`p-3 rounded-xl transition-all ${copiedLink === 'public' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black'}`}>
                    {copiedLink === 'public' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                 </button>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-inner"><UserCircle size={32} /></div>
              <div>
                 <h3 className="text-xl font-black text-slate-800">رابط المعلمين</h3>
                 <p className="text-slate-500 font-bold text-sm mt-1 leading-relaxed">بوابة الدخول الخاصة بالمعلمين لرصد الخطط الأسبوعية والغياب.</p>
              </div>
              <div className="w-full bg-slate-50 p-3 rounded-2xl border-2 border-slate-100 flex items-center gap-3">
                 <div className="flex-1 text-left px-2 font-mono text-indigo-600 font-bold text-xs truncate" dir="ltr">{teacherLink}</div>
                 <button onClick={() => handleCopy(teacherLink, 'teacher')} className={`p-3 rounded-xl transition-all ${copiedLink === 'teacher' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black'}`}>
                    {copiedLink === 'teacher' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2"><Camera size={16} className="text-blue-500" /> شعار المدرسة الرسمي</label>
                 <div onClick={() => logoInputRef.current?.click()} className="bg-slate-50 border-4 border-dashed border-slate-100 rounded-[2.5rem] p-8 text-center h-64 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                    {logoUrl ? (
                      <div className="relative group/img h-full flex items-center"><img src={logoUrl} className="max-h-full object-contain transition group-hover/img:scale-105" /></div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-300 group-hover:text-blue-400 transition-colors"><ImageIcon size={64} className="opacity-20" /><p className="font-bold text-sm">ارفع الشعار الرسمي</p></div>
                    )}
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2"><Sparkles size={16} className="text-blue-500" /> صورة النشاط الأسبوعي</label>
                 <div onClick={() => fileInputRef.current?.click()} className="bg-slate-50 border-4 border-dashed border-slate-100 rounded-[2.5rem] p-8 text-center h-64 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                    {weeklyNotesImage ? (
                      <div className="relative group/act h-full flex items-center"><img src={weeklyNotesImage} className="max-h-full object-contain" /></div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-300 group-hover:text-blue-400 transition-colors"><Camera size={64} className="opacity-20" /><p className="font-bold text-sm">تغيير صورة النشاط</p></div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2">ترويسة الخطة (أعلى اليمين)</label>
                 <textarea rows={4} className="w-full p-6 bg-slate-50 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-blue-100 transition shadow-inner" value={headerContent} onChange={e => setHeaderContent(e.target.value)} placeholder="المملكة العربية السعودية&#10;وزارة التعليم..." />
              </div>

              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700 mr-2">الرسائل العامة (تذييل الخطة)</label>
                 <textarea rows={4} className="w-full p-6 bg-slate-50 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-blue-100 transition shadow-inner" value={generalMessages} onChange={e => setGeneralMessages(e.target.value)} placeholder="عزيزي ولي الأمر.. نرجو التعاون في.." />
              </div>
           </div>
           
           <div className="pt-6 border-t">
             <button onClick={handleSaveBranding} className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isSaved ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-black'}`}>
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
                  <h3 className="text-3xl font-black mb-2 flex items-center gap-3 justify-center md:justify-start"><Users size={32} />الطباعة الفردية للطلاب</h3>
                  <p className="text-blue-100 font-bold">توليد صفحة خطة مخصصة لكل طالب تحمل اسمه وتفاصيله.</p>
               </div>
               <Link to={`/p/${school.slug}/bulk/students`} className="bg-white text-blue-600 px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-blue-50 transition shadow-lg active:scale-95 flex items-center gap-3">
                  <Printer size={24} />فتح محرك الطباعة
               </Link>
            </div>
            {/* ... بقية محتوى الطلاب ... */}
         </div>
      )}
    </div>
  );
};

export default WeeklyPlansManagement;
