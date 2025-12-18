
import React from 'react';
import { MOCK_SCHOOLS } from '../constants';
import { 
  LayoutDashboard, ShieldCheck, School, 
  CreditCard, Settings, LogOut, CheckCircle2, 
  XCircle, ArrowUpRight, Plus, Globe
} from 'lucide-react';

const SystemAdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-['Tajawal']">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-900 text-white flex flex-col p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-blue-500 p-2 rounded-xl"><ShieldCheck /></div>
          <span className="text-2xl font-black">إدارة النظام</span>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { label: 'الرئيسية', icon: <LayoutDashboard size={20} />, active: true },
            { label: 'المدارس المشتركة', icon: <School size={20} /> },
            { label: 'الاشتراكات والمدفوعات', icon: <CreditCard size={20} /> },
            { label: 'إعدادات المنصة', icon: <Settings size={20} /> },
          ].map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition ${item.active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={onLogout} className="mt-auto flex items-center gap-3 p-4 text-rose-400 font-bold hover:bg-rose-950/30 rounded-2xl transition">
          <LogOut size={20} />
          تسجيل الخروج
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900">مرحباً، المشرف العام</h1>
            <p className="text-slate-500 mt-1">نظرة شاملة على كافة المدارس والاشتراكات النشطة.</p>
          </div>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-100 hover:scale-105 transition">
            <Plus size={20} />
            إضافة مدرسة جديدة
          </button>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'إجمالي المدارس', value: '154', color: 'blue' },
            { label: 'اشتراكات نشطة', value: '142', color: 'emerald' },
            { label: 'إجمالي الطلاب', value: '45,200', color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
               <div className="text-slate-400 font-bold text-sm uppercase tracking-widest">{stat.label}</div>
               <div className="text-4xl font-black text-slate-900 mt-2">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Schools Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800">المدارس المسجلة</h3>
            <button className="text-blue-600 font-bold text-sm flex items-center gap-1">عرض الكل <ArrowUpRight size={16} /></button>
          </div>
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest">
              <tr>
                <th className="p-6">المدرسة</th>
                <th className="p-6">الحالة</th>
                <th className="p-6">الطلاب/المعلمون</th>
                <th className="p-6">تاريخ الانتهاء</th>
                <th className="p-6">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SCHOOLS.map(school => (
                <tr key={school.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                        {school.logoUrl ? <img src={school.logoUrl} className="w-full h-full object-cover" /> : <School size={24} className="text-slate-300" />}
                      </div>
                      <div>
                        <div className="font-black text-slate-800">{school.name}</div>
                        <div className="text-xs text-slate-400 font-bold">slug: {school.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    {school.subscriptionActive ? (
                      <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-xs font-black flex items-center gap-1 w-fit">
                        <CheckCircle2 size={14} /> نشط
                      </span>
                    ) : (
                      <span className="bg-rose-50 text-rose-600 px-4 py-1 rounded-full text-xs font-black flex items-center gap-1 w-fit">
                        <XCircle size={14} /> منتهي
                      </span>
                    )}
                  </td>
                  <td className="p-6 font-bold text-slate-600">
                    <span className="text-blue-600">{school.studentCount}</span> / <span className="text-purple-600">{school.teacherCount}</span>
                  </td>
                  <td className="p-6 font-mono text-slate-400">{school.expiryDate}</td>
                  <td className="p-6">
                    <div className="flex gap-2">
                       <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-white transition"><Settings size={18} /></button>
                       <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-600 hover:text-white transition"><Globe size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default SystemAdminDashboard;
