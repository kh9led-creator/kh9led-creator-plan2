
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { School } from '../types.ts';
import { db } from '../constants.tsx';
import { 
  LayoutDashboard, GraduationCap, Calendar, 
  Settings, LogOut, Link as LinkIcon, 
  BookOpenCheck, MessageSquare, ClipboardCheck, Users,
  CheckCircle, AlertCircle, ArrowRight, Copy, Check
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

  const menuItems = [
    { path: '/school', icon: <LayoutDashboard size={20} />, label: 'الرئيسية' },
    { path: '/school/students', icon: <GraduationCap size={20} />, label: 'الطلاب' },
    { path: '/school/plans', icon: <BookOpenCheck size={20} />, label: 'الخطط' },
    { path: '/school/settings', icon: <Settings size={20} />, label: 'الإعدادات' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Tajawal']">
      <aside className="w-72 bg-white border-l flex flex-col no-print shrink-0">
        <div className="p-8 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white"><LinkIcon size={24} /></div>
            <span className="text-xl font-black text-slate-800">مدرستي</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-bold">{school.name}</p>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition ${location.pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t">
          <button onClick={onLogout} className="flex items-center gap-3 w-full p-4 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition"><LogOut size={20} /> خروج</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        <Routes>
          <Route path="/" element={<SchoolOverview school={school} />} />
          <Route path="/students" element={<StudentsManagement schoolId={school.id} />} />
          <Route path="/plans" element={<WeeklyPlansManagement school={school} />} />
          {/* Fix: Passed school prop to AttendanceManagement */}
          <Route path="/attendance" element={<AttendanceManagement school={school} />} />
          <Route path="/settings/*" element={<SchoolSettings school={school} />} />
        </Routes>
      </main>
    </div>
  );
};

const SchoolOverview: React.FC<{ school: School }> = ({ school }) => {
  const teachersCount = db.getTeachers(school.id).length;
  const studentsCount = db.getStudents(school.id).length;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-black text-slate-900">مرحباً، مدير {school.name}</h1>
        <p className="text-slate-500 mt-1">إليك ملخص سريع لحالة مدرستك الرقمية.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
           <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center"><GraduationCap size={32} /></div>
           <div><div className="text-3xl font-black">{studentsCount}</div><div className="text-slate-400 font-bold">طالب مسجل</div></div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
           <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center"><Users size={32} /></div>
           <div><div className="text-3xl font-black">{teachersCount}</div><div className="text-slate-400 font-bold">معلم مضاف</div></div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
           <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center"><Calendar size={32} /></div>
           <div><div className="text-3xl font-black">1</div><div className="text-slate-400 font-bold">أسبوع دراسي</div></div>
        </div>
      </div>
      
      {/* Fix: Passed schoolId prop to CommunicationHub */}
      <CommunicationHub schoolId={school.id} />
    </div>
  );
};

export default SchoolDashboard;
