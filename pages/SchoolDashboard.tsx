
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
    { path: '/school', icon: <LayoutDashboard size={22} />, label: 'الرئيسية' },
    { path: '/school/students', icon: <GraduationCap size={22} />, label: 'الطلاب' },
    { path: '/school/plans', icon: <BookOpenCheck size={22} />, label: 'الخطط الأسبوعية' },
    { path: '/school/attendance', icon: <ClipboardCheck size={22} />, label: 'رصد الغياب' },
    { path: '/school/settings', icon: <Settings size={22} />, label: 'إعدادات النظام' },
  ];

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-['Tajawal']" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[90] lg:hidden animate-in fade-in duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 w-80 bg-white border-l border-slate-100 flex flex-col no-print shrink-0 z-[100] shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-100">
              <Zap size={24} fill="white" />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">مدرستي</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors">
             <X size={24} />
          </button>
        </div>

        <div className="px-6 py-8">
          <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 transition-hover hover:border-indigo-100">
            {school.logoUrl ? (
              <img src={school.logoUrl} className="w-12 h-12 object-contain rounded-xl bg-white p-1" alt="logo" />
            ) : (
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">M</div>
            )}
            <div className="overflow-hidden">
               <p className="text-[10px] font-black text-indigo-600 uppercase mb-0.5 tracking-widest">إدارة المدرسة</p>
               <h4 className="font-bold text-slate-700 truncate text-sm">{school.name}</h4>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-4 p-4.5 rounded-[1.5rem] font-black transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'} transition-colors`}>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-slate-50">
          <button 
            onClick={onLogout} 
            className="flex items-center gap-4 w-full p-4 text-rose-500 font-black hover:bg-rose-50 rounded-2xl transition-all group"
          >
            <div className="p-2 bg-rose-50 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all">
               <LogOut size={20} />
            </div>
            <span className="text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b px-6 py-5 flex justify-between items-center shrink-0 z-50">
           <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><Zap size={20} /></div>
              <span className="font-black text-slate-800 text-lg">مدرستي الذكية</span>
           </div>
           <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-indigo-600 active:scale-95 transition-all shadow-sm"
           >
              <Menu size={26} />
           </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
          <div className="p-6 md:p-12 lg:p-16 w-full max-w-[1920px] mx-auto animate-fade-up">
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
    <div className="space-y-12 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">نظرة عامة</h1>
          <p className="text-slate-400 mt-2 font-bold text-lg">الإحصائيات الحالية لمدرسة {school.name}</p>
        </div>
        <button 
          onClick={() => setRefreshKey(k => k + 1)}
          className="bg-white px-8 py-4 rounded-2xl border border-slate-100 shadow-sm text-slate-600 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center gap-3 font-black text-sm active:scale-95"
        >
          <RefreshCw size={20} className={refreshKey > 0 ? 'animate-spin' : ''} /> تحديث الحالة الفوري
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { label: 'الطلاب المسجلين', value: studentsCount, icon: <GraduationCap size={28} />, color: 'blue' },
          { label: 'الهيئة التعليمية', value: teachers.length, icon: <Users size={28} />, color: 'indigo' },
          { label: 'الأسبوع الدراسي', value: activeWeek ? activeWeek.name : 'غير محدد', icon: <Calendar size={28} />, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex items-center gap-8 group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
             <div className={`w-20 h-20 bg-${stat.color}-50 text-${stat.color}-600 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                {stat.icon}
             </div>
             <div>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-slate-400 font-black text-xs mt-1.5 uppercase tracking-widest">{stat.label}</div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="space-y-4">
           <div onClick={() => setShowCompleteList(!showCompleteList)} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-200 transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                   <CheckCircle2 size={32} />
                </div>
                <div>
                   <div className="text-3xl font-black text-slate-900 tracking-tight">{teacherStatus.completed.length}</div>
                   <div className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mt-1">أتموا رصد الخطط</div>
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                {showCompleteList ? <ChevronUp size={24} className="text-emerald-600" /> : <ChevronDown size={24} className="text-slate-400" />}
              </div>
           </div>
           {showCompleteList && (
             <div className="bg-white p-6 rounded-[2rem] border border-emerald-50 shadow-inner grid grid-cols-2 md:grid-cols-3 gap-3 animate-in slide-in-from-top-4 duration-500">
                {teacherStatus.completed.length === 0 ? (
                   <p className="col-span-full text-center text-slate-400 font-bold py-4">لا يوجد معلمين في هذه القائمة حالياً.</p>
                ) : (
                  teacherStatus.completed.map(t => (
                    <span key={t.id} className="bg-emerald-50/50 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-black border border-emerald-100/50 text-center">{t.name}</span>
                  ))
                )}
             </div>
           )}
         </div>

         <div className="space-y-4">
           <div onClick={() => setShowIncompleteList(!showIncompleteList)} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-rose-200 transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                   <AlertCircle size={32} />
                </div>
                <div>
                   <div className="text-3xl font-black text-slate-900 tracking-tight">{teacherStatus.incomplete.length}</div>
                   <div className="text-rose-600 font-black text-[10px] uppercase tracking-[0.2em] mt-1">لم يرصدوا الخطط بعد</div>
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-rose-50 transition-colors">
                {showIncompleteList ? <ChevronUp size={24} className="text-rose-600" /> : <ChevronDown size={24} className="text-slate-400" />}
              </div>
           </div>
           {showIncompleteList && (
             <div className="bg-white p-6 rounded-[2rem] border border-rose-50 shadow-inner grid grid-cols-2 md:grid-cols-3 gap-3 animate-in slide-in-from-top-4 duration-500">
                {teacherStatus.incomplete.length === 0 ? (
                   <p className="col-span-full text-center text-slate-400 font-bold py-4">جميع المعلمين أتموا الرصد، أحسنت!</p>
                ) : (
                  teacherStatus.incomplete.map(t => (
                    <span key={t.id} className="bg-rose-50/50 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-black border border-rose-100/50 text-center">{t.name}</span>
                  ))
                )}
             </div>
           )}
         </div>
      </div>

      <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] -ml-32 -mb-32"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-right">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full mb-4 border border-white/10">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">بوابة الرصد المباشر</span>
               </div>
               <h3 className="text-3xl font-black tracking-tight">رابط دخول المعلمين</h3>
               <p className="text-slate-400 text-lg mt-2 font-medium">شارك هذا الرابط مع أعضاء هيئة التدريس للبدء في الرصد.</p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-3 pr-8 rounded-[2.5rem] border border-white/10 w-full md:w-auto shadow-inner">
               <span className="font-mono text-[10px] opacity-60 truncate max-w-[300px] text-indigo-300" dir="ltr">{teacherLoginLink}</span>
               <button 
                onClick={copyTeacherLink}
                className={`px-10 py-5 rounded-[1.5rem] font-black text-sm transition-all shadow-xl active:scale-95 ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
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
