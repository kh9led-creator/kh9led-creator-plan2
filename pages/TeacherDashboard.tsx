
import React, { useState, useMemo, useEffect } from 'react';
import { School, Teacher, Subject, Student, AcademicWeek } from '../types.ts';
import { DAYS, PERIODS, db, formatToHijri } from '../constants.tsx';
import { 
  LogOut, BookOpen, ClipboardCheck, MessageSquare, 
  Save, Book, Home, Sparkles, CheckCircle, 
  UserX, Users, CheckCircle2, ChevronLeft, 
  Calendar, AlertTriangle, UserCheck, Menu, X, 
  FileText, Loader2, CloudCheck
} from 'lucide-react';
import CommunicationHub from '../components/school/CommunicationHub.tsx';

interface Props {
  teacher: Teacher;
  school: School;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<Props> = ({ teacher, school, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'attendance' | 'messages'>('plans');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const [selectedDay, setSelectedDay] = useState(DAYS.find(d => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    // تحويل اليوم الحالي ليطابق معرفات الأيام لدينا
    const dayMap: Record<string, string> = { 'sun': 'sun', 'mon': 'mon', 'tue': 'tue', 'wed': 'wed', 'thu': 'thu' };
    return d.id === (dayMap[today] || 'sun');
  }) || DAYS[0]);

  const [planData, setPlanData] = useState<any>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeWeek, setActiveWeek] = useState<AcademicWeek | undefined>(undefined);
  const [teacherSessions, setTeacherSessions] = useState<any[]>([]);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<string | null>(null);
  const [absentStudents, setAbsentStudents] = useState<string[]>([]);
  const [attendanceStep, setAttendanceStep] = useState<'class-select' | 'student-list'>('class-select');

  // Handle initial data loading asynchronously as per @google/genai guidelines.
  useEffect(() => {
    const loadInitialData = async () => {
      const currentActiveWeek = await db.getActiveWeek(school.id);
      setActiveWeek(currentActiveWeek);
      const allSubjects = await db.getSubjects(school.id);
      setSubjects(allSubjects);
      
      if (currentActiveWeek) {
        const plans = await db.getPlans(school.id, currentActiveWeek.id);
        setPlanData(plans);
      }

      // استخراج حصص المعلم فقط من جداول الفصول
      const sessions: any[] = [];
      const classes = await db.getClasses(school.id);
      
      for (const cls of classes) {
        const classTitle = `${cls.grade} - فصل ${cls.section}`;
        const schedule = await db.getSchedule(school.id, classTitle);
        
        Object.entries(schedule).forEach(([key, val]: [string, any]) => {
          if (val.teacherId === teacher.id) {
            const [dayId, period] = key.split('_');
            sessions.push({ 
              classTitle, 
              dayId, 
              period: parseInt(period), 
              subjectId: val.subjectId 
            });
          }
        });
      }
      setTeacherSessions(sessions);

      const allStudents = await db.getStudents(school.id);
      setClassStudents(allStudents);
    };
    loadInitialData();
  }, [school.id, teacher.id]);

  const handlePlanChange = (classId: string, dayId: string, period: number, field: string, value: string) => {
    if (!activeWeek) return;
    
    setSavingStatus('saving');
    const planKey = `${classId}_${dayId}_${period}`;
    const updatedEntry = { ...(planData[planKey] || {}), [field]: value };
    
    const newPlanData = {
      ...planData,
      [planKey]: updatedEntry
    };
    
    setPlanData(newPlanData);
    
    // حفظ في قاعدة البيانات مع تأخير بسيط لمحاكاة الحفظ السحابي
    setTimeout(async () => {
      await db.savePlan(school.id, activeWeek.id, planKey, updatedEntry);
      setSavingStatus('saved');
      setTimeout(() => setSavingStatus('idle'), 2000);
    }, 500);
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

  const submitAttendance = async () => {
    if (!activeWeek) return;
    
    const report = {
      id: Date.now().toString(),
      date: formatToHijri(new Date()),
      day: selectedDay.label,
      teacherName: teacher.name,
      className: selectedClassForAttendance,
      absentCount: absentStudents.length,
      students: absentStudents,
      timestamp: new Date().toISOString(),
      weekName: activeWeek.name
    };
    
    await db.saveAttendance(school.id, report);
    alert('✅ تم رصد الغياب وإرساله بنجاح للإدارة.');
    setAttendanceStep('class-select');
    setSelectedClassForAttendance(null);
  };

  const todaysSessions = teacherSessions.filter(s => s.dayId === selectedDay.id);
  const todaysUniqueClasses = Array.from(new Set(todaysSessions.map(s => s.classTitle as string)));

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-['Tajawal'] relative" dir="rtl">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 right-0 w-80 bg-white border-l flex flex-col no-print shrink-0 shadow-2xl lg:shadow-none z-[100] transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b text-center relative">
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-6 left-6 p-2 text-slate-300 hover:text-rose-500 transition">
             <X size={24} />
          </button>
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-5 text-3xl font-black mx-auto shadow-xl shadow-indigo-100 animate-in zoom-in">
            {teacher.name[0]}
          </div>
          <h3 className="text-xl font-black text-slate-900">{teacher.name}</h3>
          <p className="text-[11px] text-indigo-500 mt-2 font-black bg-indigo-50 py-1.5 px-4 rounded-full inline-block border border-indigo-100">{school.name}</p>
        </div>

        <nav className="p-6 space-y-2 flex-1 overflow-y-auto">
          {[
            { id: 'plans', icon: <BookOpen size={20} />, label: 'رصد الخطط' },
            { id: 'attendance', icon: <ClipboardCheck size={20} />, label: 'رصد الغياب' },
            { id: 'messages', icon: <MessageSquare size={20} />, label: 'التعاميم' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-black transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
            >
              <div className="flex items-center gap-4">{tab.icon} {tab.label}</div>
              {activeTab === tab.id && <ChevronLeft size={16} className="animate-in slide-in-from-right-2" />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t bg-slate-50/50">
          <button onClick={onLogout} className="flex items-center gap-4 w-full p-4 text-rose-500 font-black hover:bg-rose-100 rounded-2xl transition-all group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center sticky top-0 z-[80]">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><BookOpen size={20} /></div>
              <span className="font-black text-slate-800">بوابة المعلم</span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-slate-50 rounded-xl border text-indigo-600 active:scale-95 transition-all">
              <Menu size={24} />
           </button>
        </header>

        <div className="p-6 md:p-10 lg:p-14 max-w-6xl mx-auto">
          {/* Active Week Banner */}
          <div className={`mb-10 p-6 md:p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${activeWeek ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'bg-rose-50 border-rose-100 shadow-sm animate-pulse'}`}>
             <div className="flex items-center gap-5 text-center md:text-right">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${activeWeek ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>
                  {activeWeek ? <Calendar size={28} /> : <AlertTriangle size={28} />}
                </div>
                <div>
                   <h3 className={`text-xl md:text-2xl font-black ${activeWeek ? 'text-indigo-900' : 'text-rose-900'}`}>
                      {activeWeek ? `أسبوع الرصد الحالي: ${activeWeek.name}` : 'تنبيه: لا يوجد أسبوع نشط'}
                   </h3>
                   <p className="text-xs md:text-sm font-bold opacity-70 mt-1">
                     {activeWeek ? `الفترة: من ${formatToHijri(activeWeek.startDate)} إلى ${formatToHijri(activeWeek.endDate)}` : 'يرجى التواصل مع الإدارة لتفعيل الأسبوع الدراسي الجديد.'}
                   </p>
                </div>
             </div>
             
             {/* Saving Indicator for Plans */}
             {activeTab === 'plans' && activeWeek && (
               <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl border border-indigo-100 shadow-sm min-w-[140px] justify-center">
                 {savingStatus === 'saving' ? (
                   <>
                     <Loader2 size={16} className="animate-spin text-indigo-600" />
                     <span className="text-xs font-black text-indigo-600">جاري الحفظ...</span>
                   </>
                 ) : savingStatus === 'saved' ? (
                   <>
                     <CheckCircle2 size={16} className="text-emerald-500" />
                     <span className="text-xs font-black text-emerald-500">تم الحفظ</span>
                   </>
                 ) : (
                   <>
                     <CloudCheck size={16} className="text-slate-300" />
                     <span className="text-xs font-black text-slate-400">مزامنة سحابية</span>
                   </>
                 )}
               </div>
             )}
          </div>

          {activeTab === 'plans' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-wrap gap-2 overflow-x-auto pb-4 no-scrollbar">
                  {DAYS.map(day => (
                    <button 
                      key={day.id} 
                      onClick={() => setSelectedDay(day)} 
                      className={`px-8 py-3.5 rounded-2xl font-black transition-all whitespace-nowrap text-sm border-2 ${selectedDay.id === day.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100 scale-105' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100'}`}
                    >
                      {day.label}
                    </button>
                  ))}
               </div>

               <div className="space-y-6 md:space-y-8">
                 {todaysSessions.length === 0 ? (
                   <div className="bg-white p-24 text-center rounded-[3.5rem] border-4 border-dashed border-slate-100 text-slate-300 flex flex-col items-center gap-6">
                      <Home size={64} className="opacity-10" />
                      <p className="text-2xl font-black uppercase tracking-widest">يوم راحة - لا توجد حصص مجدولة</p>
                   </div>
                 ) : (
                   todaysSessions.map((session, idx) => {
                     const planKey = `${session.classTitle}_${session.dayId}_${session.period}`;
                     const currentPlan = planData[planKey] || {};
                     const subjectName = subjects.find(s => s.id === session.subjectId)?.name || "مادة تعليمية";
                     
                     return (
                       <div key={idx} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col md:flex-row group">
                          <div className="w-full md:w-44 bg-slate-50/50 border-b md:border-b-0 md:border-l border-slate-100 flex flex-col items-center justify-center p-8 group-hover:bg-indigo-50 transition-colors">
                            <span className="text-[10px] font-black text-slate-400 mb-1 tracking-widest uppercase">الحصة</span>
                            <span className="text-5xl md:text-7xl font-black text-slate-200 group-hover:text-indigo-200 transition-colors">{session.period}</span>
                            <div className="mt-5 px-5 py-2 bg-indigo-600 text-white rounded-2xl text-[11px] font-black shadow-lg shadow-indigo-100">{session.classTitle}</div>
                          </div>
                          <div className="flex-1 p-8 md:p-12 space-y-8">
                            <div className="flex items-center gap-3 text-xl md:text-2xl font-black text-slate-800">
                               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Book size={20} /></div>
                               {subjectName}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                               <div className="space-y-2">
                                  <label className="text-xs font-black text-slate-400 px-2 flex items-center gap-2"><Sparkles size={14} className="text-indigo-400" /> اسم الدرس المقرر</label>
                                  <input 
                                    className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all text-sm" 
                                    value={currentPlan.lesson || ''} 
                                    placeholder="أدخل عنوان الدرس..."
                                    onChange={e => handlePlanChange(session.classTitle, session.dayId, session.period, 'lesson', e.target.value)} 
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-xs font-black text-slate-400 px-2 flex items-center gap-2"><Home size={14} className="text-blue-400" /> الواجب المنزلي</label>
                                  <input 
                                    className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all text-sm" 
                                    value={currentPlan.homework || ''} 
                                    placeholder="رقم الصفحة أو السؤال..."
                                    onChange={e => handlePlanChange(session.classTitle, session.dayId, session.period, 'homework', e.target.value)} 
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-xs font-black text-slate-400 px-2 flex items-center gap-2"><FileText size={14} className="text-emerald-400" /> ملاحظات إضافية</label>
                                  <input 
                                    className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-100 focus:bg-white transition-all text-sm" 
                                    value={currentPlan.enrichment || ''} 
                                    placeholder="اختياري: إثراء أو ملاحظة..."
                                    onChange={e => handlePlanChange(session.classTitle, session.dayId, session.period, 'enrichment', e.target.value)} 
                                  />
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
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900">رصد غياب اليوم</h1>
                    <p className="text-slate-400 font-bold mt-2">اختر الفصل وابدأ بتحديد الطلاب الغائبين لإرسال التقرير للإدارة.</p>
                  </div>
                  <div className="bg-white px-6 py-3 rounded-2xl border font-black text-indigo-600 shadow-sm flex items-center gap-2">
                     <Calendar size={18} /> {formatToHijri(new Date())}
                  </div>
               </header>

               {attendanceStep === 'class-select' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                    {todaysUniqueClasses.length === 0 ? (
                      <div className="col-span-full bg-white p-20 text-center rounded-[3rem] border border-slate-100 text-slate-300 font-black">لا توجد فصول دراسية مجدولة لهذا اليوم لبدء الرصد.</div>
                    ) : (
                      todaysUniqueClasses.map(cls => (
                        <button key={cls as string} onClick={() => startAttendance(cls as string)} className="group bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center gap-6">
                           <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner"><Users size={32} /></div>
                           <h3 className="text-2xl font-black text-slate-800">{cls as string}</h3>
                           <div className="flex items-center gap-2 text-indigo-600 font-black text-sm">
                              بدء الرصد <ChevronLeft size={16} />
                           </div>
                        </button>
                      ))
                    )}
                  </div>
               ) : (
                  <div className="bg-white rounded-[4rem] border border-slate-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
                     <div className="p-8 md:p-12 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-5">
                           <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Users size={32} /></div>
                           <div>
                              <h3 className="text-2xl font-black text-slate-800">{selectedClassForAttendance}</h3>
                              <p className="text-sm font-bold text-slate-400">حدد الطلاب الغائبين من القائمة أدناه</p>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <button onClick={() => setAttendanceStep('class-select')} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black transition-all hover:bg-slate-200">إلغاء</button>
                           <button onClick={submitAttendance} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">إرسال التقرير للإدارة</button>
                        </div>
                     </div>
                     <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classStudents.filter(s => `${s.grade} - فصل ${s.section}` === selectedClassForAttendance).map(student => {
                           const isAbsent = absentStudents.includes(student.name);
                           return (
                             <button 
                               key={student.id} 
                               onClick={() => toggleStudentAttendance(student.name)}
                               className={`p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${isAbsent ? 'bg-rose-50 border-rose-500 shadow-inner' : 'bg-white border-slate-100 hover:border-indigo-100'}`}
                             >
                               <span className={`font-black ${isAbsent ? 'text-rose-700' : 'text-slate-700'}`}>{student.name}</span>
                               {isAbsent ? <UserX size={20} className="text-rose-600" /> : <UserCheck size={20} className="text-slate-200" />}
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
