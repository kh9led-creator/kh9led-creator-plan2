
import React, { useState, useEffect } from 'react';
import { db } from '../constants';
import { User, SystemStats, School } from '../types';
import { 
  LayoutDashboard, ShieldCheck, School as SchoolIcon, 
  LogOut, Users, Settings, Zap, Search, Bell, Loader2
} from 'lucide-react';

interface Props {
  user: User;
  onLogout: () => void;
}

const SystemAdminDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, schoolsRes] = await Promise.all([
        db.getSystemStats(),
        db.getAllSchools()
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (schoolsRes.success) setSchools(schoolsRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Tajawal'] text-right" dir="rtl">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-900 text-slate-300 flex flex-col p-8 shrink-0 relative z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><Zap size={24} fill="white" /></div>
          <span className="text-2xl font-black text-white tracking-tight">إدارة النظام</span>
        </div>

        <nav className="flex-1 space-y-3">
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl font-bold bg-blue-600 text-white shadow-xl shadow-blue-900/20 transition">
            <LayoutDashboard size={20} /> الرئيسية
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl font-bold hover:bg-slate-800 transition">
            <SchoolIcon size={20} /> المدارس
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl font-bold hover:bg-slate-800 transition">
            <Settings size={20} /> الإعدادات
          </button>
        </nav>

        <button onClick={onLogout} className="mt-auto flex items-center gap-3 p-4 text-rose-400 font-bold hover:bg-rose-950/30 rounded-2xl transition">
          <LogOut size={20} /> تسجيل الخروج
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 w-80">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="بحث عن مدرسة..." className="bg-transparent border-none outline-none text-sm font-bold w-full" />
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 text-slate-400 hover:text-blue-600 relative"><Bell size={22} /></button>
             <div className="h-8 w-px bg-slate-200 mx-2"></div>
             <div className="flex items-center gap-3">
               <div className="text-right">
                 <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Master Admin</p>
               </div>
               <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">A</div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto space-y-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">نظرة عامة</h1>
              <p className="text-slate-500 font-bold mt-1">حالة المنصة والاشتراكات الحالية.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'إجمالي المدارس', value: stats?.totalSchools || 0, icon: <SchoolIcon size={24} />, color: 'blue' },
                    { label: 'الاشتراكات النشطة', value: stats?.activeSubscriptions || 0, icon: <Zap size={24} />, color: 'emerald' },
                    { label: 'إجمالي الطلاب', value: stats?.totalStudents || 0, icon: <Users size={24} />, color: 'indigo' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
                        <p className="text-4xl font-black text-slate-900 mt-2">{stat.value}</p>
                      </div>
                      <div className={`w-14 h-14 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center`}>
                        {stat.icon}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                   <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-xl font-black text-slate-900">المدارس المسجلة</h3>
                      <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-blue-100">إضافة مدرسة</button>
                   </div>
                   <div className="overflow-x-auto">
                     <table className="w-full text-right">
                       <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
                         <tr>
                           <th className="p-6">اسم المدرسة</th>
                           <th className="p-6">رابط الوصول</th>
                           <th className="p-6">الاشتراك</th>
                           <th className="p-6 text-center">الإجراءات</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {schools.map((school) => (
                           <tr key={school.id} className="hover:bg-slate-50/50 transition">
                             <td className="p-6 font-black text-slate-900">{school.name}</td>
                             <td className="p-6 font-mono text-xs text-blue-600">/p/{school.slug}</td>
                             <td className="p-6">
                               <span className={`px-3 py-1 rounded-full text-[10px] font-black ${school.subscriptionActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {school.subscriptionActive ? 'نشط' : 'منتهي'}
                               </span>
                             </td>
                             <td className="p-6 text-center">
                               <button className="text-slate-400 hover:text-blue-600 font-bold text-xs transition">تعديل</button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemAdminDashboard;
