
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DAYS, PERIODS, db, formatToHijri } from '../constants.tsx';
import { Printer, Book, LayoutGrid, School as SchoolIcon, ArrowLeft, ArrowRight, GraduationCap, Calendar } from 'lucide-react';
import { School, Subject, AcademicWeek } from '../types.ts';

const PublicPlanView: React.FC = () => {
  const { schoolSlug } = useParams();
  const [school, setSchool] = useState<School | null>(null);
  const [plans, setPlans] = useState<any>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [schedule, setSchedule] = useState<any>({});
  const [activeWeek, setActiveWeek] = useState<AcademicWeek | undefined>(undefined);

  useEffect(() => {
    if (schoolSlug) {
      const s = db.getSchoolBySlug(schoolSlug);
      if (s) {
        setSchool(s);
        const week = db.getActiveWeek(s.id);
        setActiveWeek(week);
        setSubjects(db.getSubjects(s.id));
        
        if (week) {
          setPlans(db.getPlans(s.id, week.id));
        }

        const students = db.getStudents(s.id);
        const classes = Array.from(new Set(students.map(std => `${std.grade} - فصل ${std.section}`)));
        setAvailableClasses(classes);
      }
    }
  }, [schoolSlug]);

  useEffect(() => {
    if (school && selectedClass) {
      setSchedule(db.getSchedule(school.id, selectedClass));
    }
  }, [school, selectedClass]);

  if (!school) return <div className="p-24 text-center font-black animate-pulse text-indigo-400 text-2xl">جاري تهيئة البوابة التعليمية...</div>;

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم").split('\n');

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-['Tajawal'] pb-20 overflow-x-hidden">
      {/* Header */}
      <header className="glass border-b border-slate-100 px-8 py-5 no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
               {school.logoUrl ? (
                <img src={school.logoUrl} className="w-14 h-14 object-contain" alt="school-logo" />
               ) : (
                <SchoolIcon className="text-indigo-600" size={40} />
               )}
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{school.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <p className="text-xs text-indigo-600 font-black uppercase tracking-widest">بوابة الخطط الأسبوعية المحدثة</p>
              </div>
            </div>
          </div>
          
          {selectedClass && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedClass("")} 
                className="bg-white text-slate-600 px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-50 border border-slate-200 transition-all text-sm"
              >
                <ArrowRight size={18} /> تغيير الفصل
              </button>
              <button 
                onClick={() => window.print()} 
                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black shadow-2xl shadow-slate-200 flex items-center gap-2 hover:bg-black transition-all text-sm"
              >
                <Printer size={18} /> طباعة الخطة
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-16 flex flex-col items-center">
        {!selectedClass ? (
          <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="text-center mb-16 space-y-4">
               <h2 className="text-5xl font-black text-slate-900">أهلاً بكم في فصولنا</h2>
               <p className="text-slate-400 font-bold text-xl max-w-xl mx-auto leading-relaxed">
                  {activeWeek ? `عرض خطة ${activeWeek.name} - الفترة من ${formatToHijri(activeWeek.startDate)} إلى ${formatToHijri(activeWeek.endDate)}` : 'يرجى اختيار الفصل الدراسي لعرض وتحميل الخطة الأسبوعية المعتمدة.'}
               </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {availableClasses.map((cls) => (
                <button 
                  key={cls} 
                  onClick={() => setSelectedClass(cls)} 
                  className="group bg-white p-16 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-2 transition-all duration-700 text-center flex flex-col items-center gap-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-600 transition-colors duration-700"></div>
                  <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 relative z-10 shadow-inner">
                     <GraduationCap size={48} />
                  </div>
                  <div className="relative z-10">
                     <h3 className="text-3xl font-black text-slate-800 mb-2">{cls}</h3>
                     <p className="text-slate-400 font-bold flex items-center justify-center gap-2">
                        عرض الخطة <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
                     </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="a4-page bg-white shadow-2xl border p-[8mm] relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-700" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
            
            {/* Header Branding */}
            <div className="grid grid-cols-3 gap-2 mb-2 border-b-2 border-black pb-2">
              <div className="text-right space-y-0 text-[8.5pt] font-black leading-tight">
                {headerLines.map((line, i) => <p key={i}>{line}</p>)}
                <p>{school.name}</p>
              </div>

              <div className="flex flex-col items-center justify-center">
                {school.logoUrl ? (
                  <img src={school.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-300 text-xs">LOGO</div>
                )}
              </div>

              <div className="text-right space-y-0.5 font-bold text-[8pt]">
                <p>الأسبوع: <span className="font-black">{activeWeek?.name || "---"}</span></p>
                <p>الفترة: {activeWeek ? `${formatToHijri(activeWeek.startDate)} إلى ${formatToHijri(activeWeek.endDate)}` : "---"}</p>
                <p>الصف: <span className="font-black underline">{selectedClass}</span></p>
              </div>
            </div>

            {/* باقي محتوى الخطة يظل كما هو ... */}
            <div className="flex-1 overflow-hidden border-2 border-black rounded-sm">
              <table className="w-full border-collapse table-fixed h-full text-center">
                <thead className="border-b-2 border-black font-black bg-slate-50">
                  <tr className="h-8">
                    <th className="border-l-2 border-black w-12 text-[9pt]">اليوم</th>
                    <th className="border-l-2 border-black w-7 text-[8pt]">م</th>
                    <th className="border-l-2 border-black w-24 text-[9pt]">المادة</th>
                    <th className="border-l-2 border-black text-[9pt]">الدرس المقرر</th>
                    <th className="border-l-2 border-black text-[9pt]">الواجب</th>
                    <th className="w-28 text-[8pt]">ملاحظات</th>
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
                          <tr key={`${day.id}-${period}`} className={`h-[18.5px] border-b ${pIdx === PERIODS.length - 1 ? 'border-b-2 border-black' : 'border-slate-200'}`}>
                            {pIdx === 0 && (
                              <td rowSpan={PERIODS.length} className="border-l-2 border-black font-black rotate-180 [writing-mode:vertical-rl] bg-white text-[8.5pt] tracking-widest leading-none border-b-2 border-black">
                                {day.label}
                              </td>
                            )}
                            <td className="border-l-2 border-black text-[7.5pt] font-black">{period}</td>
                            <td className="border-l-2 border-black text-[8pt] font-black px-1">{subject}</td>
                            <td className="border-l-2 border-black text-[7.5pt] px-1 truncate leading-tight font-medium">{plan.lesson || '-'}</td>
                            <td className="border-l-2 border-black text-[7.5pt] px-1 truncate leading-tight font-medium">{plan.homework || '-'}</td>
                            <td className="text-[7pt] px-1 text-slate-400 italic leading-tight truncate">{plan.enrichment || '-'}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3 h-[42mm]">
               <div className="border-2 border-black p-3 bg-white flex flex-col">
                  <h3 className="text-[9pt] font-black border-b border-black pb-1 mb-2 text-center bg-slate-50">توجيهات لولي الأمر</h3>
                  <div className="text-[8pt] font-bold leading-relaxed text-slate-700 whitespace-pre-wrap overflow-hidden">
                    {school.generalMessages || "١. متابعة منصة مدرستي يومياً\n٢. الاهتمام بحل الواجبات\n٣. إحضار الأدوات المدرسية"}
                  </div>
               </div>
               <div className="border-2 border-black p-3 bg-white flex flex-col">
                  <h3 className="text-[9pt] font-black border-b border-black pb-1 mb-2 text-center bg-slate-50">نشاط الأسبوع</h3>
                  <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                    {school.weeklyNotesImage && (
                       <img src={school.weeklyNotesImage} className="max-h-[15mm] w-full object-contain mb-1" />
                    )}
                    <div className="text-[8.5pt] font-black text-indigo-700 text-center leading-tight">
                       {school.weeklyNotes || "مدرستنا بيئة آمنة للتعلم"}
                    </div>
                  </div>
               </div>
            </div>

            <p className="mt-2 text-[6.5pt] text-center text-slate-400 font-black border-t border-slate-100 pt-1 italic no-print">
               بوابة الخطط الأسبوعية الموحدة - {school.name} - {new Date().getFullYear()}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicPlanView;
