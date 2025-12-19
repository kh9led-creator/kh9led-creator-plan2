
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { School, Teacher, AcademicWeek } from '../types.ts';
import { db } from '../constants.tsx';
import { 
  LayoutDashboard, GraduationCap, Calendar, 
  Settings, LogOut, Link as LinkIcon, 
  BookOpenCheck, MessageSquare, ClipboardCheck, Users,
  CheckCircle, AlertCircle, ArrowRight, Copy, Check, Zap, ChevronRight,
  UserCircle, ExternalLink, Menu, X, CheckCircle2, Info, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import StudentsManagement from '../components/school/StudentsManagement.tsx';
import SchoolSettings from '../components/school/SchoolSettings.tsx';
import WeeklyPlansManagement from '../components/school/WeeklyPlansManagement.tsx';
import AttendanceManagement from '../components/school/AttendanceManagement.tsx';
import CommunicationHub from '../components/school/CommunicationHub.tsx';

interface Props {
  school: School;
  onLogout: () => void;
}

const SchoolDashboard: React.FC<Props> = ({ school, onLogout }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/school', icon: <LayoutDashboard size={22} />, label: 'لوحة التحكم' },
    { path: '/school/students', icon: <GraduationCap size={22} />, label: 'إدارة الطلاب' },
    { path: '/school/plans', icon: <BookOpenCheck size={22} />, label: 'الخطط الأسبوعية' },
    { path: '/school/attendance', icon: <ClipboardCheck size={22} />, label: 'رصد الغياب' },
    { path: '/school/settings', icon: <Settings size={22} />, label: 'إعدادات النظام' },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-['Tajawal'] relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden" 
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 right-0 w-80 bg-white border-l border-slate-100 flex flex-col no-print shrink-0 z-[100] shadow-xl lg:shadow-sm transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-100">
              <Zap size={22} fill="white" />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tighter">مدرستي</span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-2 text-slate-400 hover:text-rose-500">
             <X size={24} />
          </button>
        </div>

        <div className="px-8 mt-6">
          <div className="flex items-center gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
            {school.logoUrl ? (
              <img src={school.logoUrl} className="w-10 h-10 object-contain" alt="logo" />
            ) : (
              <div className="w-10 h-10 bg-indigo-600 rounded-xl"></div>
            )}
            <div className="overflow-hidden">
               <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">مدير المدرسة</p>
               <h4 className="font-bold text-slate-700 truncate text-xs">{school.name}</h4>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={closeSidebar}
                className={`flex items-center justify-between group p-4 rounded-[1.5rem] font-black transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`}>{item.icon}</span>
                  <span className="text-[14px]">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={18} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={onLogout} 
            className="flex items-center gap-4 w-full p-4 text-rose-500 font-black hover:bg-rose-50 rounded-2xl transition-all group"
          >
            <div className="bg-rose-50 text-rose-500 p-2 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all">
              <LogOut size={20} />
            </div>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto relative h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden glass border-b px-6 py-4 flex justify-between items-center sticky top-0 z-[80]">
           <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white"><Zap size={16} /></div>
              <span className="font-black text-slate-800">مدرستي</span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white rounded-xl shadow-sm border text-indigo-600">
              <Menu size={24} />
           </button>
        </header>

        <div className="p-6 md:p-10 lg:p-16 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<SchoolOverview school={school} />} />
            <Route path="/students" element={<StudentsManagement schoolId={school.id} />} />
            <Route path="/plans" element={<WeeklyPlansManagement school={school} />} />
            <Route path="/attendance" element={<AttendanceManagement school={school} />} />
            <Route path="/settings/*" element={<SchoolSettings school={school} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const SchoolOverview: React.FC<{ school: School }> = ({ school }) => {
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // مفتاح لتحديث الحالة
  const [showIncompleteList, setShowIncompleteList] = useState(false);
  const [showCompleteList, setShowCompleteList] = useState(false);

  const activeWeek = db.getActiveWeek(school.id);
  const teachers = db.getTeachers(school.id);
  const studentsCount = db.getStudents(school.id).length;

  const teacherStatus = useMemo(() => {
    if (!activeWeek) return { completed: [], incomplete: [] };
    
    const plans = db.getPlans(school.id, activeWeek.id);
    const classes = db.getClasses(school.id);
    const classTitles = classes.map(c => `${c.grade} - فصل ${c.section}`);
    
    const completed: Teacher[] = [];
    const incomplete: Teacher[] = [];

    teachers.forEach(teacher => {
      let teacherSessions: any[] = [];
      classTitles.forEach(title => {
        const schedule = db.getSchedule(school.id, title);
        Object.entries(schedule).forEach(([key, val]: [string, any]) => {
          if (val.teacherId === teacher.id) {
            teacherSessions.push({ title, key }); // key is day_period
          }
        });
      });

      // استبعاد المعلمين الذين ليس لديهم جدول
      if (teacherSessions.length === 0) return;

      const allSessionsDone = teacherSessions.every(session => {
        const plan = plans[`${session.title}_${session.key}`];
        return plan && plan.lesson && plan.lesson.trim().length > 0;
      });

      if (allSessionsDone) completed.push(teacher);
      else incomplete.push(teacher);
    });

    return { completed, incomplete };
  }, [school.id, teachers, activeWeek, refreshKey]);

  const teacherLoginLink = `${window.location.origin}/#/school/${school.slug}/teacher-login`;

  const copyTeacherLink = () => {
    navigator.clipboard.writeText(teacherLoginLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-6">
           <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
              <LayoutDashboard size={32} />
           </div>
           <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">لوحة المعلومات</h1>
              <p className="text-slate-400 mt-1 font-bold">إدارة ذكية ومتابعة دقيقة لمدرسة {school.name}.</p>
           </div>
        </div>
        <button 
          onClick={handleRefresh}
          className="bg-white p-4 rounded-2xl border shadow-sm text-slate-400 hover:text-indigo-600 transition group flex items-center gap-2 font-black text-sm"
        >
          <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
          تحديث الحالة
        </button>
      </header>

      {/* Monitoring Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Completed Card */}
         <div className="space-y-4">
           <div 
             onClick={() => setShowCompleteList(!showCompleteList)}
             className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-lg transition group relative overflow-hidden"
           >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                   <CheckCircle2 size={32} />
                </div>
                <div>
                   <div className="text-3xl font-black text-slate-900">{teacherStatus.completed.length}</div>
                   <div className="text-emerald-600 font-black text-sm uppercase tracking-widest">أتموا الرصد</div>
                </div>
              </div>
              {showCompleteList ? <ChevronUp size={20} className="text-slate-300" /> : <ChevronDown size={20} className="text-slate-300" />}
           </div>
           {showCompleteList && (
             <div className="bg-emerald-50/30 p-4 rounded-[2rem] border border-emerald-100/50 animate-in slide-in-from-top-2">
                <div className="flex flex-wrap gap-2">
                   {teacherStatus.completed.length === 0 ? <p className="text-xs text-slate-400 p-2 font-bold">لا يوجد معلمين مكتملين بعد.</p> :
                   teacherStatus.completed.map(t => (
                     <span key={t.id} className="bg-white px-4 py-2 rounded-xl text-xs font-black text-emerald-700 shadow-sm border border-emerald-100 flex items-center gap-2">
                        <Check size={12} /> {t.name}
                     </span>
                   ))}
                </div>
             </div>
           )}
         </div>

         {/* Incomplete Card */}
         <div className="space-y-4">
           <div 
             onClick={() => setShowIncompleteList(!showIncompleteList)}
             className="bg-white p-8 rounded-[2.5rem] border border-rose-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-lg transition group relative overflow-hidden"
           >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 animate-pulse">
                   <AlertCircle size={32} />
                </div>
                <div>
                   <div className="text-3xl font-black text-slate-900">{teacherStatus.incomplete.length}</div>
                   <div className="text-rose-600 font-black text-sm uppercase tracking-widest">متأخرون عن الرصد</div>
                </div>
              </div>
              {showIncompleteList ? <ChevronUp size={20} className="text-slate-300" /> : <ChevronDown size={20} className="text-slate-300" />}
           </div>
           {showIncompleteList && (
             <div className="bg-rose-50/30 p-4 rounded-[2rem] border border-rose-100/50 animate-in slide-in-from-top-2">
                <div className="flex flex-wrap gap-2">
                   {teacherStatus.incomplete.length === 0 ? <p className="text-xs text-slate-400 p-2 font-bold">جميع المعلمين أتموا رصدهم بنجاح!</p> :
                   teacherStatus.incomplete.map(t => (
                     <span key={t.id} className="bg-white px-4 py-2 rounded-xl text-xs font-black text-rose-700 shadow-sm border border-rose-100 flex items-center gap-2">
                        <Info size={12} className="opacity-50" /> {t.name}
                     </span>
                   ))}
                </div>
             </div>
           )}
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {[
          { label: 'الطلاب المسجلون', value: studentsCount, icon: <GraduationCap size={28} />, color: 'blue' },
          { label: 'المعلمون المسجلون', value: teachers.length, icon: <Users size={28} />, color: 'indigo' },
          { label: 'الأسبوع النشط', value: activeWeek ? activeWeek.name : 'لا يوجد', icon: <Calendar size={28} />, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-slate-100 flex items-center gap-6 md:gap-8 hover:shadow-xl transition-shadow duration-500 group">
             <div className={`w-16 h-16 md:w-20 md:h-20 bg-${stat.color}-50 text-${stat.color}-600 rounded-[1.5rem] md:rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {stat.icon}
             </div>
             <div>
                <div className="text-3xl md:text-4xl font-black text-slate-900">{stat.value}</div>
                <div className="text-slate-400 font-bold text-xs md:text-sm mt-1">{stat.label}</div>
             </div>
          </div>
        ))}
      </div>

      {/* Links Section */}
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px] -mr-32 -mt-32"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/50">
               <LinkIcon size={32} />
            </div>
            <div className="flex-1 text-center md:text-right">
               <h3 className="text-xl md:text-2xl font-black text-white">رابط دخول المعلمين</h3>
               <p className="text-indigo-300 font-bold text-sm mt-1">شارك هذا الرابط مع معلمي المدرسة ليتمكنوا من رصد الحصص والغياب.</p>
               <div className="mt-6 flex items-center gap-4 bg-white/10 p-2 pr-6 rounded-2xl border border-white/10 backdrop-blur-md">
                  <span className="flex-1 text-left font-mono text-[11px] text-indigo-100 font-bold truncate" dir="ltr">{teacherLoginLink}</span>
                  <button 
                   onClick={copyTeacherLink}
                   className={`px-8 py-4 rounded-xl font-black text-sm transition-all flex items-center gap-2 shrink-0 ${copied ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
                  >
                     {copied ? <Check size={18} /> : <Copy size={18} />}
                     {copied ? 'تم النسخ' : 'نسخ الرابط'}
                  </button>
               </div>
            </div>
         </div>
      </div>
      
      <div className="grid grid-cols-1 gap-10">
        <CommunicationHub schoolId={school.id} />
      </div>
    </div>
  );
};

export default SchoolOverview;
