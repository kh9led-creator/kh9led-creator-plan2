
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { School, Teacher, AcademicWeek } from '../types.ts';
import { db } from '../constants.tsx';
import { 
  LayoutDashboard, GraduationCap, Settings, LogOut, 
  BookOpenCheck, ClipboardCheck, Users,
  CheckCircle2, AlertCircle, Copy, Check, Zap, Menu, X, 
  RefreshCw, ChevronDown, ChevronUp, Calendar
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
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 w-72 bg-white border-l border-slate-100 flex flex-col z-[100] transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex justify-between items-center border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Zap size={22} fill="white" />
            </div>
            <span className="text-xl font-black text-slate-800">مدرستي</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400">
             <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3.5 p-3.5 rounded-xl font-bold transition-all ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span className="text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={onLogout} 
            className="flex items-center gap-3.5 w-full p-3.5 text-rose-500 font-bold hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="text-[15px]">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden bg-white border-b px-6 py-4 flex justify-between items-center shrink-0 z-50">
           <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-md"><Zap size={18} /></div>
              <span className="font-black text-slate-800 text-base">مدرستي</span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-indigo-600">
              <Menu size={24} />
           </button>
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
  const activeWeek = db.getActiveWeek(school.id);
  const teachersCount = db.getTeachers(school.id).length;
  const studentsCount = db.getStudents(school.id).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">نظرة عامة</h1>
        <p className="text-slate-400 font-bold mt-1 text-base">مدرسة {school.name} - الإحصائيات المباشرة</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'الطلاب', value: studentsCount, icon: <GraduationCap size={24} />, color: 'indigo' },
          { label: 'المعلمون', value: teachersCount, icon: <Users size={24} />, color: 'blue' },
          { label: 'الأسبوع الدراسي', value: activeWeek ? activeWeek.name : 'لا يوجد', icon: <Calendar size={24} />, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="card-neo p-8 flex items-center gap-6 hover:translate-y-[-2px] transition-transform">
             <div className={`w-14 h-14 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center`}>
                {stat.icon}
             </div>
             <div>
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">{stat.label}</div>
             </div>
          </div>
        ))}
      </div>

      <CommunicationHub schoolId={school.id} />
    </div>
  );
};

export default SchoolDashboard;
