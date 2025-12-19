
import React, { useState, useMemo, useEffect } from 'react';
import { School, Teacher, Subject, Student, AcademicWeek } from '../types.ts';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { LogOut, BookOpen, ClipboardCheck, MessageSquare, Save, Book, Edit2, Home, Sparkles, StickyNote, CheckCircle, UserX, Users, CheckCircle2, ChevronLeft, Calendar, Info, AlertTriangle } from 'lucide-react';
import CommunicationHub from '../components/school/CommunicationHub.tsx';

interface Props {
  teacher: Teacher;
  school: School;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<Props> = ({ teacher, school, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'attendance' | 'messages'>('plans');
  const [selectedDay, setSelectedDay] = useState(DAYS.find(d => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    return d.id === (today === 'sun' ? 'sun' : today === 'mon' ? 'mon' : today === 'tue' ? 'tue' : today === 'wed' ? 'wed' : today === 'thu' ? 'thu' : 'sun');
  }) || DAYS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [planData, setPlanData] = useState<any>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeWeek, setActiveWeek] = useState<AcademicWeek | undefined>(undefined);
  
  // حالات الغياب
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<string | null>(null);
  const [absentStudents, setAbsentStudents] = useState<string[]>([]);
  const [attendanceStep, setAttendanceStep] = useState<'class-select' | 'student-list'>('class-select');

  useEffect(() => {
    const currentActiveWeek = db.getActiveWeek(school.id);
    setActiveWeek(currentActiveWeek);
    setSubjects(db.getSubjects(school.id));
    
    if (currentActiveWeek) {
      setPlanData(db.getPlans(school.id, currentActiveWeek.id));
    }
  }, [school.id]);

  // استخراج حصص هذا المعلم فقط من جميع الجداول
  const teacherSessions = useMemo(() => {
    const sessions: any[] = [];
    const classes = db.getClasses(school.id);
    const availableClassTitles = classes.map(c => `${c.grade} - فصل ${c.section}`);
    
    availableClassTitles.forEach(classTitle => {
      const schedule = db.getSchedule(school.id, classTitle);
      Object.entries(schedule).forEach(([key, val]: [string, any]) => {
        if (val.teacherId === teacher.id) {
          const [dayId, period] = key.split('_');
          sessions.push({ classTitle, dayId, period: parseInt(period), subjectId: val.subjectId });
        }
      });
    });
    return sessions;
  }, [school.id, teacher.id]);

  const handlePlanChange = (classId: string, dayId: string, period: number, field: string, value: string) => {
    if (!activeWeek) return;
    const planKey = `${classId}_${dayId}_${period}`;
    const newPlanData = {
      ...planData,
      [planKey]: { ...(planData[planKey] || {}), [field]: value }
    };
    setPlanData(newPlanData);
    db.savePlan(school.id, activeWeek.id, planKey, newPlanData[planKey]);
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  const todaysSessions = teacherSessions.filter(s => s.dayId === selectedDay.id);
  const todaysUniqueClasses = Array.from(new Set(todaysSessions.map(s => s.classTitle)));

  // منطق الغياب
  const startAttendance = (classTitle: string) => {
    setSelectedClassForAttendance(classTitle);
    setAbsentStudents([]);
    setAttendanceStep('student-list');
  };

  const toggleStudentAttendance = (studentName: string) => {
    setAbsentStudents(prev => 
      prev.includes(studentName) 
        ? prev.filter(n => n !== studentName) 
        : [...prev, studentName]
    );
  };

  const submitAttendance = () => {
    const report = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ar-SA'),
      day: selectedDay.label,
      teacherName: teacher.name,
      className: selectedClassForAttendance,
      absentCount: absentStudents.length,
      students: absentStudents,
      timestamp: new Date().toISOString(),
      weekName: activeWeek?.name || "الأسبوع الحالي"
    };
    
    db.saveAttendance(school.id, report);
    alert('تم رصد الغياب وإرساله للإدارة بنجاح');
    setAttendanceStep('class-select');
    setSelectedClassForAttendance(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Tajawal']">
      <aside className="w-80 bg-white border-l flex flex-col no-print shrink-0 shadow-sm z-10">
        <div className="p-10 border-b text-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-6 text-4xl font-black mx-auto shadow-2xl shadow-indigo-100">
            {teacher.name[0]}
          </div>
          <h3 className="text-xl font-black text-slate-900">{teacher.name}</h3>
          <p className="text-xs text-indigo-600 mt-2 font-black uppercase tracking-widest bg-indigo-50 py-1.5 px-3 rounded-full inline-block">{school.name}</p>
        </div>
        <nav className="p-8 space-y-3 flex-1 overflow-y-auto">
          <button onClick={() => setActiveTab('plans')} className={`w-full flex items-center justify-between p-4 rounded-2xl font-black transition-all ${activeTab === 'plans' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>
            <div className="flex items-center gap-4"><BookOpen size={22} /> رصد الخطط</div>
            {activeTab === 'plans' && <ChevronLeft size={18} />}
          </button>
          <button onClick={() => setActiveTab('attendance')} className={`w-full flex items-center justify-between p-4 rounded-2xl font-black transition-all ${activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>
            <div className="flex items-center gap-4"><ClipboardCheck size={22} /> رصد الغياب</div>
            {activeTab === 'attendance' && <ChevronLeft size={18} />}
          </button>
          <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center justify-between p-4 rounded-2xl font-black transition-all ${activeTab === 'messages' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>
            <div className="flex items-center gap-4"><MessageSquare size={22} /> التعاميم</div>
            {activeTab === 'messages' && <ChevronLeft size={18} />}
          </button>
        </nav>
        <div className="p-8 border-t bg-slate-50/50"><button onClick={onLogout} className="flex items-center gap-4 w-full p-4 text-rose-500 font-black hover:bg-rose-100 rounded-2xl transition-all group"><LogOut size={22} /> تسجيل الخروج</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto p-12 lg:p-16">
        {/* شريط الأسبوع النشط */}
        <div className={`mb-12 p-6 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${activeWeek ? 'bg-indigo-50 border-indigo-100' : 'bg-rose-50 border-rose-100 animate-pulse'}`}>
           <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${activeWeek ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>
                {activeWeek ? <Calendar size={28} /> : <AlertTriangle size={28} />}
              </div>
              <div>
                 <h3 className={`text-xl font-black ${activeWeek ? 'text-indigo-900' : 'text-rose-900'}`}>
                    {activeWeek ? `رصد خطة: ${activeWeek.name}` : 'لا يوجد أسبوع نشط حالياً'}
                 </h3>
                 <p className={`text-sm font-bold ${activeWeek ? 'text-indigo-600' : 'text-rose-600'}`}>
                    {activeWeek ? `الفترة التاريخية: من ${activeWeek.startDate} إلى ${activeWeek.endDate}` : 'يرجى انتظار تفعيل الأسبوع من قبل الإدارة'}
                 </p>
              </div>
           </div>
           {activeWeek && (
             <div className="bg-white/50 px-6 py-2 rounded-full text-indigo-600 font-black text-xs border border-indigo-100">أسبوع الرصد المعتمد</div>
           )}
        </div>

        {!activeWeek ? (
          <div className="flex flex-col items-center justify-center p-32 text-center space-y-6">
             <div className="w-32 h-32 bg-slate-100 rounded-[3rem] flex items-center justify-center text-slate-300">
                <Info size={64} />
             </div>
             <h2 className="text-3xl font-black text-slate-400">نعتذر، لا يمكنك الرصد حالياً</h2>
             <p className="text-slate-400 max-w-md font-bold text-lg">لم تقم إدارة المدرسة بتحديد الأسبوع الدراسي الحالي للرصد. يرجى مراجعة مدير المدرسة.</p>
          </div>
        ) : (
          activeTab === 'plans' && (
            <div className="space-y-12 animate-in fade-in duration-700">
              <header className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">رصد الخطة الدراسية</h1>
                  <p className="text-slate-400 font-bold mt-2">قم بتعبئة الدروس والواجبات لحصصك اليومية في {activeWeek.name}.</p>
                  <div className="flex flex-wrap gap-2 mt-8">
                    {DAYS.map(day => (
                      <button key={day.id} onClick={() => setSelectedDay(day)} className={`px-8 py-3 rounded-2xl font-black transition-all ${selectedDay.id === day.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-y-[-2px]' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleSaveAll} className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-lg flex items-center gap-3 shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-95">
                  {isSaving ? <CheckCircle2 className="animate-pulse" /> : <Save size={22} />}
                  {isSaving ? 'تم الحفظ...' : 'حفظ التغييرات'}
                </button>
              </header>

              <div className="space-y-8">
                {todaysSessions.length === 0 ? (
                  <div className="bg-white p-32 rounded-[4rem] text-center text-slate-300 font-black border-4 border-dashed border-slate-100 flex flex-col items-center gap-6">
                    <BookOpen size={64} className="opacity-20" />
                    <p className="text-2xl">لا توجد حصص مسندة إليك في يوم {selectedDay.label}</p>
                  </div>
                ) : (
                  todaysSessions.map((session, idx) => {
                    const planKey = `${session.classTitle}_${session.dayId}_${session.period}`;
                    const currentPlan = planData[planKey] || {};
                    const subjectName = subjects.find(s => s.id === session.subjectId)?.name || "مادة غير معرفة";
                    
                    return (
                      <div key={idx} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                        <div className="w-full md:w-40 bg-slate-50/50 border-l border-slate-100 flex flex-col items-center justify-center p-8 text-center shrink-0">
                          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">الحصة</span>
                          <span className="text-6xl font-black text-slate-200">{session.period}</span>
                          <div className="mt-6 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black shadow-lg shadow-indigo-100">{session.classTitle}</div>
                        </div>
                        <div className="flex-1 p-10 lg:p-14 space-y-10">
                          <div className="flex items-center gap-5 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/30">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Book size={24} /></div>
                            <span className="font-black text-slate-700 text-xl">المادة: {subjectName}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="md:col-span-4 space-y-3">
                              <label className="text-sm font-black text-slate-700 mr-2 flex items-center gap-2">
                                  <StickyNote size={16} className="text-indigo-400" /> موضوع الدرس المقرر
                              </label>
                              <input className="w-full p-5 bg-slate-50 rounded-[1.5rem] font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition-all shadow-inner" value={currentPlan.lesson || ''} onChange={e => handlePlanChange(session.classTitle, session.dayId, session.period, 'lesson', e.target.value)} placeholder="اكتب اسم الدرس بوضوح..." />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                              <label className="text-sm font-black text-emerald-600 mr-2">الواجبات المنزلية</label>
                              <textarea rows={3} className="w-full p-5 bg-slate-50 rounded-[1.5rem] font-bold outline-none border-2 border-transparent focus:border-emerald-100 transition-all shadow-inner" value={currentPlan.homework || ''} onChange={e => handlePlanChange(session.classTitle, session.dayId, session.period, 'homework', e.target.value)} placeholder="أرقام الصفحات، التدريبات..." />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                              <label className="text-sm font-black text-amber-600 mr-2">الأنشطة الإثرائية</label>
                              <textarea rows={3} className="w-full p-5 bg-slate-50 rounded-[1.5rem] font-bold outline-none border-2 border-transparent focus:border-amber-100 transition-all shadow-inner" value={currentPlan.enrichment || ''} onChange={e => handlePlanChange(session.classTitle, session.dayId, session.period, 'enrichment', e.target.value)} placeholder="روابط، أبحاث، ملاحظات إضافية..." />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )
        )}
        
        {activeWeek && activeTab === 'attendance' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">رصد غياب اليوم</h1>
                <p className="text-slate-400 font-bold mt-2">اختر الفصل لرصد غياب الطلاب في حصصك لليوم في {activeWeek.name}.</p>
             </header>
             {/* ... محتوى الرصد ... */}
          </div>
        )}

        {activeTab === 'messages' && <CommunicationHub schoolId={school.id} />}
      </main>
    </div>
  );
};

export default TeacherDashboard;
