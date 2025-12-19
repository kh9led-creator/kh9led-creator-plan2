import React, { useState, useMemo, useEffect } from 'react';
import { School, Teacher, Subject, Student, AcademicWeek } from '../types.ts';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { LogOut, BookOpen, ClipboardCheck, MessageSquare, Save, Book, Edit2, Home, Sparkles, StickyNote, CheckCircle, UserX, Users, CheckCircle2, ChevronLeft, Calendar, Info, AlertTriangle, UserCheck } from 'lucide-react';
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

  const todaysSessions = teacherSessions.filter(s => s.dayId === selectedDay.id);
  const todaysUniqueClasses = Array.from(new Set(todaysSessions.map(s => s.classTitle)));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Tajawal']">
      <aside className="w-80 bg-white border-l flex flex-col no-print shrink-0 shadow-sm z-10">
        <div className="p-10 border-b text-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-6 text-4xl font-black mx-auto shadow-2xl">
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
        <div className={`mb-12 p-6 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${activeWeek ? 'bg-indigo-50 border-indigo-100' : 'bg-rose-50 border-rose-100'}`}>
           <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${activeWeek ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>
                {activeWeek ? <Calendar size={28} /> : <AlertTriangle size={28} />}
              </div>
              <div>
                 <h3 className={`text-xl font-black ${activeWeek ? 'text-indigo-900' : 'text-rose-900'}`}>
                    {activeWeek ? `أسبوع الرصد: ${activeWeek.name}` : 'لا يوجد أسبوع نشط حالياً'}
                 </h3>
                 <p className="text-sm font-bold opacity-70">من {activeWeek?.startDate || '--'} إلى {activeWeek?.endDate || '--'}</p>
              </div>
           </div>
        </div>

        {activeTab === 'plans' && (
          <div className="space-y-12 animate-in fade-in">
             <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button key={day.id} onClick={() => setSelectedDay(day)} className={`px-8 py-3 rounded-2xl font-black transition-all ${selectedDay.id === day.id ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white border text-slate-500'}`}>{day.label}</button>
                ))}
             </div>
             <div className="space-y-8">
               {todaysSessions.map((session, idx) => {
                 const planKey = `${session.classTitle}_${session.dayId}_${session.period}`;
                 const currentPlan = planData[planKey] || {};
                 const subjectName = subjects.find(s => s.id === session.subjectId)?.name || "مادة غير معرفة";
                 return (
                   <div key={idx} className="bg-white rounded-[3.5rem] border shadow-sm overflow-hidden flex flex-col md:flex-row">
                      <div className="w-40 bg-slate-50 border-l flex flex-col items-center justify-center p-8">
                        <span className="text-xs font-black text-indigo-400 mb-2 tracking-widest uppercase">الحصة</span>
                        <span className="text-6xl font-black text-slate-200">{session.period}</span>
                        <div className="mt-4 px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black">{session.classTitle}</div>
                      </div>
                      <div className="flex-1 p-10 space-y-8">
                        <div className="flex items-center gap-4 text-xl font-black text-slate-700"><Book className="text-indigo-600" /> مادة: {subjectName}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-sm font-black text-slate-400">اسم الدرس</label>
                              <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100" value={currentPlan.lesson || ''} onChange={e => handlePlanChange(session.classTitle, session.dayId, session.period, 'lesson', e.target.value)} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-sm font-black text-slate-400">الواجب</label>
                              <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100" value={currentPlan.homework || ''} onChange={e => handlePlanChange(session.classTitle, session.dayId, session.period, 'homework', e.target.value)} />
                           </div>
                        </div>
                      </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-12 animate-in fade-in">
             <header><h1 className="text-4xl font-black text-slate-900">رصد غياب اليوم</h1></header>
             {attendanceStep === 'class-select' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {todaysUniqueClasses.map(cls => (
                    <button key={cls} onClick={() => startAttendance(cls)} className="bg-white p-12 rounded-[3.5rem] border shadow-sm hover:shadow-xl transition-all flex flex-col items-center gap-6">
                       <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center"><Users size={32} /></div>
                       <h3 className="text-2xl font-black">{cls}</h3>
                       <span className="text-indigo-600 font-black text-sm">ابدأ الرصد الآن</span>
                    </button>
                  ))}
                </div>
             ) : (
                <div className="bg-white rounded-[4rem] border shadow-sm overflow-hidden">
                   <div className="p-10 border-b bg-slate-50 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setAttendanceStep('class-select')} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm transition-all hover:text-indigo-600"><ChevronLeft className="rotate-180" /></button>
                        <h3 className="text-2xl font-black">طلاب {selectedClassForAttendance}</h3>
                      </div>
                      <div className="flex gap-4">
                        <div className="bg-rose-50 text-rose-600 px-6 py-2 rounded-full font-black text-sm border border-rose-100">الغائبون: {absentStudents.length}</div>
                        <button onClick={submitAttendance} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black">إرسال التقرير للإدارة</button>
                      </div>
                   </div>
                   <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Fix: Added explicit Student type to the map callback to resolve "Argument of type 'unknown' is not assignable to parameter of type 'string'" */}
                      {db.getStudents(school.id).filter(s => `${s.grade} - فصل ${s.section}` === selectedClassForAttendance).map((student: Student) => {
                        const isAbsent = absentStudents.includes(student.name);
                        return (
                          <button key={student.id} onClick={() => toggleStudentAttendance(student.name)} className={`flex items-center justify-between p-5 rounded-2xl font-black transition-all border-2 ${isAbsent ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-50 hover:border-indigo-100'}`}>
                             <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isAbsent ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{isAbsent ? <UserX size={18} /> : <UserCheck size={18} />}</div>
                                <span>{student.name}</span>
                             </div>
                             {isAbsent && <CheckCircle2 size={18} />}
                          </button>
                        );
                      })}
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