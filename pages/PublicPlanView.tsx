
import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { Printer, Book, LayoutGrid, Users, GraduationCap, ChevronLeft, ArrowRight } from 'lucide-react';
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

  if (!school) return <div className="p-24 text-center font-black animate-pulse text-slate-400 text-2xl">جاري تحميل البوابة التعليمية...</div>;

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم").split('\n');

  return (
    <div className="bg-slate-50 min-h-screen font-['Tajawal'] pb-20">
      {/* Header for Public View */}
      <header className="bg-white border-b px-6 py-6 no-print sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            {school.logoUrl ? (
              <img src={school.logoUrl} className="w-16 h-16 object-contain bg-white p-2 rounded-2xl shadow-sm border border-slate-100" />
            ) : (
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100"><GraduationCap size={32} /></div>
            )}
            <div className="text-right">
              <h1 className="text-2xl font-black text-slate-900">{school.name}</h1>
              <p className="text-sm text-blue-600 font-bold tracking-tight">بوابة الخطط الأسبوعية الموحدة</p>
            </div>
          </div>
          
          {selectedClass && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedClass("")}
                className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-200 transition"
              >
                <LayoutGrid size={18} />
                تغيير الفصل
              </button>
              <button 
                onClick={() => window.print()} 
                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-slate-200 flex items-center gap-2 hover:bg-black transition active:scale-95"
              >
                <Printer size={18} /> طباعة الجدول
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        {!selectedClass ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-black text-slate-800 mb-3">اختر الفصل الدراسي</h2>
               <p className="text-slate-500 font-bold">يرجى النقر على أيقونة الفصل لعرض الخطة الأسبوعية المحدثة.</p>
            </div>

            {availableClasses.length === 0 ? (
              <div className="bg-white p-20 rounded-[3rem] text-center border-4 border-dashed border-slate-200">
                 <Users size={64} className="mx-auto text-slate-200 mb-4" />
                 <p className="font-black text-slate-300 text-xl">لا توجد فصول دراسية مسجلة حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {availableClasses.map((cls, idx) => (
                  <button 
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className="group bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 hover:-translate-y-2 transition-all duration-500 text-right flex flex-col items-center justify-center gap-4 relative overflow-hidden"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -z-0 group-hover:bg-blue-600 transition-colors duration-500"></div>
                    <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-[2rem] flex items-center justify-center mb-2 group-hover:bg-white group-hover:scale-110 transition-all duration-500 shadow-inner relative z-10">
                       <Book size={44} />
                    </div>
                    <div className="relative z-10 text-center">
                      <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-700 transition-colors">{cls}</h3>
                      <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">عرض الخطة المدرسية</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            {/* Printable A4 Page */}
            <div className="a4-page mx-auto bg-white shadow-2xl border p-[8mm] relative flex flex-col text-[10pt] min-h-[297mm]" style={{ width: '210mm' }}>
              
              {/* Header Branding */}
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-0.5 font-black text-slate-900 text-right leading-tight min-w-[180px]">
                  {headerLines.map((line, i) => <p key={i} className={i === 0 ? 'text-[10pt] mb-1 underline underline-offset-4 font-black' : 'text-[8pt]'}>{line}</p>)}
                </div>
                <div className="flex flex-col items-center">
                  {school.logoUrl ? (
                    <img src={school.logoUrl} alt="Logo" className="w-20 h-20 object-contain" />
                  ) : (
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 border-2 border-dashed"><Book size={32} /></div>
                  )}
                </div>
                <div className="space-y-1 font-black text-left text-slate-900 text-[8pt]" dir="ltr">
                  <p className="font-black text-[9pt] border-b border-slate-900 pb-0.5 mb-1">{school.name}</p>
                  <p>Class: {selectedClass}</p>
                  <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="text-xl font-black bg-slate-900 text-white py-2 px-12 inline-block rounded-xl shadow-lg">الخطة الأسبوعية</h2>
                <div className="h-0.5 bg-slate-900 w-full mt-2"></div>
              </div>

              {/* Weekly Schedule Table - Corrected Columns as requested */}
              <div className="flex-1 overflow-hidden border-2 border-slate-900 rounded-sm mb-4">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-900">
                      <th className="border-l-2 border-slate-900 p-2 text-[10pt] font-black w-12 text-center">اليوم</th>
                      <th className="border-l-2 border-slate-900 p-2 text-[9pt] font-black w-8 text-center">م</th>
                      <th className="border-l-2 border-slate-900 p-2 text-[10pt] font-black w-28 text-center">المادة</th>
                      <th className="border-l-2 border-slate-900 p-2 text-[10pt] font-black text-center">الدرس المقرر</th>
                      <th className="p-2 text-[10pt] font-black w-56 text-center">الواجب والملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day) => (
                      <React.Fragment key={day.id}>
                        {PERIODS.map((period, pIdx) => {
                          const sched = schedule[`${day.id}_${period}`] || {};
                          const plan = plans[`${selectedClass}_${day.id}_${period}`] || {};
                          const subject = subjects.find(s => s.id === sched.subjectId)?.name || '---';
                          
                          return (
                            <tr key={`${day.id}-${period}`} className={`h-9 border-b ${pIdx === PERIODS.length - 1 ? 'border-b-2 border-slate-900' : 'border-slate-300'}`}>
                              {pIdx === 0 && (
                                <td rowSpan={PERIODS.length} className="border-l-2 border-slate-900 p-0 text-center font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-slate-900 text-[9pt] tracking-widest">
                                  {day.label}
                                </td>
                              )}
                              <td className="border-l-2 border-slate-900 p-1 text-center text-[9pt] font-black">{period}</td>
                              <td className="border-l-2 border-slate-900 p-1 text-center text-[9pt] font-black bg-slate-50/50 truncate px-2">{subject}</td>
                              <td className="border-l-2 border-slate-900 p-1 text-center text-[9pt] font-bold leading-tight px-2">{plan.lesson || '---'}</td>
                              <td className="p-1 text-center text-[8pt] font-medium leading-tight overflow-hidden px-2">
                                 {plan.homework && <span className="text-slate-900 font-black">{plan.homework} </span>}
                                 {plan.enrichment && <span className="text-slate-500 italic block mt-0.5 border-t border-slate-100 pt-0.5">{plan.enrichment}</span>}
                                 {!plan.homework && !plan.enrichment && '---'}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Branding Section */}
              <div className="grid grid-cols-2 gap-6 mt-auto">
                 <div className="border-2 border-slate-900 p-4 rounded-2xl bg-white min-h-[35mm] max-h-[40mm] overflow-hidden shadow-sm">
                   <h3 className="text-[9pt] font-black mb-2 border-b border-slate-900 pb-1 text-center uppercase tracking-tighter">توجيهات عامة</h3>
                   <p className="text-[8.5pt] font-bold leading-tight whitespace-pre-wrap text-slate-700">{school.generalMessages || "..."}</p>
                 </div>
                 <div className="border-2 border-slate-900 p-4 rounded-2xl bg-white min-h-[35mm] max-h-[40mm] flex flex-col items-center overflow-hidden shadow-sm">
                   <h3 className="text-[9pt] font-black mb-2 border-b border-slate-900 pb-1 text-center w-full uppercase tracking-tighter">نشاط الأسبوع</h3>
                   <div className="flex-1 flex flex-col items-center justify-center w-full">
                     {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="max-h-[18mm] object-contain mb-2" />}
                     <p className="text-[9pt] font-black text-center text-blue-800 leading-none">{school.weeklyNotes || "..."}</p>
                   </div>
                 </div>
              </div>
              
              <div className="mt-6 text-center border-t border-slate-100 pt-3 opacity-50">
                 <p className="text-[7.5pt] font-black text-slate-400 italic">تم إنشاء الخطة الأسبوعية آلياً عبر منصة مدرستي للخدمات التعليمية - حقوق الطبع محفوظة {school.name}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
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
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicPlanView;
