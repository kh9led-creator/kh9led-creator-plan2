
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { School, Student, AcademicWeek } from '../../types.ts';
import { Globe, Printer, Users, Sparkles, Camera, X, Save, CheckCircle2, Copy, ExternalLink, Link as LinkIcon, Image as ImageIcon, UserCircle, Archive, History, Trash2, Calendar, Plus, CheckCircle, Clock } from 'lucide-react';
import { db, formatToHijri } from '../../constants.tsx';
import { Link } from 'react-router-dom';

const WeeklyPlansManagement: React.FC<{ school: School }> = ({ school: initialSchool }) => {
  const [school, setSchool] = useState<School>(initialSchool);
  const [headerContent, setHeaderContent] = useState(school.headerContent || "");
  const [generalMessages, setGeneralMessages] = useState(school.generalMessages || "");
  const [weeklyNotes, setWeeklyNotes] = useState(school.weeklyNotes || "");
  const [weeklyNotesImage, setWeeklyNotesImage] = useState<string | null>(school.weeklyNotesImage || null);
  const [logoUrl, setLogoUrl] = useState<string | null>(school.logoUrl || null);
  const [activeTab, setActiveTab] = useState<'branding' | 'links' | 'students' | 'weeks' | 'archive'>('weeks');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  
  const [weeks, setWeeks] = useState<AcademicWeek[]>([]);
  const [newWeek, setNewWeek] = useState({ name: '', startDate: '', endDate: '' });
  const [archivedPlans, setArchivedPlans] = useState<any[]>([]);
  
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
    setArchivedPlans(db.getArchivedPlans(initialSchool.id));
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

  const handleArchiveActiveWeek = () => {
    const active = weeks.find(w => w.isActive);
    if (!active) {
      alert('لا يوجد أسبوع نشط لأرشفته');
      return;
    }
    if (confirm(`هل أنت متأكد من أرشفة خطط "${active.name}"؟ سيتم الاحتفاظ بنسخة دائمة في الأرشيف.`)) {
      db.archiveWeekPlans(school.id, active);
      setArchivedPlans(db.getArchivedPlans(school.id));
      alert('تمت الأرشفة بنجاح.');
    }
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
      isActive: weeks.length === 0 
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

  return (
    <div className="space-y-8 animate-in fade-in font-['Tajawal'] pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إدارة الخطط الدراسية</h2>
          <p className="text-slate-500 font-bold mt-1">إدارة الأسابيع بالتقويم الهجري وتحديث الهوية.</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleArchiveActiveWeek}
            className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
           >
              <Archive size={18} /> أرشفة الأسبوع الحالي
           </button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          {id:'weeks', label:'الأسابيع الهجرية'},
          {id:'archive', label:'الأرشيف'},
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
                  <h3 className="text-xl font-black text-slate-900">إضافة أسبوع دراسي (هجري)</h3>
                  <p className="text-sm text-slate-500 font-bold">اختر التواريخ ميلادياً وسيقوم النظام بتحويلها للهجري تلقائياً.</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 mr-2">مسمى الأسبوع</label>
                   <input type="text" placeholder="الأسبوع العاشر" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition" value={newWeek.name} onChange={e => setNewWeek({...newWeek, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 mr-2">من تاريخ (هجري: {newWeek.startDate ? formatToHijri(newWeek.startDate) : '--'})</label>
                   <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition" value={newWeek.startDate} onChange={e => setNewWeek({...newWeek, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 mr-2">إلى تاريخ (هجري: {newWeek.endDate ? formatToHijri(newWeek.endDate) : '--'})</label>
                   <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition" value={newWeek.endDate} onChange={e => setNewWeek({...newWeek, endDate: e.target.value})} />
                </div>
             </div>
             <button onClick={handleAddWeek} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95">حفظ الأسبوع الدراسي</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {weeks.map(week => (
               <div key={week.id} className={`bg-white p-8 rounded-[3rem] border-2 transition-all relative overflow-hidden group ${week.isActive ? 'border-indigo-600 shadow-xl shadow-indigo-50' : 'border-slate-100 shadow-sm opacity-80'}`}>
                  <div className="flex justify-between items-start mb-6">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${week.isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Calendar size={28} />
                     </div>
                     <button onClick={() => deleteWeek(week.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">{week.name}</h4>
                  <div className="space-y-1 mb-6">
                     <p className="text-xs text-indigo-600 font-bold">من: {formatToHijri(week.startDate)}</p>
                     <p className="text-xs text-indigo-600 font-bold">إلى: {formatToHijri(week.endDate)}</p>
                  </div>
                  <button onClick={() => toggleWeekActive(week.id)} disabled={week.isActive} className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${week.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black'}`}>
                     {week.isActive ? <><CheckCircle size={16} /> متاح للرصد الآن</> : 'تفعيل للرصد'}
                  </button>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* باقي التبويبات تظل كما هي ... */}
      {activeTab === 'archive' && (
        <div className="space-y-6 animate-in fade-in">
           {archivedPlans.length === 0 ? (
             <div className="bg-white p-24 text-center rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300 font-black">لا توجد أسابيع مؤرشفة حالياً.</div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {archivedPlans.map(archive => (
                  <div key={archive.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition flex justify-between items-center group">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><History size={28} /></div>
                       <div>
                          <h4 className="text-lg font-black text-slate-800">{archive.weekName}</h4>
                          <p className="text-xs text-slate-400 font-bold">من: {formatToHijri(archive.startDate)} - إلى: {formatToHijri(archive.endDate)}</p>
                       </div>
                    </div>
                    <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-xs hover:bg-black transition">استعراض</button>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}
      {/* ... */}
    </div>
  );
};

export default WeeklyPlansManagement;
