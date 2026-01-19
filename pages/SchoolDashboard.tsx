
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { School } from '../types';
import { 
  LayoutDashboard, Users, BookOpen, ClipboardCheck, Settings, 
  LogOut, Menu, X, Bell, Search, Zap 
} from 'lucide-react';
import StudentsManagement from '../components/school/StudentsManagement';
import WeeklyPlansManagement from '../components/school/WeeklyPlansManagement';
import AttendanceManagement from '../components/school/AttendanceManagement';
import SchoolSettings from '../components/school/SchoolSettings';

interface Props {
  school: School;
  onLogout: () => void;
}

const SchoolDashboard: React.FC<Props> = ({ school, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/school', icon: <LayoutDashboard size={20} />, label: 'الرئيسية' },
    { path: '/school/students', icon: <Users size={20} />, label: 'إدارة الطلاب' },
    { path: '/school/plans', icon: <BookOpen size={20} />, label: 'الخطط الأسبوعية' },
    { path: '/school/attendance', icon: <ClipboardCheck size={20} />, label: 'رصد الغياب' },
    { path: '/school/settings', icon: <Settings size={20} />, label: 'الإعدادات' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 font-['Tajawal'] overflow-hidden" dir="rtl">
      {/* Sidebar - Desktop */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-8 flex items-center gap-4 border-b border-slate-800">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Zap size={24} fill="white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">نظام خططي</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-200
                  ${isActive(item.path) 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                    : 'hover:bg-slate-800 hover:text-white'}
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="p-6 border-t border-slate-800">
            <button 
              onClick={onLogout}
              className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-bold text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 lg:hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Menu size={24} />
            </button>
            <span className="font-black text-slate-900">مدرستي</span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl w-96 border border-slate-200">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن طالب أو معلم..." 
              className="bg-transparent border-none outline-none text-sm font-bold w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 relative">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none">{school.name}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">إدارة المدرسة</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black border border-indigo-100">
                {school.name[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Overlay */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<DashboardOverview school={school} />} />
              <Route path="/students" element={<StudentsManagement schoolId={school.id} />} />
              <Route path="/plans" element={<WeeklyPlansManagement school={school} />} />
              <Route path="/attendance" element={<AttendanceManagement school={school} />} />
              <Route path="/settings" element={<SchoolSettings school={school} />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

const DashboardOverview: React.FC<{ school: School }> = ({ school }) => (
  <div className="animate-in fade-in duration-500">
    <div className="mb-10">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">لوحة التحكم</h1>
      <p className="text-slate-500 font-bold mt-1">أهلاً بك في نظام الإدارة المدرسية الموحد.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'إجمالي الطلاب', value: '1,240', color: 'indigo' },
        { label: 'المعلمون', value: '48', color: 'blue' },
        { label: 'الخطط المكتملة', value: '85%', color: 'emerald' },
        { label: 'غياب اليوم', value: '12', color: 'rose' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  </div>
);

export default SchoolDashboard;
