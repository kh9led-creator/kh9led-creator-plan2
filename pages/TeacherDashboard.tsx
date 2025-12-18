
import React, { useState, useMemo, useEffect } from 'react';
import { School, Teacher, Subject } from '../types.ts';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { LogOut, BookOpen, ClipboardCheck, MessageSquare, Save, Book, Edit2, Home, Sparkles, StickyNote, CheckCircle } from 'lucide-react';
import CommunicationHub from '../components/school/CommunicationHub.tsx';

interface Props {
  teacher: Teacher;
  school: School;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<Props> = ({ teacher, school, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'attendance' | 'messages'>('plans');
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [planData, setPlanData] = useState<any>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // استخراج حصص هذا المعلم فقط من جميع الجداول
  const teacherSessions = useMemo(() => {
    const sessions: any[] = [];
    const students = db.getStudents(school.id);
    const classes = Array.from(new Set(students.map(s => `${s.grade} - فصل ${s.section}`)));
    
    classes.forEach(classId => {
      const schedule = db.getSchedule(school.id, classId);
      Object.entries(schedule).forEach(([key, val]: [string, any]) => {
        if (val.teacherId === teacher.id) {
          const [dayId, period] = key.split('_');
          sessions.push({ classId, dayId, period: parseInt(period), subjectId: val.subjectId });
        }
      });
    });
    return sessions;
  }, [school.id, teacher.id]);

  useEffect(() => {
    setPlanData(db.getPlans(school.id));
    setSubjects(db.getSubjects(school.id));
  }, [school.id]);

  const handlePlanChange = (classId: string, dayId: string, period: number, field: string, value: string) => {
    const planKey = `${classId}_${dayId}_${period}`;
    const newPlanData = {
      ...planData,
      [planKey]: { ...(planData[planKey] || {}), [field]: value }
    };
    setPlanData(newPlanData);
    db.savePlan(school.id, planKey, newPlanData[planKey]);
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  const todaysSessions = teacherSessions.filter(s => s.dayId === selectedDay.id);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Tajawal']">
      <aside className="w-72 bg-white border-l flex flex-col no-print shrink-0">
        <div className="p-8 border-b text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-4 text-3xl font-black mx-auto shadow-lg shadow-blue-100">
            {teacher.name[0]}
          </div>
          <h3 className="font-black text-slate-900">{teacher.name}</h3>
          <p className="text-[10px] text-blue-600 mt-1 font-black uppercase tracking-widest">{school.name}</p>
        </div>
        <nav className="p-6 space-y-2 flex-1">
          <button onClick={() => setActiveTab('plans')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition ${activeTab === 'plans' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><BookOpen size={20} /> رصد الخطط</button>
          <button onClick={() => setActiveTab('attendance')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition ${activeTab === 'attendance' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><ClipboardCheck size={20} /> رصد الغياب</button>
          <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition ${activeTab === 'messages' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><MessageSquare size={20} /> التعاميم</button>
        </nav>
        <div className="p-6 border-t"><button onClick={onLogout} className="flex items-center gap-3 w-full p-4 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition"><LogOut size={20} /> خروج</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        {activeTab === 'plans' && (
          <div className="space-y-10 animate-in fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900">رصد الخطة الأسبوعية</h1>
                <div className="flex flex-wrap gap-2 mt-4">
                  {DAYS.map(day => <button key={day.id} onClick={() => setSelectedDay(day)} className={`px-6 py-2 rounded-xl font-bold transition ${selectedDay.id === day.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border text-slate-500 hover:bg-slate-50'}`}>{day.label}</button>)}
                </div>
              </div>
              <button onClick={handleSaveAll} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-black transition active:scale-95">
                {isSaving ? 'جاري الاعتماد...' : <><Save size={20} /> حفظ كافة التغييرات</>}
              </button>
            </header>

            <div className="space-y-6">
              {todaysSessions.length === 0 ? (
                <div className="bg-white p-24 rounded-[3rem] text-center text-slate-300 font-black border-4 border-dashed">لا توجد حصص مسندة إليك في يوم {selectedDay.label}.</div>
              ) : (
                todaysSessions.map((session, idx) => {
                  const planKey = `${session.classId}_${session.dayId}_${session.period}`;
                  const currentPlan = planData[planKey] || {};
                  const subjectName = subjects.find(s => s.id === session.subjectId)?.name || "مادة غير معرفة";
                  
                  return (
                    <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="w-full md:w-32 bg-slate-50 border-l flex flex-col items-center justify-center p-6 text-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الحصة</span>
                        <span className="text-4xl font-black text-slate-300">{session.period}</span>
                        <div className="mt-4 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black">{session.classId}</div>
                      </div>
                      <div className="flex-1 p-8 space-y-6">
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl mb-2 border border-slate-100">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Book size={20} /></div>
                           <span className="font-black text-slate-700 text-lg">المادة: {subjectName}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                           <div className="md:col-span-4">
                             <label className="text-xs font-black text-slate-400 mb-2 mr-2 block">موضوع الدرس المقرر</label>
                             <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100 transition" value={currentPlan.lesson || ''} onChange={e => handlePlanChange(session.classId, session.dayId, session.period, 'lesson', e.target.value)} placeholder="اكتب اسم الدرس..." />
                           </div>
                           <div className="md:col-span-2">
                             <label className="text-xs font-black text-emerald-600 mb-2 mr-2 block">الواجبات المنزلية</label>
                             <textarea rows={2} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-100 transition" value={currentPlan.homework || ''} onChange={e => handlePlanChange(session.classId, session.dayId, session.period, 'homework', e.target.value)} placeholder="رقم الصفحة، التدريب..." />
                           </div>
                           <div className="md:col-span-2">
                             <label className="text-xs font-black text-amber-600 mb-2 mr-2 block">المهام الإثرائية والأنشطة</label>
                             <textarea rows={2} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-100 transition" value={currentPlan.enrichment || ''} onChange={e => handlePlanChange(session.classId, session.dayId, session.period, 'enrichment', e.target.value)} placeholder="روابط، أبحاث، أنشطة..." />
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'attendance' && (
           <div className="bg-white p-24 rounded-[3rem] text-center font-black text-slate-300 border-4 border-dashed">خاصية رصد الحضور متاحة من لوحة الإدارة لكل فصل.</div>
        )}

        {activeTab === 'messages' && <CommunicationHub schoolId={school.id} />}
      </main>
    </div>
  );
};

export default TeacherDashboard;
