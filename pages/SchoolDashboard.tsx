
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { School } from '../types';
import { 
  LayoutDashboard, GraduationCap, Calendar, 
  Settings, LogOut, Link as LinkIcon, 
  BookOpenCheck, MessageSquare, ClipboardCheck, Users,
  CheckCircle, AlertCircle, ArrowRight, Copy, Check
} from 'lucide-react';
import StudentsManagement from '../components/school/StudentsManagement';
import SchoolSettings from '../components/school/SchoolSettings';
import WeeklyPlansManagement from '../components/school/WeeklyPlansManagement';
import AttendanceManagement from '../components/school/AttendanceManagement';
import CommunicationHub from '../components/school/CommunicationHub';

interface Props {
  school: School;
  onLogout: () => void;
}

const SchoolDashboard: React.FC<Props> = ({ school, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/school', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم' },
    { path: '/school/students', icon: <GraduationCap size={20} />, label: 'إدارة الطلاب' },
    { path: '/school/plans', icon: <BookOpenCheck size={20} />, label: 'الخطط الأسبوعية' },
    { path: '/school/attendance', icon: <ClipboardCheck size={20} />, label: 'رصد الغياب' },
    { path: '/school/settings', icon: <Settings size={20} />, label: 'الإعدادات' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Tajawal']">
      <aside className="w-72 bg-white border-l flex flex-col no-print shrink-0 overflow-y-auto">
        <div className="p-8 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <LinkIcon size={24} />
            </div>
            <span className="text-xl font-black text-slate-800">مدرستي</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-bold">{school.name}</p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${
                location.pathname === item.path 
                ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-50' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full p-4 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition"
          >
            <LogOut size={20} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 bg-slate-50">
        <Routes>
          <Route path="/" element={<SchoolOverview school={school} />} />
          <Route path="/students" element={<StudentsManagement />} />
          <Route path="/plans" element={<WeeklyPlansManagement school={school} />} />
          <Route path="/attendance" element={<AttendanceManagement />} />
          <Route path="/settings/*" element={<SchoolSettings school={school} />} />
        </Routes>
      </main>
    </div>
  );
};

const SchoolOverview: React.FC<{ school: School }> = ({ school }) => {
  const [copied, setCopied] = useState(false);
  const teacherLoginUrl = `${window.location.origin}/#/school/${school.slug}/teacher-login`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(teacherLoginUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900">مرحباً، مدير {school.name}</h1>
          <p className="text-slate-500 mt-1">إليك ملخص سريع لأداء مدرستك اليوم</p>
        </div>
        
        {/* Teacher Access Link Section */}
        <div className="bg-white p-4 rounded-3xl border border-blue-100 flex items-center gap-4 shadow-sm w-full md:w-auto">
          <div className="flex-1 md:flex-none">
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">رابط دخول المعلمين</div>
            <div className="text-xs font-mono text-slate-400 max-w-[200px] truncate">{teacherLoginUrl}</div>
          </div>
          <button 
            onClick={copyToClipboard}
            className={`p-3 rounded-2xl transition-all flex items-center gap-2 font-bold text-sm ${copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'تم النسخ' : 'نسخ الرابط'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
        {[
          { label: 'عدد الطلاب', value: '450', icon: <GraduationCap />, color: 'blue' },
          { label: 'المعلمون', value: '32', icon: <Users />, color: 'purple' },
          { label: 'نسبة الغياب اليوم', value: '4%', icon: <ClipboardCheck />, color: 'rose' },
          { label: 'رسائل جديدة', value: '5', icon: <MessageSquare />, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${stat.color}-100 text-${stat.color}-600`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">{stat.value}</div>
              <div className="text-slate-500 text-sm font-bold">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Completion Monitoring Section */}
      <div className="space-y-4 shrink-0">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 px-2">
          <Calendar size={22} className="text-blue-600" />
          متابعة إنجاز الخطط الأسبوعية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all cursor-pointer">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-100 text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
                <CheckCircle size={32} />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">٢٤</div>
                <div className="text-slate-500 font-bold">معلم أكملوا الخطة</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-emerald-500 font-black bg-emerald-50 px-4 py-2 rounded-xl text-xs uppercase tracking-widest">مكتمل</span>
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                عرض القائمة <ArrowRight size={10} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-amber-100 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-all cursor-pointer">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-amber-100 text-amber-600 shadow-inner group-hover:scale-110 transition-transform">
                <AlertCircle size={32} />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">٨</div>
                <div className="text-slate-500 font-bold">معلم لم يكملوا الخطة</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-amber-500 font-black bg-amber-50 px-4 py-2 rounded-xl text-xs uppercase tracking-widest">قيد العمل</span>
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 group-hover:text-amber-600 transition-colors">
                متابعة الآن <ArrowRight size={10} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[500px] flex flex-col">
        <CommunicationHub />
      </div>
    </div>
  );
};

export default SchoolDashboard;
