
import React, { useState } from 'react';
import { School, Teacher } from '../types';
import { DAYS, PERIODS, MOCK_STUDENTS } from '../constants';
import { 
  LogOut, CheckCircle, ClipboardCheck, BookOpen, 
  MessageSquare, Edit2, Home, Sparkles, StickyNote, Book, Save
} from 'lucide-react';
import CommunicationHub from '../components/school/CommunicationHub';

interface Props {
  teacher: Teacher;
  school: School;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<Props> = ({ teacher, school, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'attendance' | 'messages'>('plans');
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePlan = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('تم حفظ الخطة بنجاح');
    }, 800);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Tajawal']">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-l flex flex-col no-print shrink-0">
        <div className="p-8 border-b text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-4 text-3xl font-black shadow-xl shadow-blue-100 mx-auto">
            {teacher.name[0]}
          </div>
          <h3 className="font-black text-slate-900">{teacher.name}</h3>
          <p className="text-[10px] text-blue-600 mt-1 font-black uppercase tracking-widest">{school.name}</p>
        </div>

        <nav className="p-6 space-y-2 flex-1">
          {[
            { id: 'plans', label: 'رصد الخطط', icon: <BookOpen size={20} /> },
            { id: 'attendance', label: 'رصد الغياب', icon: <ClipboardCheck size={20} /> },
            { id: 'messages', label: 'التعاميم', icon: <MessageSquare size={20} /> },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-6 border-t">
          <button onClick={onLogout} className="flex items-center gap-3 w-full p-4 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition">
            <LogOut size={20} />
            خروج من النظام
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 bg-slate-50">
        {activeTab === 'plans' && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-3xl font-black">رصد الخطة الأسبوعية</h1>
                <div className="flex gap-2 mt-4">
                  {DAYS.map(day => (
                    <button 
                      key={day.id}
                      onClick={() => setSelectedDay(day)}
                      className={`px-6 py-2 rounded-xl font-bold transition ${selectedDay.id === day.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border text-slate-500'}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleSavePlan}
                className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95 hover:bg-blue-700"
              >
                {isSaving ? 'جاري الحفظ...' : <><Save size={20} /> اعتماد رصد اليوم</>}
              </button>
            </header>

            <div className="space-y-8">
              {PERIODS.slice(0, 5).map((p) => (
                <div key={p} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row group hover:border-blue-200 transition-all duration-300">
                  <div className="w-full md:w-24 bg-slate-50 border-l flex flex-col items-center justify-center p-4">
                    <span className="text-xs font-black text-slate-400">الحصة</span>
                    <span className="text-3xl font-black text-slate-300 group-hover:text-blue-200 transition">{p}</span>
                  </div>
                  
                  <div className="flex-1 p-8 space-y-8">
                    {/* الدرس والمادة */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-black text-slate-400 mb-2 flex items-center gap-1">
                          <Book size={14} className="text-blue-600" />
                          المادة
                        </label>
                        <select className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-800 outline-none">
                          <option>لغتي</option>
                          <option>رياضيات</option>
                          <option>علوم</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-black text-slate-400 mb-2 flex items-center gap-1">
                          <Edit2 size={14} className="text-blue-600" />
                          عنوان الدرس المقرر
                        </label>
                        <input 
                          type="text" 
                          placeholder="مثال: النص الشعري، الجمع مع إعادة التجميع..." 
                          className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none" 
                        />
                      </div>
                    </div>

                    {/* الحقول التفصيلية */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-emerald-600 flex items-center gap-2 mr-2">
                          <Home size={14} />
                          الواجبات المنزلية
                        </label>
                        <textarea 
                          rows={3} 
                          placeholder="أدخل نص الواجب هنا..." 
                          className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-emerald-50 transition-all resize-none outline-none"
                        ></textarea>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-amber-600 flex items-center gap-2 mr-2">
                          <Sparkles size={14} />
                          المهام الإثرائية
                        </label>
                        <textarea 
                          rows={3} 
                          placeholder="أنشطة إضافية لتعزيز الفهم..." 
                          className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-amber-50 transition-all resize-none outline-none"
                        ></textarea>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-purple-600 flex items-center gap-2 mr-2">
                          <StickyNote size={14} />
                          ملاحظات إضافية
                        </label>
                        <textarea 
                          rows={3} 
                          placeholder="أي تنبيهات تخص الحصة..." 
                          className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-purple-50 transition-all resize-none outline-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
             <header className="flex justify-between items-center mb-10">
                <div>
                  <h1 className="text-3xl font-black">كشف الغياب اليومي</h1>
                  <p className="text-slate-500 mt-1">رصد الحضور والغياب لطلاب فصلك</p>
                </div>
                <button className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100">
                  إرسال الكشف للإدارة
                </button>
             </header>

             <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-xs font-black border-b">
                      <th className="p-6">اسم الطالب</th>
                      <th className="p-6">الفصل</th>
                      <th className="p-6 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_STUDENTS.map(student => (
                      <tr key={student.id} className="border-b last:border-0">
                        <td className="p-6 font-bold">{student.name}</td>
                        <td className="p-6 text-slate-500">{student.grade}</td>
                        <td className="p-6">
                           <div className="flex justify-center gap-2">
                              <button className="px-6 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">حاضر</button>
                              <button className="px-6 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold hover:bg-rose-100 hover:text-rose-600 transition">غائب</button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="h-full flex flex-col animate-in fade-in">
             <CommunicationHub />
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
