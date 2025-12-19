
import React, { useState, useMemo, useEffect } from 'react';
import { School, Teacher, Subject, Student } from '../types.ts';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { LogOut, BookOpen, ClipboardCheck, MessageSquare, Save, Book, Edit2, Home, Sparkles, StickyNote, CheckCircle, UserX, Users, CheckCircle2, ChevronLeft } from 'lucide-react';
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
  
  // حالات الغياب
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<string | null>(null);
  const [absentStudents, setAbsentStudents] = useState<string[]>([]);
  const [attendanceStep, setAttendanceStep] = useState<'class-select' | 'student-list'>('class-select');

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
      timestamp: new Date().toISOString()
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
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-6 text-4xl font-black mx-auto shadow-2xl shadow-indigo-100 animate-float">
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
        {activeTab === 'plans' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">رصد الخطة الدراسية</h1>
                <p className="text-slate-400 font-bold mt-2">قم بتعبئة الدروس والواجبات لحصصك اليومية.</p>
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
        )}
        
        {activeTab === 'attendance' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">رصد غياب اليوم</h1>
                <p className="text-slate-400 font-bold mt-2">اختر الفصل لرصد غياب الطلاب في حصصك لليوم.</p>
             </header>

             {attendanceStep === 'class-select' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {todaysUniqueClasses.length === 0 ? (
                    <div className="col-span-full p-32 text-center text-slate-300 font-black border-4 border-dashed rounded-[4rem]">
                       لا توجد حصص مسجلة لك اليوم لرصد غيابها.
                    </div>
                  ) : (
                    todaysUniqueClasses.map(cls => (
                      <button 
                        key={cls} 
                        onClick={() => startAttendance(cls)}
                        className="group bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-2 transition-all duration-500 text-center flex flex-col items-center gap-6"
                      >
                         <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                            <Users size={32} />
                         </div>
                         <h3 className="text-2xl font-black text-slate-800">{cls}</h3>
                         <span className="text-indigo-600 font-black text-sm group-hover:underline">رصد الغياب الآن</span>
                      </button>
                    ))
                  )}
                </div>
             ) : (
                <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
                   <div className="p-10 border-b bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-5">
                         <button onClick={() => setAttendanceStep('class-select')} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><ChevronLeft className="rotate-180" /></button>
                         <div>
                            <h3 className="text-2xl font-black text-slate-900">طلاب {selectedClassForAttendance}</h3>
                            <p className="text-slate-500 font-bold">حدد الطلاب الغائبين في حصتك الحالية.</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="bg-rose-50 text-rose-600 px-6 py-2 rounded-full font-black text-sm border border-rose-100">الغائبون: {absentStudents.length}</div>
                         <button 
                          onClick={submitAttendance}
                          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-black transition-all"
                         >اعتماد الكشف وإرساله</button>
                      </div>
                   </div>

                   <div className="p-10 lg:p-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Fix: Ensured explicit typing and array casting to fix unknown assignment error */}
                      {(db.getStudents(school.id) as Student[])
                        .filter((s: Student) => `${s.grade} - فصل ${s.section}` === selectedClassForAttendance)
                        .map((student: Student) => {
                          const isAbsent = absentStudents.includes(student.name);
                          return (
                            <button 
                              key={student.id}
                              onClick={() => toggleStudentAttendance(student.name)}
                              className={`flex items-center justify-between p-5 rounded-2xl font-black transition-all border-2 ${isAbsent ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-inner' : 'bg-white border-slate-50 text-slate-700 hover:border-indigo-100 hover:bg-slate-50'}`}
                            >
                               <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isAbsent ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {isAbsent ? <UserX size={18} /> : student.name[0]}
                                  </div>
                                  <span>{student.name}</span>
                               </div>
                               {isAbsent && <CheckCircle2 size={18} />}
                            </button>
                          );
                        })
                      }
                   </div>
                </div>
             )}
          </div>
        )}

        {activeTab === 'messages' && <CommunicationHub schoolId={school.id} />}
      </main>
    </div>
  );
};

export default TeacherDashboard;
