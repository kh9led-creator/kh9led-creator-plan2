
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DAYS, PERIODS, db, formatToHijri } from '../constants.tsx';
import { 
  Printer, School as SchoolIcon, ArrowRight, GraduationCap,
  Backpack, Compass, Calculator, Library, 
  NotebookPen, Shapes, Telescope, BookOpen, Microscope,
  CalendarDays, ChevronRight
} from 'lucide-react';
import { School, Subject, AcademicWeek } from '../types.ts';

const CLASS_ICONS = [
  Backpack, Compass, Calculator, Library, 
  NotebookPen, Shapes, Telescope, GraduationCap, 
  SchoolIcon, BookOpen, Microscope
];

const PublicPlanView: React.FC = () => {
  const { schoolSlug } = useParams();
  const [school, setSchool] = useState<School | null>(null);
  const [plans, setPlans] = useState<any>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [schedule, setSchedule] = useState<any>({});
  const [activeWeek, setActiveWeek] = useState<AcademicWeek | undefined>(undefined);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (schoolSlug) {
      const s = db.getSchoolBySlug(schoolSlug);
      if (s) {
        setSchool(s);
        const week = db.getActiveWeek(s.id);
        setActiveWeek(week);
        setSubjects(db.getSubjects(s.id));
        if (week) setPlans(db.getPlans(s.id, week.id));
        const students = db.getStudents(s.id);
        const classes = Array.from(new Set(students.map(std => `${std.grade} - فصل ${std.section}`)));
        setAvailableClasses(classes);
      }
    }

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScale((width - 40) / 794); // 794px is 210mm in pixels approx
      else if (width < 1024) setScale((width - 80) / 794);
      else setScale(1);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [schoolSlug]);

  useEffect(() => {
    if (school && selectedClass) setSchedule(db.getSchedule(school.id, selectedClass));
  }, [school, selectedClass]);

  const getClassIcon = (classTitle: string) => {
    let hash = 0;
    for (let i = 0; i < classTitle.length; i++) {
      hash = classTitle.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % CLASS_ICONS.length;
    return CLASS_ICONS[index];
  };

  if (!school) return <div className="p-24 text-center font-black animate-pulse text-indigo-400 text-2xl">جاري تهيئة البوابة التعليمية...</div>;

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم").split('\n');

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-['Tajawal'] pb-10 overflow-x-hidden">
      <header className="glass border-b border-slate-100 px-4 md:px-8 py-3 no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm border hidden sm:block">
               {school.logoUrl ? <img src={school.logoUrl} className="w-10 h-10 object-contain" alt="شعار" /> : <SchoolIcon className="text-indigo-600" size={24} />}
            </div>
            <div className="text-right">
              <h1 className="text-sm sm:text-lg font-black text-slate-900 truncate max-w-[150px] sm:max-w-none">{school.name}</h1>
              <p className="text-[9px] sm:text-[10px] text-indigo-600 font-black uppercase tracking-widest">بوابة الخطط الأسبوعية</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedClass && (
              <button onClick={() => setSelectedClass("")} className="bg-white text-slate-600 p-2 sm:px-4 sm:py-2 rounded-xl font-black flex items-center gap-2 hover:bg-slate-50 border text-[10px] sm:text-xs transition-all">
                <ArrowRight size={14} className="hidden sm:block" /> تغيير الفصل
              </button>
            )}
            <button onClick={() => window.print()} className="bg-slate-900 text-white p-2 sm:px-6 sm:py-2 rounded-xl font-black shadow-xl flex items-center gap-2 hover:bg-black text-[10px] sm:text-xs">
              <Printer size={14} /> <span className="hidden sm:block">طباعة الخطة</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 flex flex-col items-center">
        {!selectedClass ? (
          <div className="w-full animate-in fade-in slide-in-from-bottom-5">
            <div className="text-center mb-10 space-y-2 mt-10">
               <h2 className="text-2xl sm:text-3xl font-black text-slate-900">أهلاً بكم في فصولنا</h2>
               <p className="text-slate-400 font-bold text-sm">يرجى اختيار الفصل الدراسي لعرض الخطة المعتمدة</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {availableClasses.map((cls) => {
                const ClassIcon = getClassIcon(cls);
                return (
                  <button key={cls} onClick={() => setSelectedClass(cls)} className="group bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center flex flex-col items-center gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                       <ClassIcon size={24} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-800">{cls}</h3>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center py-4 sm:py-10">
            <div className="origin-top transition-transform duration-500" style={{ transform: `scale(${scale})` }}>
               <div className="a4-page bg-white shadow-2xl border p-[8mm] relative flex flex-col overflow-hidden" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
                
                {school.logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] z-0 overflow-hidden">
                    <img src={school.logoUrl} className="w-[500px] h-[500px] object-contain grayscale" alt="علامة مائية" />
                  </div>
                )}

                <div className="relative z-10 grid grid-cols-3 gap-2 mb-2.5 border-b-2 border-slate-900 pb-2 items-center">
                  <div className="text-right space-y-0.5 font-black text-[7pt] leading-tight text-slate-800">
                    {headerLines.map((line, i) => <p key={i}>{line}</p>)}
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    {school.logoUrl ? <img src={school.logoUrl} className="w-14 h-14 object-contain" alt="شعار" /> : <div className="w-12 h-12 border border-dashed rounded-lg flex items-center justify-center text-[6pt] text-slate-300 font-black uppercase tracking-widest">Logo</div>}
                    <div className="mt-1 bg-slate-900 text-white px-3 py-0.5 rounded-full">
                      <span className="text-[6.5pt] font-black uppercase">الخطة الدراسية الأسبوعية</span>
                    </div>
                  </div>

                  <div className="text-left space-y-0.5 font-bold text-[8.5pt] text-slate-900">
                    <p className="flex items-center justify-end gap-1">
                        الأسبوع: <span className="font-black">{activeWeek?.name || "---"}</span>
                        <span className="text-[7pt] text-slate-500 font-bold mr-1">({activeWeek ? formatToHijri(activeWeek.startDate) : '--'})</span>
                    </p>
                    <p className="flex items-center justify-end gap-1">
                        {React.createElement(getClassIcon(selectedClass), { size: 10, className: "text-slate-500" })} 
                        الصف: <span className="font-black">{selectedClass}</span>
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex-1 overflow-hidden border-[2px] border-slate-900 rounded-sm mb-3">
                  <table className="w-full border-collapse table-fixed h-full text-center">
                    <thead className="bg-slate-50 border-b-[2px] border-slate-900 font-black">
                      <tr className="h-8">
                        <th className="border-l-[1.5px] border-slate-900 w-12 text-[8.5pt] bg-slate-100">اليوم</th>
                        <th className="border-l-[1.5px] border-slate-900 w-7 text-[7.5pt]">م</th>
                        <th className="border-l-[1.5px] border-slate-900 w-24 text-[8.5pt]">المادة</th>
                        <th className="border-l-[1.5px] border-slate-900 text-[8.5pt]">الدرس المقرر</th>
                        <th className="border-l-[1.5px] border-slate-900 text-[8.5pt]">الواجب المنزلي</th>
                        <th className="w-24 text-[7.5pt] bg-slate-50">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((day) => (
                        <React.Fragment key={day.id}>
                          {PERIODS.map((period, pIdx) => {
                            const sched = schedule[`${day.id}_${period}`] || {};
                            const planKey = `${selectedClass}_${day.id}_${period}`;
                            const plan = plans[planKey] || {};
                            const subject = subjects.find(s => s.id === sched.subjectId)?.name || '-';
                            return (
                              <tr key={`${day.id}-${period}`} className={`h-[18px] border-b ${pIdx === 6 ? 'border-b-[2px] border-slate-900' : 'border-slate-200'}`}>
                                {pIdx === 0 && (
                                  <td rowSpan={7} className="border-l-[1.5px] border-slate-900 font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-[9.5pt] tracking-[0.1em] border-b-[2px] border-slate-900 leading-none">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l-[1px] border-slate-300 text-[8.5pt] font-black bg-slate-50/20">{period}</td>
                                <td className="border-l-[1px] border-slate-300 text-[8.5pt] font-black truncate px-1">{subject}</td>
                                <td className="border-l-[1px] border-slate-300 text-[8pt] leading-tight px-1.5 truncate font-bold text-slate-700 italic">{plan.lesson || '-'}</td>
                                <td className="border-l-[1px] border-slate-300 text-[8pt] leading-tight px-1.5 truncate font-bold text-slate-800">{plan.homework || '-'}</td>
                                <td className="text-[7pt] px-1 text-slate-400 font-black truncate italic leading-none">{plan.enrichment || '-'}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-4 h-[38mm]">
                   <div className="border-[1.5px] border-slate-900 p-3 bg-white rounded-lg shadow-sm">
                      <h3 className="text-[9.5pt] font-black mb-2 border-b border-slate-900 pb-1 text-center bg-slate-50 rounded-md">توجيهات ولي الأمر</h3>
                      <p className="text-[8.5pt] font-bold leading-relaxed text-slate-700 whitespace-pre-wrap pr-1 overflow-hidden">
                        {school.generalMessages || "١. المتابعة المستمرة لمنصة مدرستي.\n٢. الالتزام بالحضور الصباحي.\n٣. إحضار الكتب المدرسية يومياً."}
                      </p>
                   </div>
                   <div className="border-[1.5px] border-slate-900 p-3 bg-white rounded-lg shadow-sm">
                      <h3 className="text-[9.5pt] font-black mb-2 border-b border-slate-900 pb-1 text-center bg-slate-50 rounded-md">القيمة التربوية</h3>
                      <div className="flex flex-col items-center justify-center flex-1 pt-1">
                        {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="max-h-[14mm] object-contain mb-1" alt="قيمة" />}
                        <p className="text-[9.5pt] font-black text-center text-slate-800 leading-snug px-2">
                          {school.weeklyNotes || "البيئة المدرسية الآمنة هي منطلق الإبداع والتميز"}
                        </p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedClass && <div className="h-[550px] sm:hidden no-print"></div>}
    </div>
  );
};

export default PublicPlanView;
