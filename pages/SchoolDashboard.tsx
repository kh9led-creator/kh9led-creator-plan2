
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, Settings, 
  LogOut, Menu, X, Bell, Search, Zap 
} from 'lucide-react';
import { User } from '../types';

interface Props {
  user: User;
  onLogout: () => void;
}

const SchoolDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/school', icon: <LayoutDashboard size={20} />, label: 'الرئيسية' },
    { path: '/school/students', icon: <Users size={20} />, label: 'إدارة الطلاب' },
    { path: '/school/plans', icon: <BookOpen size={20} />, label: 'الخطط الأسبوعية' },
    { path: '/school/settings', icon: <Settings size={20} />, label: 'إعدادات المدرسة' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Tajawal']" dir="rtl">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-8 flex items-center gap-4 border-b border-slate-800/50">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
              <Zap size={24} fill="white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">نظام خططي</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-200
                  ${isActive(item.path) 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'hover:bg-slate-800 hover:text-white'}
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="p-6 border-t border-slate-800/50 bg-slate-950/30">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-black text-blue-500">
                {user.name[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-white truncate">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">School Admin</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-bold text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut size={20} />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 relative z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl w-80 border border-slate-200">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="بحث سريع..." 
                className="bg-transparent border-none outline-none text-sm font-bold w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-blue-600 relative">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-black text-slate-900 hidden sm:block">المدرسة الذكية</p>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black border border-blue-100">
                S
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
             <Routes>
                <Route path="/" element={<DefaultOverview />} />
                <Route path="/students" element={<div className="p-10 text-center font-bold text-slate-400">صفحة استيراد الطلاب ستظهر هنا</div>} />
                {/* أضف باقي المسارات هنا */}
             </Routes>
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const DefaultOverview = () => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="mb-10">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">نظرة عامة</h1>
      <p className="text-slate-500 font-bold mt-1">مرحباً بك في لوحة تحكم مدرستك.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'إجمالي الطلاب', value: '1,240', color: 'blue' },
        { label: 'المعلمون', value: '48', color: 'indigo' },
        { label: 'الخطط النشطة', value: '12', color: 'emerald' },
        { label: 'الاشتراك', value: 'نشط', color: 'amber' },
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
