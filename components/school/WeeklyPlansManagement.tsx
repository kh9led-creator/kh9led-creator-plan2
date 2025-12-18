
import React, { useState, useMemo, useRef } from 'react';
import { School, Student } from '../../types';
import { 
  Image as ImageIcon, Type, Globe, Printer, 
  Share2, Search, User, ExternalLink, Sparkles, LayoutGrid, Users, Archive, History, FileText, MessageCircle, StickyNote, Camera, Trash2
} from 'lucide-react';
import { MOCK_STUDENTS } from '../../constants';
import { Link } from 'react-router-dom';

const WeeklyPlansManagement: React.FC<{ school: School }> = ({ school }) => {
  const [headerContent, setHeaderContent] = useState(school.headerContent || "");
  const [generalMessages, setGeneralMessages] = useState(school.generalMessages || "");
  const [weeklyNotes, setWeeklyNotes] = useState(school.weeklyNotes || "");
  const [weeklyNotesImage, setWeeklyNotesImage] = useState<string | null>(school.weeklyNotesImage || null);
  const [activeTab, setActiveTab] = useState<'branding' | 'general' | 'students' | 'archive'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group students by class for bulk printing
  const classesGroups = useMemo(() => {
    const groups: Record<string, Student[]> = {};
    MOCK_STUDENTS.forEach(s => {
      const key = `${s.grade} - فصل ${s.section}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, []);

  const handleArchiveCurrent = () => {
    if (confirm('هل أنت متأكد من أرشفة الخطط الحالية للأسبوع الحالي؟ سيبدأ أسبوع جديد فارغ.')) {
      alert('تمت الأرشفة بنجاح');
    }
  };

  const handleSaveBranding = () => {
    // In a real app, this would be an API call updating the school object
    alert('تم حفظ التعديلات بنجاح');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWeeklyNotesImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إدارة الخطط الأسبوعية</h2>
          <p className="text-slate-500">تحكم في الترويسة، الروابط الموحدة، وطباعة المجموعات.</p>
        </div>
        <button 
          onClick={handleArchiveCurrent}
          className="bg-amber-100 text-amber-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-200 transition"
        >
          <Archive size={20} />
          أرشفة الأسبوع الحالي
        </button>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'general', label: 'الخطط العامة (الفصول)', icon: <LayoutGrid size={18} /> },
          { id: 'students', label: 'الخطط الفردية (الطلاب)', icon: <Users size={18} /> },
          { id: 'branding', label: 'الترويسة والسمات', icon: <Sparkles size={18} /> },
          { id: 'archive', label: 'الأرشيف', icon: <History size={18} /> },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8">
        {activeTab === 'general' && (
          <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Globe size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">رابط خطط الفصول الموحد</h3>
                <p className="text-slate-500">هذا الرابط يعرض جميع فصول المدرسة في صفحة واحدة لأولياء الأمور.</p>
              </div>
            </div>
            
            <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">الرابط العام للمدرسة</div>
                <div className="text-xl font-mono text-emerald-800 break-all">madrasati.sa/p/{school.slug}/all-classes</div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold shadow-sm border border-emerald-100 flex items-center justify-center gap-2">
                  <Share2 size={20} />
                  نسخ الرابط
                </button>
                <Link 
                  to={`/p/${school.slug}/all-classes`} 
                  target="_blank" 
                  className="flex-1 md:flex-none bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  <ExternalLink size={20} />
                  معاينة الرابط
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {(Object.entries(classesGroups) as [string, Student[]][]).map(([className, students]) => (
              <div key={className} className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">{className}</h3>
                  </div>
                  <Link 
                    to={`/p/${school.slug}/bulk-print-${className.replace(/\s+/g, '-')}`} 
                    target="_blank"
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-50 hover:bg-blue-700 transition"
                  >
                    <Printer size={18} />
                    طباعة جميع طلاب الفصل (PDF)
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map(student => (
                    <div key={student.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="font-bold text-slate-700">{student.name}</div>
                      <Link 
                        to={`/p/${school.slug}/student-${student.id}`} 
                        target="_blank"
                        className="p-2 text-blue-600 hover:bg-white rounded-xl transition"
                      >
                        <Printer size={18} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <h3 className="text-xl font-black flex items-center gap-2 mb-6">
                <Sparkles size={22} className="text-blue-600" />
                تنسيق ترويسة وشعار الخطة
              </h3>
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="shrink-0">
                  <div className="w-40 h-40 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 bg-slate-50 relative group cursor-pointer overflow-hidden">
                    {school.logoUrl ? (
                      <img src={school.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="text-slate-300" size={40} />
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs">
                      تغيير الشعار
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-6 w-full">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">محتوى الترويسة (٤ أسطر)</label>
                    <textarea 
                      rows={4}
                      value={headerContent}
                      onChange={(e) => setHeaderContent(e.target.value)}
                      placeholder="وزارة التعليم...\nإدارة التعليم...\nمدرسة..."
                      className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-blue-50 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-black">
                  <MessageCircle size={20} className="text-blue-600" />
                  <h4>خانة الرسائل والتوجهات العامة</h4>
                </div>
                <textarea 
                  rows={4}
                  value={generalMessages}
                  onChange={(e) => setGeneralMessages(e.target.value)}
                  placeholder="اكتب التوجيهات التي تظهر في أسفل يمين الخطة..."
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-blue-50 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-black">
                  <StickyNote size={20} className="text-purple-600" />
                  <h4>خانة ملاحظات / نشاط أسبوعي</h4>
                </div>
                <div className="space-y-4">
                  <textarea 
                    rows={4}
                    value={weeklyNotes}
                    onChange={(e) => setWeeklyNotes(e.target.value)}
                    placeholder="اكتب الملاحظات التي تظهر في أسفل يسار الخطة..."
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-blue-50 resize-none leading-relaxed"
                  />
                  
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-600">صورة النشاط الأسبوعي</span>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm"
                      >
                        <Camera size={16} />
                        إرفاق صورة
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                      />
                    </div>
                    
                    {weeklyNotesImage && (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border bg-white group">
                        <img src={weeklyNotesImage} className="w-full h-full object-contain" alt="Preview" />
                        <button 
                          onClick={() => setWeeklyNotesImage(null)}
                          className="absolute top-2 left-2 bg-rose-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveBranding}
                className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:scale-105 transition-all"
              >
                حفظ جميع التعديلات
              </button>
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
             <h3 className="text-xl font-black flex items-center gap-2 mb-4">
              <History size={22} className="text-amber-600" />
              أرشيف الخطط الأسبوعية
            </h3>
            <p className="text-slate-500 font-bold text-center py-10">لا يوجد خطط مؤرشفة حالياً.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyPlansManagement;
