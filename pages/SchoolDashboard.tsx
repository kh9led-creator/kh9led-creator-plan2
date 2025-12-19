
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { School, Teacher, AcademicWeek } from '../types.ts';
import { db } from '../constants.tsx';
import { 
  LayoutDashboard, GraduationCap, Settings, LogOut, 
  BookOpenCheck, ClipboardCheck, Users,
  CheckCircle2, AlertCircle, Copy, Check, Zap, ChevronRight,
  Menu, X, RefreshCw, ChevronDown, ChevronUp, Calendar
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
    { path: '/school', icon: <LayoutDashboard size={22} strokeWidth={2.5} />, label: 'الرئيسية' },
    { path: '/school/students', icon: <GraduationCap size={22} strokeWidth={2.5} />, label: 'الطلاب' },
    { path: '/school/plans', icon: <BookOpenCheck size={22} strokeWidth={2.5} />, label: 'الخطط الأسبوعية' },
    { path: '/school/attendance', icon: <ClipboardCheck size={22} strokeWidth={2.5} />, label: 'رصد الغياب' },
    { path: '/school/settings', icon: <Settings size={22} strokeWidth={2.5} />, label: 'الإعدادات' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-['Tajawal']" dir="rtl">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[90] lg:hidden animate-in fade-in" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`
        fixed lg:static inset-y-0 right-0 w-80 bg-white border-l border-slate-100 flex flex-col no-print shrink-0 z-[100] shadow-2xl lg:shadow-none transition-all duration-300
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-12 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-100 animate-pulse">
              <Zap size={24} fill="white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">مدرستي</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-300 hover:text-rose-500 transition-colors">
             <X size={28} />
          </button>
        </div>

        <nav className="flex-1 px-8 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-4 p-5 rounded-[1.8rem] font-black transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 translate-x-2' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-400'} transition-colors`}>{item.icon}</span>
                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-10 border-t border-slate-50">
          <button onClick={onLogout} className="flex items-center gap-4 w-full p-5 text-rose-500 font-black hover:bg-rose-50 rounded-[1.8rem] transition-all group">
            <div className="p-2 bg-rose-50 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all"><LogOut size={22} /></div>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b px-8 py-6 flex justify-between items-center z-50">
           <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><Zap size={20} /></div>
              <span className="font-black text-slate-900 text-xl">مدرستي الذكية</span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-slate-50 rounded-2xl text-indigo-600 shadow-sm"><Menu size={28} /></button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-8 md:p-14 lg:p-20 w-full max-w-[1920px] mx-auto animate-fade-up">
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
  const activeWeek = db.getActiveWeek(school.id);
  const teachers = db.getTeachers(school.id);
  const studentsCount = db.getStudents(school.id).length;

  return (
    <div className="space-y-16 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">لوحة التحكم</h1>
          <p className="text-slate-400 mt-2 font-bold text-xl">إحصائيات مدرسة {school.name} لهذا اليوم.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-[1.5rem] border border-slate-100 shadow-sm font-black text-indigo-600">
           <Calendar size={20} />
           الأسبوع: {activeWeek ? activeWeek.name : 'غير محدد'}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[
          { label: 'الطلاب المسجلين', value: studentsCount, icon: <GraduationCap size={32} />, color: 'indigo' },
          { label: 'الهيئة التعليمية', value: teachers.length, icon: <Users size={32} />, color: 'blue' },
          { label: 'الخطط المفعلة', value: activeWeek ? 'نشط' : 'لا يوجد', icon: <BookOpenCheck size={32} />, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-12 rounded-[3.5rem] border border-slate-50 shadow-sm flex items-center gap-10 group hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
             <div className={`w-24 h-24 bg-${stat.color}-50 text-${stat.color}-600 rounded-[2.2rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                {stat.icon}
             </div>
             <div>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
                <div className="text-slate-400 font-black text-xs mt-2 uppercase tracking-widest">{stat.label}</div>
             </div>
          </div>
        ))}
      </div>

      <CommunicationHub schoolId={school.id} />
    </div>
  );
};

export default SchoolDashboard;
