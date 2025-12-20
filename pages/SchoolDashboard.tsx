
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { School, Teacher, AcademicWeek, Student, SchoolClass } from '../types.ts';
import { db } from '../constants.tsx';
import { 
  LayoutDashboard, GraduationCap, Settings, LogOut, 
  BookOpenCheck, ClipboardCheck, Users,
  CheckCircle2, AlertCircle, Zap, Menu, X, 
  ChevronDown, ChevronUp, Calendar
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
    { path: '/school', icon: <LayoutDashboard size={20} />, label: 'الرئيسية' },
    { path: '/school/students', icon: <GraduationCap size={20} />, label: 'إدارة الطلاب' },
    { path: '/school/plans', icon: <BookOpenCheck size={20} />, label: 'الخطط الأسبوعية' },
    { path: '/school/attendance', icon: <ClipboardCheck size={20} />, label: 'رصد الغياب' },
    { path: '/school/settings', icon: <Settings size={20} />, label: 'الإعدادات' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`
        fixed lg:static inset-y-0 right-0 w-72 bg-white border-l border-slate-100 flex flex-col z-[100] transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex justify-between items-center border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Zap size={22} fill="white" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">خططي</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400"><X size={24} /></button>
        </div>

        <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3.5 p-3.5 rounded-xl font-bold transition-all ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span className="text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button onClick={onLogout} className="flex items-center gap-3.5 w-full p-3.5 text-rose-500 font-bold hover:bg-rose-50 rounded-xl transition-all">
            <LogOut size={20} />
            <span className="text-[15px]">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden bg-white border-b px-6 py-4 flex justify-between items-center shrink-0 z-50">
           <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-md"><Zap size={18} /></div>
              <span className="font-black text-slate-800 text-base">خططي</span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-indigo-600"><Menu size={24} /></button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-10 max-w-full mx-auto">
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
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [activeWeek, setActiveWeek] = useState<AcademicWeek | undefined>(undefined);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [teacherStatus, setTeacherStatus] = useState<{ completed: Teacher[], incomplete: Teacher[] }>({ completed: [], incomplete: [] });

  // @google/genai guidelines: Handle async database calls in useEffect.
  useEffect(() => {
    const fetchData = async () => {
      const week = await db.getActiveWeek(school.id);
      const allTeachers = await db.getTeachers(school.id);
      const students = await db.getStudents(school.id);
      const attendance = await db.getAttendance(school.id);
      const classes = await db.getClasses(school.id);

      setActiveWeek(week);
      setTeachers(allTeachers);
      setStudentsCount(students.length);
      setAttendanceCount(attendance.length);

      if (week) {
        const plans = await db.getPlans(school.id, week.id);
        const completed: Teacher[] = [];
        const incomplete: Teacher[] = [];

        for (const teacher of allTeachers) {
          let sessions: any[] = [];
          for (const cls of classes) {
            const classTitle = `${cls.grade} - فصل ${cls.section}`;
            const schedule = await db.getSchedule(school.id, classTitle);
            Object.entries(schedule).forEach(([key, val]: [string, any]) => {
              if (val.teacherId === teacher.id) sessions.push({ classTitle, key });
            });
          }
          if (sessions.length === 0) continue;
          const isAllDone = sessions.every(s => {
            const plan = plans[`${s.classTitle}_${s.key}`];
            return plan && plan.lesson && plan.lesson.trim().length > 0;
          });
          if (isAllDone) completed.push(teacher); else incomplete.push(teacher);
        }
        setTeacherStatus({ completed, incomplete });
      }
    };
    fetchData();
  }, [school.id]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-full">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">نظرة عامة</h1>
          <p className="text-slate-400 font-bold mt-1 text-base">مدرسة {school.name} - حالة الرصد المباشر</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
           <Calendar size={18} className="text-indigo-600" />
           <span className="text-sm font-black text-slate-700">الأسبوع: {activeWeek ? activeWeek.name : 'غير محدد'}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'الطلاب', value: studentsCount, icon: <GraduationCap size={24} />, color: 'indigo' },
          { label: 'المعلمون', value: teachers.length, icon: <Users size={24} />, color: 'blue' },
          { label: 'الغياب المرصود', value: attendanceCount, icon: <ClipboardCheck size={24} />, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="card-neo p-6 flex items-center gap-5">
             <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl flex items-center justify-center`}>{stat.icon}</div>
             <div>
                <div className="text-2xl font-black text-slate-900 leading-none">{stat.value}</div>
                <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1.5">{stat.label}</div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <button onClick={() => setShowComplete(!showComplete)} className="w-full card-neo p-6 flex items-center justify-between hover:border-emerald-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><CheckCircle2 size={24} /></div>
              <div className="text-right">
                <div className="text-xl font-black text-slate-800 leading-none">{teacherStatus.completed.length}</div>
                <div className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest mt-1.5">أتموا رصد الخطط</div>
              </div>
            </div>
            {showComplete ? <ChevronUp size={20} className="text-slate-300" /> : <ChevronDown size={20} className="text-slate-300" />}
          </button>
          {showComplete && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm animate-in slide-in-from-top-2">
              {teacherStatus.completed.length === 0 ? <p className="text-center py-4 text-slate-300 font-bold text-sm">لا يوجد معلمين حالياً.</p> : (
                <div className="flex flex-wrap gap-2">{teacherStatus.completed.map(t => <span key={t.id} className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-lg text-xs font-bold border border-emerald-100">{t.name}</span>)}</div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button onClick={() => setShowIncomplete(!showIncomplete)} className="w-full card-neo p-6 flex items-center justify-between hover:border-rose-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><AlertCircle size={24} /></div>
              <div className="text-right">
                <div className="text-xl font-black text-slate-800 leading-none">{teacherStatus.incomplete.length}</div>
                <div className="text-rose-600 font-bold text-[10px] uppercase tracking-widest mt-1.5">بانتظار رصد الخطط</div>
              </div>
            </div>
            {showIncomplete ? <ChevronUp size={20} className="text-slate-300" /> : <ChevronDown size={20} className="text-slate-300" />}
          </button>
          {showIncomplete && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm animate-in slide-in-from-top-2">
              {teacherStatus.incomplete.length === 0 ? <p className="text-center py-4 text-emerald-500 font-bold text-sm">الجميع أتم الرصد بنجاح.</p> : (
                <div className="flex flex-wrap gap-2">{teacherStatus.incomplete.map(t => <span key={t.id} className="bg-rose-50 text-rose-700 px-4 py-1.5 rounded-lg text-xs font-bold border border-rose-100/50">{t.name}</span>)}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <CommunicationHub schoolId={school.id} />
    </div>
  );
};

export default SchoolOverview;
