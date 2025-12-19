
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { Printer, Book, LayoutGrid, School as SchoolIcon, ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import { School, Subject } from '../types.ts';

const PublicPlanView: React.FC = () => {
  const { schoolSlug } = useParams();
  const [school, setSchool] = useState<School | null>(null);
  const [plans, setPlans] = useState<any>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [schedule, setSchedule] = useState<any>({});

  useEffect(() => {
    if (schoolSlug) {
      const s = db.getSchoolBySlug(schoolSlug);
      if (s) {
        setSchool(s);
        setPlans(db.getPlans(s.id));
        setSubjects(db.getSubjects(s.id));
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
      {/* Dynamic Header */}
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
               <p className="text-slate-400 font-bold text-xl max-w-xl mx-auto leading-relaxed">يرجى اختيار الفصل الدراسي لعرض وتحميل الخطة الأسبوعية المعتمدة.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {availableClasses.length === 0 ? (
                <div className="col-span-full py-32 text-center">
                   <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <Book size={48} />
                   </div>
                   <p className="text-slate-400 font-black text-2xl">لا توجد خطط منشورة حالياً لهذه المدرسة</p>
                </div>
              ) : (
                availableClasses.map((cls) => (
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
                ))
              )}
            </div>
          </div>
        ) : (
          /* A4 Report Simulation */
          <div className="a4-page bg-white shadow-2xl border p-[10mm] relative flex flex-col text-[10pt] overflow-hidden animate-in zoom-in-95 duration-700" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
            
            {/* Header Branding */}
            <div className="grid grid-cols-3 gap-2 mb-4 border-b-2 border-black pb-4">
              <div className="text-right space-y-0.5 font-black text-[9pt] leading-tight">
                {headerLines.map((line, i) => <p key={i}>{line}</p>)}
                <p>{school.name}</p>
              </div>

              <div className="flex flex-col items-center justify-center">
                {school.logoUrl ? (
                  <img src={school.logoUrl} alt="Logo" className="w-24 h-24 object-contain" />
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-300">LOGO</div>
                )}
              </div>

              <div className="text-right space-y-0.5 font-bold text-[8.5pt]">
                <p>الأسبوع: الأسبوع الأول</p>
                <p>الصف: <span className="font-black underline">{selectedClass}</span></p>
                <p>العام الدراسي: ١٤٤٥ هـ</p>
                <p>الفصل الدراسي: الأول</p>
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-hidden border-2 border-black rounded-sm">
              <table className="w-full border-collapse table-fixed h-full text-center">
                <thead className="border-b-2 border-black font-black bg-slate-50">
                  <tr className="h-10">
                    <th className="border-l-2 border-black w-14 text-[9.5pt]">اليوم</th>
                    <th className="border-l-2 border-black w-8 text-[8.5pt]">م</th>
                    <th className="border-l-2 border-black w-28 text-[9.5pt]">المادة</th>
                    <th className="border-l-2 border-black text-[9.5pt]">الدرس المقرر</th>
                    <th className="border-l-2 border-black text-[9.5pt]">الواجب</th>
                    <th className="w-32 text-[9.5pt]">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <React.Fragment key={day.id}>
                      {PERIODS.map((period, pIdx) => {
                        const sched = schedule[`${day.id}_${period}`] || {};
                        const plan = plans[`${selectedClass}_${day.id}_${period}`] || {};
                        const subject = subjects.find(s => s.id === sched.subjectId)?.name || '-';
                        
                        return (
                          <tr key={`${day.id}-${period}`} className={`h-[22px] border-b ${pIdx === PERIODS.length - 1 ? 'border-b-2 border-black' : 'border-slate-300'}`}>
                            {pIdx === 0 && (
                              <td rowSpan={PERIODS.length} className="border-l-2 border-black font-black rotate-180 [writing-mode:vertical-rl] bg-white text-[9.5pt] tracking-widest leading-none border-b-2 border-black">
                                {day.label}
                              </td>
                            )}
                            <td className="border-l-2 border-black text-[8pt] font-black">{period}</td>
                            <td className="border-l-2 border-black text-[9pt] font-bold px-1">{subject}</td>
                            <td className="border-l-2 border-black text-[8.5pt] px-1 truncate leading-tight">{plan.lesson || '-'}</td>
                            <td className="border-l-2 border-black text-[8.5pt] px-1 truncate leading-tight">{plan.homework || '-'}</td>
                            <td className="text-[7.5pt] px-1 text-slate-400 italic leading-tight truncate">{plan.enrichment || '-'}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer boxes */}
            <div className="grid grid-cols-2 gap-5 mt-5 h-[48mm]">
               <div className="border-2 border-black p-4 bg-white flex flex-col">
                  <h3 className="text-[10pt] font-black border-b border-black pb-2 mb-3 text-center bg-slate-50">توجيهات لولي الأمر</h3>
                  <div className="text-[9pt] font-bold leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {school.generalMessages || "١. متابعة منصة مدرستي يومياً\n٢. الاهتمام بحل الواجبات\n٣. إحضار الأدوات المدرسية"}
                  </div>
               </div>
               <div className="border-2 border-black p-4 bg-white flex flex-col">
                  <h3 className="text-[10pt] font-black border-b border-black pb-2 mb-3 text-center bg-slate-50">نشاط الأسبوع</h3>
                  <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                    {school.weeklyNotesImage && (
                       <img src={school.weeklyNotesImage} className="max-h-[22mm] w-full object-contain mb-2 opacity-80" />
                    )}
                    <div className="text-[9.5pt] font-black text-indigo-700 text-center leading-tight">
                       {school.weeklyNotes || "مدرستنا بيئة آمنة للتعلم"}
                    </div>
                  </div>
               </div>
            </div>

            <p className="mt-4 text-[7.5pt] text-center text-slate-400 font-black border-t border-slate-100 pt-2 italic no-print">
               بوابة الخطط الأسبوعية الموحدة - {school.name} - حقوق الطبع محفوظة © {new Date().getFullYear()}
            </p>
          </div>
        )}
      </main>

      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; overflow: hidden; }
          .a4-page { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 auto !important; 
            padding: 10mm !important;
            width: 210mm !important;
            height: 297mm !important;
            page-break-after: always;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact;
          }
          table { border-collapse: collapse !important; border: 2px solid black !important; }
          .border-black { border-color: black !important; }
          .border-l-2 { border-left-width: 2px !important; }
          .border-b-2 { border-bottom-width: 2px !important; }
        }
      `}</style>
    </div>
  );
};

export default PublicPlanView;
