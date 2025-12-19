
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { School } from '../types.ts';
import { db } from '../constants.tsx';
import { 
  LayoutDashboard, GraduationCap, Calendar, 
  Settings, LogOut, Link as LinkIcon, 
  BookOpenCheck, MessageSquare, ClipboardCheck, Users,
  CheckCircle, AlertCircle, ArrowRight, Copy, Check, Zap, ChevronRight,
  UserCircle, ExternalLink
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
    { path: '/school', icon: <LayoutDashboard size={22} />, label: 'لوحة التحكم' },
    { path: '/school/students', icon: <GraduationCap size={22} />, label: 'إدارة الطلاب' },
    { path: '/school/plans', icon: <BookOpenCheck size={22} />, label: 'الخطط الأسبوعية' },
    { path: '/school/settings', icon: <Settings size={22} />, label: 'إعدادات النظام' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-['Tajawal']">
      {/* Sidebar - Apple Inspired Design */}
      <aside className="w-80 bg-white border-l border-slate-100 flex flex-col no-print shrink-0 z-[100] shadow-sm">
        <div className="p-10 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-100">
              <Zap size={22} fill="white" />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tighter">مدرستي</span>
          </div>
          <div className="mt-6 flex items-center gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
            {school.logoUrl ? (
              <img src={school.logoUrl} className="w-10 h-10 object-contain" alt="logo" />
            ) : (
              <div className="w-10 h-10 bg-indigo-600 rounded-xl"></div>
            )}
            <div className="overflow-hidden">
               <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-0.5">مدير المدرسة</p>
               <h4 className="font-bold text-slate-700 truncate text-sm">{school.name}</h4>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-8 space-y-3 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center justify-between group p-4 rounded-[1.5rem] font-black transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`}>{item.icon}</span>
                  <span className="text-[15px]">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={18} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-slate-50">
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
      <main className="flex-1 overflow-y-auto p-10 lg:p-16">
        <Routes>
          <Route path="/" element={<SchoolOverview school={school} />} />
          <Route path="/students" element={<StudentsManagement schoolId={school.id} />} />
          <Route path="/plans" element={<WeeklyPlansManagement school={school} />} />
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
  const [copied, setCopied] = useState(false);

  const teacherLoginLink = `${window.location.origin}/#/school/${school.slug}/teacher-login`;

  const copyTeacherLink = () => {
    navigator.clipboard.writeText(teacherLoginLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">لوحة المعلومات</h1>
          <p className="text-slate-400 mt-2 font-bold text-lg">أهلاً بك مجدداً في إدارة {school.name}.</p>
        </div>
        <div className="text-left">
           <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">تاريخ اليوم</div>
           <div className="text-lg font-black text-slate-700">{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </header>

      {/* Quick Links Section */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-indigo-100 flex flex-col md:flex-row items-center gap-8 animate-in slide-in-from-top-4">
         <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <LinkIcon size={32} />
         </div>
         <div className="flex-1 text-center md:text-right">
            <h3 className="text-xl font-black text-slate-800">رابط دخول المعلمين</h3>
            <p className="text-slate-500 font-bold text-sm">أرسل هذا الرابط للمعلمين ليتمكنوا من رصد الخطط والغياب.</p>
            <div className="mt-3 flex items-center gap-3 bg-slate-50 p-2 pr-4 rounded-xl border border-slate-100">
               <span className="flex-1 text-left font-mono text-xs text-indigo-600 font-bold truncate" dir="ltr">{teacherLoginLink}</span>
               <button 
                onClick={copyTeacherLink}
                className={`px-4 py-2 rounded-lg font-black text-xs transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black'}`}
               >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'تم النسخ' : 'نسخ الرابط'}
               </button>
            </div>
         </div>
         <Link to={`/school/${school.slug}/teacher-login`} target="_blank" className="p-4 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
            <ExternalLink size={20} />
         </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'الطلاب المسجلون', value: studentsCount, icon: <GraduationCap size={28} />, color: 'blue' },
          { label: 'المعلمون النشطون', value: teachersCount, icon: <Users size={28} />, color: 'indigo' },
          { label: 'الأسابيع الدراسية', value: 1, icon: <Calendar size={28} />, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex items-center gap-8 hover:shadow-xl transition-shadow duration-500 group">
             <div className={`w-20 h-20 bg-${stat.color}-50 text-${stat.color}-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {stat.icon}
             </div>
             <div>
                <div className="text-4xl font-black text-slate-900">{stat.value}</div>
                <div className="text-slate-400 font-bold text-sm mt-1">{stat.label}</div>
             </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-10">
        <CommunicationHub schoolId={school.id} />
      </div>
    </div>
  );
};

export default SchoolDashboard;
