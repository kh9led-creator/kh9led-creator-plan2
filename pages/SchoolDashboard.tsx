
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { School, Teacher, AcademicWeek } from '../types.ts';
import { db } from '../constants.tsx';
import { 
  LayoutDashboard, GraduationCap, Settings, LogOut, 
  BookOpenCheck, ClipboardCheck, Users,
  CheckCircle2, AlertCircle, Copy, Check, Zap, ChevronRight,
  Menu, X, Info, RefreshCw, ChevronDown, ChevronUp, Calendar
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

  // إغلاق القائمة تلقائياً عند تغيير المسار في الجوال
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-['Tajawal'] relative" dir="rtl">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - تم إصلاح منطق Translate ليتوافق مع RTL */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 w-72 bg-white border-l border-slate-100 flex flex-col no-print shrink-0 z-[100] shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
              <Zap size={20} fill="white" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tighter">الخطط الأسبوعية</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-rose-500">
             <X size={24} />
          </button>
        </div>

        <div className="px-6 mt-6">
          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {school.logoUrl ? (
              <img src={school.logoUrl} className="w-10 h-10 object-contain rounded-lg" alt="logo" />
            ) : (
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold">M</div>
            )}
            <div className="overflow-hidden">
               <p className="text-[10px] font-black text-indigo-600 uppercase mb-0.5">الإدارة</p>
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
                className={`flex items-center gap-4 p-4 rounded-2xl font-black transition-all ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={onLogout} 
            className="flex items-center gap-4 w-full p-4 text-rose-500 font-black hover:bg-rose-50 rounded-2xl transition-all group"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Navbar */}
        <header className="lg:hidden bg-white border-b px-6 py-4 flex justify-between items-center shrink-0 z-50">
           <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md"><Zap size={16} /></div>
              <span className="font-black text-slate-800 text-sm">الخطط الأسبوعية</span>
           </div>
           <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 active:scale-95 transition-all"
           >
              <Menu size={24} />
           </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="p-6 md:p-10 lg:p-14 max-w-7xl mx-auto">
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
    </div>
  );
};

const SchoolOverview: React.FC<{ school: School }> = ({ school }) => {
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
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
          if (val.teacherId === teacher.id) teacherSessions.push({ title, key });
        });
      });

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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">نظرة عامة</h1>
          <p className="text-slate-400 mt-1 font-bold">إحصائيات ومتابعة مدرسة {school.name}</p>
        </div>
        <button 
          onClick={() => setRefreshKey(k => k + 1)}
          className="bg-white p-4 rounded-2xl border shadow-sm text-slate-500 hover:text-indigo-600 transition flex items-center gap-2 font-black text-sm"
        >
          <RefreshCw size={18} /> تحديث الحالة
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'الطلاب', value: studentsCount, icon: <GraduationCap size={24} />, color: 'blue' },
          { label: 'المعلمون', value: teachers.length, icon: <Users size={24} />, color: 'indigo' },
          { label: 'الأسبوع', value: activeWeek ? activeWeek.name : 'لا يوجد', icon: <Calendar size={24} />, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-lg transition-all">
             <div className={`w-14 h-14 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center`}>
                {stat.icon}
             </div>
             <div>
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <div className="text-slate-400 font-bold text-xs mt-1">{stat.label}</div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="space-y-4">
           <div onClick={() => setShowCompleteList(!showCompleteList)} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-200 transition">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                   <CheckCircle2 size={24} />
                </div>
                <div>
                   <div className="text-xl font-black text-slate-900">{teacherStatus.completed.length}</div>
                   <div className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">أتموا الرصد</div>
                </div>
              </div>
              {showCompleteList ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
           </div>
           {showCompleteList && (
             <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-inner flex flex-wrap gap-2 animate-in slide-in-from-top-2">
                {teacherStatus.completed.map(t => (
                  <span key={t.id} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-black">{t.name}</span>
                ))}
             </div>
           )}
         </div>

         <div className="space-y-4">
           <div onClick={() => setShowIncompleteList(!showIncompleteList)} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-rose-200 transition">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                   <AlertCircle size={24} />
                </div>
                <div>
                   <div className="text-xl font-black text-slate-900">{teacherStatus.incomplete.length}</div>
                   <div className="text-rose-600 font-black text-[10px] uppercase tracking-widest">لم يرصدوا بعد</div>
                </div>
              </div>
              {showIncompleteList ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
           </div>
           {showIncompleteList && (
             <div className="bg-white p-4 rounded-2xl border border-rose-50 shadow-inner flex flex-wrap gap-2 animate-in slide-in-from-top-2">
                {teacherStatus.incomplete.map(t => (
                  <span key={t.id} className="bg-rose-50 text-rose-700 px-3 py-1 rounded-lg text-xs font-black">{t.name}</span>
                ))}
             </div>
           )}
         </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-[3rem] shadow-xl text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-right">
               <h3 className="text-xl font-black">رابط بوابة المعلم</h3>
               <p className="text-slate-400 text-sm mt-1">شارك هذا الرابط مع المعلمين للرصد المباشر</p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-2 pr-6 rounded-2xl border border-white/10 w-full md:w-auto">
               <span className="font-mono text-[10px] opacity-60 truncate max-w-[200px]" dir="ltr">{teacherLoginLink}</span>
               <button 
                onClick={copyTeacherLink}
                className={`px-6 py-3 rounded-xl font-black text-xs transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
               >
                  {copied ? 'تم النسخ' : 'نسخ الرابط'}
               </button>
            </div>
         </div>
      </div>
      
      <CommunicationHub schoolId={school.id} />
    </div>
  );
};

export default SchoolDashboard;
