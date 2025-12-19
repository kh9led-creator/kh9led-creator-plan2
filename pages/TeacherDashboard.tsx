
import React, { useState, useMemo, useEffect } from 'react';
import { School, Teacher, Subject, Student, AcademicWeek } from '../types.ts';
import { DAYS, PERIODS, db, formatToHijri } from '../constants.tsx';
import { LogOut, BookOpen, ClipboardCheck, MessageSquare, Save, Book, Edit2, Home, Sparkles, StickyNote, CheckCircle, UserX, Users, CheckCircle2, ChevronLeft, Calendar, Info, AlertTriangle, UserCheck, Menu, X, FileText } from 'lucide-react';
import CommunicationHub from '../components/school/CommunicationHub.tsx';

interface Props {
  teacher: Teacher;
  school: School;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<Props> = ({ teacher, school, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'attendance' | 'messages'>('plans');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(DAYS.find(d => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    return d.id === (today === 'sun' ? 'sun' : today === 'mon' ? 'mon' : today === 'tue' ? 'tue' : today === 'wed' ? 'wed' : today === 'thu' ? 'thu' : 'sun');
  }) || DAYS[0]);
  const [planData, setPlanData] = useState<any>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeWeek, setActiveWeek] = useState<AcademicWeek | undefined>(undefined);
  
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
      date: formatToHijri(new Date()),
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

  const todaysSessions = teacherSessions.filter(s => s.dayId === selectedDay.id);
  const todaysUniqueClasses = Array.from(new Set(todaysSessions.map(s => s.classTitle as string)));

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Tajawal'] relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden" onClick={closeSidebar}></div>
      )}

      <aside className={`
        fixed lg:relative inset-y-0 right-0 w-80 bg-white border-l flex flex-col no-print shrink-0 shadow-xl lg:shadow-sm z-[100] transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b text-center relative">
          <button onClick={closeSidebar} className="lg:hidden absolute top-4 left-4 p-2 text-slate-400">
             <X size={24} />
          </button>
          <div className="w-20 h-20 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white mb-6 text-3xl font-black mx-auto shadow-2xl">
            {teacher.name[0]}
          </div>
          <h3 className="text-lg font-black text-slate-900">{teacher.name}</h3>
          <p className="text-[10px] text-indigo-600 mt-2 font-black uppercase tracking-widest bg-indigo-50 py-1.5 px-3 rounded-full inline-block">{school.name}</p>
        </div>
        <nav className="p-6 space-y-2 flex-1 overflow-y-auto">
          <button onClick={() => {setActiveTab('plans'); closeSidebar();}} className={`w-full flex items-center justify-between p-4 rounded-2xl font-black transition-all ${activeTab === 'plans' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>
            <div className="flex items-center gap-4"><BookOpen size={20} /> رصد الخطط</div>
            {activeTab === 'plans' && <ChevronLeft size={16} />}
          </button>
          <button onClick={() => {setActiveTab('attendance'); closeSidebar();}} className={`w-full flex items-center justify-between p-4 rounded-2xl font-black transition-all ${activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>
            <div className="flex items-center gap-4"><ClipboardCheck size={20} /> رصد الغياب</div>
            {activeTab === 'attendance' && <ChevronLeft size={16} />}
          </button>
          <button onClick={() => {setActiveTab('messages'); closeSidebar();}} className={`w-full flex items-center justify-between p-4 rounded-2xl font-black transition-all ${activeTab === 'messages' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}>
            <div className="flex items-center gap-4"><MessageSquare size={20} /> التعاميم</div>
            {activeTab === 'messages' && <ChevronLeft size={16} />}
          </button>
        </nav>
        <div className="p-6 border-t bg-slate-50/50">
          <button onClick={onLogout} className="flex items-center gap-4 w-full p-4 text-rose-500 font-black hover:bg-rose-100 rounded-2xl transition-all group">
            <LogOut size={20} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="lg:hidden glass border-b px-6 py-4 flex justify-between items-center sticky top-0 z-[80]">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><BookOpen size={16} /></div>
              <span className="font-black text-slate-800">بوابة المعلم</span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white rounded-xl shadow-sm border text-indigo-600">
              <Menu size={24} />
           </button>
        </header>

        <div className="p-6 md:p-12 lg:p-16 max-w-6xl mx-auto">
          <div className={`mb-10 p-5 md:p-6 rounded-[2rem] border-2 flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${activeWeek ? 'bg-indigo-50 border-indigo-100' : 'bg-rose-50 border-rose-100'}`}>
             <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${activeWeek ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>
                  {activeWeek ? <Calendar size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div className="text-right">
                   <h3 className={`text-base md:text-xl font-black ${activeWeek ? 'text-indigo-900' : 'text-rose-900'}`}>
                      {activeWeek ? `أسبوع الرصد: ${activeWeek.name}` : 'لا يوجد أسبوع نشط'}
                   </h3>
                   <p className="text-[10px] md:text-xs font-bold opacity-70">من {activeWeek ? formatToHijri(activeWeek.startDate) : '--'} إلى {activeWeek ? formatToHijri(activeWeek.endDate) : '--'}</p>
                </div>
             </div>
          </div>

          {activeTab === 'plans' && (
            <div className="space-y-10 animate-in fade-in">
               <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {DAYS.map(day => (
                    <button key={day.id} onClick={() => setSelectedDay(day)} className={`px-6 py-2.5 rounded-xl font-black transition-all whitespace-nowrap text-sm ${selectedDay.id === day.id ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white border text-slate-500'}`}>{day.label}</button>
                  ))}
               </div>
               <div className="space-y-6 md:space-y-8">
                 {todaysSessions.length === 0 ? (
                   <div className="bg-white p-20 text-center rounded-[2.5rem] border-4 border-dashed border-slate-100 text-slate-300 font-black">لا توجد حصص مجدولة لك في هذا اليوم.</div>
                 ) : (
                   todaysSessions.map((session, idx) => {
                     const planKey = `${session.classTitle}_${session.dayId}_${session.period}`;
                     const currentPlan = planData[planKey] || {};
                     const subjectName = subjects.find(s => s.id === session.subjectId)?.name || "مادة غير معرفة";
                     return (
                       <div key={idx} className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] border shadow-sm overflow-hidden flex flex-col md:flex-row">
                          <div className="w-full md:w-40 bg-slate-50 border-b md:border-b-0 md:border-l flex flex-col items-center justify-center p-6 md:p-8">
                            <span className="text-[10px] font-black text-indigo-400 mb-1 tracking-widest uppercase">الحصة</span>
                            <span className="text-4xl md:text-6xl font-black text-slate-200">{session.period}</span>
                            <div className="mt-4 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black">{session.classTitle}</div>
                          </div>
                          <div className="flex-1 p-6 md:p-10 space-y-6 md:space-y-8">
                            <div className="flex items-center gap-3 text-lg md:text-xl font-black text-slate-700"><Book className="text-indigo-600" size={20} /> مادة: {subjectName}</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                               <div className="space-y-1.5">
                                  <label className="text-xs font-black text-slate-400">اسم الدرس</label>
                                  <input className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition" value={currentPlan.lesson || ''} onChange={e => handlePlanChange(session.classTitle, session.dayId, session.period, 'lesson', e.target.value)} />
                               </div>
                               <div className="space-y-1.5">
                                  <label className="text-xs font-black text-slate-400">الواجب</label>
                                  <input className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition" value={currentPlan.homework || ''} onChange={e => handlePlanChange(session.classTitle, session.dayId, session.period, 'homework', e.target.value)} />
                               </div>
                               <div className="space-y-1.5">
                                  <label className="text-xs font-black text-slate-400 flex items-center gap-2"><FileText size={14} className="text-indigo-500" /> الملاحظات / الإثراء</label>
                                  <input className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 transition" value={currentPlan.enrichment || ''} onChange={e => handlePlanChange(session.classTitle, session.dayId, session.period, 'enrichment', e.target.value)} placeholder="اختياري..." />
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
            <div className="space-y-10 animate-in fade-in">
               <header><h1 className="text-2xl md:text-4xl font-black text-slate-900">رصد غياب اليوم (هجري)</h1></header>
               {attendanceStep === 'class-select' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                    {todaysUniqueClasses.map(cls => (
                      <button key={cls as string} onClick={() => startAttendance(cls as string)} className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border shadow-sm hover:shadow-xl transition-all flex flex-col items-center gap-4 md:gap-6">
                         <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 text-indigo-600 rounded-2xl md:rounded-3xl flex items-center justify-center"><Users size={28} /></div>
                         <h3 className="text-lg md:text-2xl font-black">{cls as string}</h3>
                         <span className="text-indigo-600 font-black text-xs md:text-sm">ابدأ الرصد الآن</span>
                      </button>
                    ))}
                  </div>
               ) : (
                  <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] border shadow-sm overflow-hidden">
                     <div className="p-6 md:p-10 border-b bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                          <button onClick={() => setAttendanceStep('class-select')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm transition-all hover:text-indigo-600"><ChevronLeft className="rotate-180" /></button>
                          <h3 className="text-lg md:text-2xl font-black">طلاب {selectedClassForAttendance}</h3>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                          <div className="bg-rose-50 text-rose-600 px-6 py-2 rounded-full font-black text-[10px] md:text-sm border border-rose-100 whitespace-nowrap">الغائبون: {absentStudents.length}</div>
                          <button onClick={submitAttendance} className="flex-1 bg-slate-900 text-white px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-base">إرسال التقرير</button>
                        </div>
                     </div>
                     <div className="p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {db.getStudents(school.id).filter(s => `${s.grade} - فصل ${s.section}` === (selectedClassForAttendance || '')).map((student: Student) => {
                          const isAbsent = absentStudents.includes(student.name);
                          return (
                            <button key={student.id} onClick={() => toggleStudentAttendance(student.name)} className={`flex items-center justify-between p-4 rounded-xl font-black transition-all border-2 text-sm ${isAbsent ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-50 hover:border-indigo-100'}`}>
                               <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${isAbsent ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{isAbsent ? <UserX size={14} /> : <UserCheck size={14} />}</div>
                                  <span>{student.name}</span>
                               </div>
                               {isAbsent && <CheckCircle2 size={16} />}
                            </button>
                          );
                        })}
                     </div>
                  </div>
               )}
            </div>
          )}

          {activeTab === 'messages' && <CommunicationHub schoolId={school.id} />}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
