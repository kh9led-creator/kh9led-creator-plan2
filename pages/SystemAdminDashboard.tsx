
import React, { useState, useEffect } from 'react';
import { db } from '../constants';
import { School as SchoolType } from '../types';
import { 
  LayoutDashboard, ShieldCheck, School, 
  LogOut, CheckCircle2, XCircle, Edit3, Trash2, 
  Plus, Globe, User, Lock, Save, Check, Key,
  Mail, Phone, Loader2, Power, Calendar, RefreshCcw, X
} from 'lucide-react';

const SystemAdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'schools' | 'profile'>('home');
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for Editing
  const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Profile Data
  const [adminData, setAdminData] = useState({ username: '', password: '' });
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [schoolsData, adminInfo] = await Promise.all([
      db.getSchools(),
      db.getSystemAdmin()
    ]);
    setSchools(schoolsData);
    setAdminData(adminInfo);
    setNewUsername(adminInfo.username);
    setNewPassword(adminInfo.password);
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updated = { username: newUsername, password: newPassword };
    await db.updateSystemAdmin(updated);
    setAdminData(updated);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteSchool = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المدرسة نهائياً؟ سيتم حذف كافة البيانات المرتبطة بها.')) {
      await db.deleteSchool(id);
      setSchools(await db.getSchools());
    }
  };

  const handleToggleStatus = async (school: SchoolType) => {
    const updated = { ...school, subscriptionActive: !school.subscriptionActive };
    await db.saveSchool(updated);
    setSchools(await db.getSchools());
  };

  const handleRenewSubscription = async (school: SchoolType) => {
    // تجديد لمدة سنة من تاريخ اليوم
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const dateStr = nextYear.toISOString().split('T')[0];
    
    const updated = { ...school, expiryDate: dateStr, subscriptionActive: true };
    await db.saveSchool(updated);
    setSchools(await db.getSchools());
    alert(`تم تجديد الاشتراك لـ ${school.name} بنجاح حتى ${dateStr}`);
  };

  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchool) {
      await db.saveSchool(editingSchool);
      setSchools(await db.getSchools());
      setShowEditModal(false);
      setEditingSchool(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 flex-col gap-4">
         <Loader2 size={48} className="text-blue-500 animate-spin" />
         <span className="text-white font-black">جاري تهيئة مركز التحكم...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-['Tajawal'] text-right" dir="rtl">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-900 text-white flex flex-col p-8 shrink-0">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/20"><ShieldCheck /></div>
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
                <div className="text-slate-400 font-bold text-sm uppercase tracking-widest">مدارس نشطة</div>
                <div className="text-4xl font-black text-emerald-600 mt-2">{schools.filter(s => s.subscriptionActive).length}</div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                <div className="text-slate-400 font-bold text-sm uppercase tracking-widest">مدارس موقوفة</div>
                <div className="text-4xl font-black text-rose-600 mt-2">{schools.filter(s => !s.subscriptionActive).length}</div>
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
                        className="w-full p-5 bg-slate-50 border-none rounded-3xl font-black text-lg outline-none focus:ring-2 focus:ring-blue-100 transition-all text-left"
                        dir="ltr"
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
                        className="w-full p-5 bg-slate-50 border-none rounded-3xl font-black text-lg outline-none focus:ring-2 focus:ring-blue-100 transition-all text-left"
                        dir="ltr"
                      />
                   </div>

                   <button 
                    type="submit"
                    disabled={isSaving}
                    className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${saveSuccess ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-black'}`}
                   >
                     {isSaving ? <Loader2 className="animate-spin" /> : (saveSuccess ? <><Check /> تم حفظ التغييرات</> : <><Save /> حفظ البيانات الجديدة</>)}
                   </button>
                </form>
             </div>
          </div>
        )}

        {activeTab === 'schools' && (
           <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden mt-8">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800">إدارة المدارس والبيانات</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">التحكم الكامل في المدارس المسجلة: تعديل، إيقاف، وحذف.</p>
              </div>
            </div>
            {schools.length === 0 ? (
               <div className="p-20 text-center text-slate-400 font-bold">لا يوجد مدارس مسجلة بعد.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="p-6 text-right">المدرسة</th>
                      <th className="p-6 text-right">رابط الوصول</th>
                      <th className="p-6 text-right">التواصل</th>
                      <th className="p-6 text-right">تاريخ الانتهاء</th>
                      <th className="p-6 text-right">الحالة</th>
                      <th className="p-6 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schools.map(school => (
                      <tr key={school.id} className="hover:bg-slate-50 transition group">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border">
                                {school.logoUrl ? <img src={school.logoUrl} className="w-full h-full object-contain" /> : <School className="text-slate-300" size={20} />}
                             </div>
                             <span className="font-black text-slate-900">{school.name}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-full w-fit">
                            <Globe size={12} />
                            <span>/p/{school.slug}</span>
                          </div>
                        </td>
                        <td className="p-6">
                           <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-500">
                              <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-300" /> {school.email}</span>
                              <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-300" /> {school.adminPhone || '---'}</span>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-1.5 font-bold text-xs text-slate-600">
                              <Calendar size={14} className="text-slate-400" />
                              <span>{school.expiryDate}</span>
                           </div>
                        </td>
                        <td className="p-6">
                          {school.subscriptionActive ? (
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-100 flex items-center gap-1.5 w-fit">
                               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                               نشط
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black border border-rose-100 flex items-center gap-1.5 w-fit">
                               <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                               موقوف
                            </span>
                          )}
                        </td>
                        <td className="p-6">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleRenewSubscription(school)}
                              className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                              title="تجديد الاشتراك (سنة واحدة)"
                            >
                              <RefreshCcw size={18} />
                            </button>
                            <button 
                              onClick={() => { setEditingSchool({...school}); setShowEditModal(true); }}
                              className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                              title="تعديل بيانات المدرسة"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(school)}
                              className={`p-2.5 rounded-xl transition ${school.subscriptionActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                              title={school.subscriptionActive ? 'إيقاف الاشتراك' : 'تفعيل الاشتراك'}
                            >
                              <Power size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteSchool(school.id)}
                              className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                              title="حذف المدرسة نهائياً"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Edit School Modal */}
        {showEditModal && editingSchool && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
            <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
               <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Edit3 size={24} /></div>
                     <div>
                        <h3 className="text-2xl font-black text-slate-900">تعديل بيانات المدرسة</h3>
                        <p className="text-sm text-slate-500 font-bold">تحديث المعلومات الأساسية للمدرسة.</p>
                     </div>
                  </div>
                  <button onClick={() => { setShowEditModal(false); setEditingSchool(null); }} className="p-3 bg-white text-slate-400 rounded-2xl hover:text-rose-500 shadow-sm transition-colors"><X size={24} /></button>
               </div>
               
               <form onSubmit={handleUpdateSchool} className="p-10 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 mr-2">اسم المدرسة</label>
                      <input 
                        type="text" 
                        required
                        value={editingSchool.name}
                        onChange={e => setEditingSchool({...editingSchool, name: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 mr-2">رابط المدرسة (Slug)</label>
                      <input 
                        type="text" 
                        required
                        value={editingSchool.slug}
                        onChange={e => setEditingSchool({...editingSchool, slug: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 mr-2">البريد الإلكتروني</label>
                      <input 
                        type="email" 
                        required
                        value={editingSchool.email}
                        onChange={e => setEditingSchool({...editingSchool, email: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all text-left"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 mr-2">رقم الجوال</label>
                      <input 
                        type="text" 
                        value={editingSchool.adminPhone || ''}
                        onChange={e => setEditingSchool({...editingSchool, adminPhone: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 mr-2">تاريخ انتهاء الاشتراك</label>
                    <input 
                      type="date" 
                      required
                      value={editingSchool.expiryDate}
                      onChange={e => setEditingSchool({...editingSchool, expiryDate: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all text-left"
                    />
                  </div>

                  <div className="pt-4 flex gap-4">
                     <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black transition-all hover:bg-slate-200">إلغاء</button>
                     <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition flex items-center justify-center gap-2">
                        <Save size={20} />
                        حفظ التعديلات
                     </button>
                  </div>
               </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SystemAdminDashboard;
