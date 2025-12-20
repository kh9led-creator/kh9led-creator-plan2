
import React, { useState, useEffect } from 'react';
import { db } from '../constants';
import { School as SchoolType } from '../types';
import { 
  LayoutDashboard, ShieldCheck, School, 
  CreditCard, Settings, LogOut, CheckCircle2, 
  XCircle, ArrowUpRight, Plus, Globe, User, Lock, Save, Check, Key,
  Mail, Phone
} from 'lucide-react';

const SystemAdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'schools' | 'profile'>('home');
  const [schools, setSchools] = useState<SchoolType[]>([]);
  
  // بيانات الملف الشخصي
  const [adminData, setAdminData] = useState(db.getSystemAdmin());
  const [newUsername, setNewUsername] = useState(adminData.username);
  const [newPassword, setNewPassword] = useState(adminData.password);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      const data = await db.getSchools();
      setSchools(data);
    };
    fetchSchools();
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { username: newUsername, password: newPassword };
    db.updateSystemAdmin(updated);
    setAdminData(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const deleteSchool = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المدرسة نهائياً؟ سيتم حذف كافة البيانات المرتبطة بها.')) {
      await db.deleteSchool(id);
      setSchools(await db.getSchools());
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-['Tajawal']">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-900 text-white flex flex-col p-8 shrink-0">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-blue-500 p-2 rounded-xl"><ShieldCheck /></div>
          <span className="text-2xl font-black">إدارة النظام</span>
        </div>

        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} /> الرئيسية
          </button>
          <button 
            onClick={() => setActiveTab('schools')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition ${activeTab === 'schools' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <School size={20} /> المدارس والبيانات
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <User size={20} /> إعدادات حسابي
          </button>
        </nav>

        <button onClick={onLogout} className="mt-auto flex items-center gap-3 p-4 text-rose-400 font-bold hover:bg-rose-950/30 rounded-2xl transition">
          <LogOut size={20} /> تسجيل الخروج
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        {activeTab === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-4xl font-black text-slate-900">مرحباً، {adminData.username}</h1>
                <p className="text-slate-500 mt-1">نظرة عامة على حالة المنصة ككل.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="text-slate-400 font-bold text-sm uppercase tracking-widest">إجمالي المدارس</div>
                <div className="text-4xl font-black text-slate-900 mt-2">{schools.length}</div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="text-slate-400 font-bold text-sm uppercase tracking-widest">المعلمون النشطون</div>
                <div className="text-4xl font-black text-emerald-600 mt-2">--</div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="text-slate-400 font-bold text-sm uppercase tracking-widest">الطلاب المسجلون</div>
                <div className="text-4xl font-black text-blue-600 mt-2">--</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 max-w-2xl">
             <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-200">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                      <ShieldCheck size={32} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-slate-900">إدارة حساب المشرف</h2>
                      <p className="text-slate-500 font-medium">يمكنك تغيير بيانات الدخول للنظام من هنا</p>
                   </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 flex items-center gap-2 mr-2">
                        <User size={16} className="text-blue-500" /> اسم المستخدم للمشرف
                      </label>
                      <input 
                        type="text" 
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full p-5 bg-slate-50 border-none rounded-3xl font-black text-lg outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 flex items-center gap-2 mr-2">
                        <Lock size={16} className="text-blue-500" /> كلمة المرور الجديدة
                      </label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-5 bg-slate-50 border-none rounded-3xl font-black text-lg outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                   </div>

                   <button 
                    type="submit"
                    className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all flex items-center justify-center gap-3 ${saveSuccess ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black'}`}
                   >
                     {saveSuccess ? <><Check /> تم حفظ التغييرات</> : <><Save /> حفظ البيانات الجديدة</>}
                   </button>
                </form>
             </div>
          </div>
        )}

        {(activeTab === 'home' || activeTab === 'schools') && (
           <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden mt-8">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800">إدارة المدارس والبيانات الحساسة</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">بيانات الدخول والتواصل لجميع المدارس المسجلة.</p>
              </div>
            </div>
            {schools.length === 0 ? (
               <div className="p-20 text-center text-slate-400 font-bold">لا يوجد مدارس مسجلة بعد.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest">
                    <tr>
                      <th className="p-6">المدرسة</th>
                      <th className="p-6">رابط الوصول (Slug)</th>
                      <th className="p-6">التواصل (البريد/الجوال)</th>
                      <th className="p-6">كلمة المرور</th>
                      <th className="p-6">الحالة</th>
                      <th className="p-6 text-left">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map(school => (
                      <tr key={school.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                             {school.logoUrl && <img src={school.logoUrl} className="w-8 h-8 rounded-lg object-contain bg-white border" />}
                             <span className="font-black text-slate-900">{school.name}</span>
                          </div>
                        </td>
                        <td className="p-6 font-mono text-blue-600 font-bold">{school.slug}</td>
                        <td className="p-6">
                           <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                                <Mail size={12} className="text-indigo-400" />
                                <span>{school.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                                <Phone size={12} className="text-emerald-400" />
                                <span dir="ltr">{school.adminPhone || '---'}</span>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-2 text-slate-600 font-black">
                              <Key size={14} className="text-amber-500" />
                              <span>{school.adminPassword || 'admin (افتراضي)'}</span>
                           </div>
                        </td>
                        <td className="p-6">
                          <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black border border-emerald-100">نشط</span>
                        </td>
                        <td className="p-6 text-left">
                          <button 
                            onClick={() => deleteSchool(school.id)}
                            className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                            title="حذف المدرسة"
                          >
                            <XCircle size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SystemAdminDashboard;
