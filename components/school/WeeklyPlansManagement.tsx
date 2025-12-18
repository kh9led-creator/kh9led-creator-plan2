
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { School, Student } from '../../types.ts';
import { Image as ImageIcon, Globe, Printer, Share2, Users, Archive, History, Sparkles, MessageCircle, StickyNote, Camera, Trash2, ExternalLink } from 'lucide-react';
import { db } from '../../constants.tsx';
import { Link } from 'react-router-dom';

const WeeklyPlansManagement: React.FC<{ school: School }> = ({ school }) => {
  const [headerContent, setHeaderContent] = useState(school.headerContent || "");
  const [generalMessages, setGeneralMessages] = useState(school.generalMessages || "");
  const [weeklyNotes, setWeeklyNotes] = useState(school.weeklyNotes || "");
  const [weeklyNotesImage, setWeeklyNotesImage] = useState<string | null>(school.weeklyNotesImage || null);
  const [activeTab, setActiveTab] = useState<'branding' | 'general' | 'students'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const updated = { ...school, headerContent, generalMessages, weeklyNotes, weeklyNotesImage };
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black">إدارة الخطط الأسبوعية</h2>
          <p className="text-slate-500">تحكم في الروابط العامة وهوية الخطط المطبوعة.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {[{id:'general', label:'روابط الفصول'}, {id:'students', label:'خطط الطلاب'}, {id:'branding', label:'الهوية والترويسة'}].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === tab.id ? 'bg-white text-blue-600' : 'text-slate-500'}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="grid grid-cols-1 gap-6">
          {Object.keys(classesGroups).length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] text-center font-bold text-slate-400 border border-dashed">يرجى إضافة طلاب أولاً لتوليد روابط الفصول.</div>
          ) : (
            Object.keys(classesGroups).map(className => (
              <div key={className} className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <h3 className="text-xl font-black text-slate-800">{className}</h3>
                   <div className="text-xs font-mono text-blue-500 mt-1">/p/{school.slug}/{className.replace(/\s+/g, '-')}</div>
                </div>
                <Link to={`/p/${school.slug}/${className.replace(/\s+/g, '-')}`} target="_blank" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2">
                   <ExternalLink size={18} /> معاينة وطباعة الفصل
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700">ترويسة الخطة (أعلى اليمين)</label>
                 <textarea rows={4} className="w-full p-5 bg-slate-50 rounded-3xl font-bold outline-none" value={headerContent} onChange={e => setHeaderContent(e.target.value)} />
              </div>
              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700">الرسائل العامة (أسفل اليمين)</label>
                 <textarea rows={4} className="w-full p-5 bg-slate-50 rounded-3xl font-bold outline-none" value={generalMessages} onChange={e => setGeneralMessages(e.target.value)} />
              </div>
              <div className="space-y-4">
                 <label className="text-sm font-black text-slate-700">صورة النشاط (أسفل اليسار)</label>
                 <div className="bg-slate-50 border-2 border-dashed rounded-3xl p-6 text-center">
                    {weeklyNotesImage ? <img src={weeklyNotesImage} className="h-32 mx-auto object-contain mb-4" /> : <Camera className="mx-auto text-slate-300 mb-2" size={32} />}
                    <button onClick={() => fileInputRef.current?.click()} className="bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold">رفع صورة</button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </div>
              </div>
           </div>
           <button onClick={handleSaveBranding} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black">حفظ التعديلات</button>
        </div>
      )}

      {activeTab === 'students' && (
         <div className="text-center p-20 text-slate-400 font-bold bg-white rounded-[3rem] border border-dashed">هذه الميزة متاحة في الإصدار المتقدم للطباعة الفردية.</div>
      )}
    </div>
  );
};

export default WeeklyPlansManagement;
