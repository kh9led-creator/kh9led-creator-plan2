
import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { Printer, Book, LayoutGrid, Users, School as SchoolIcon } from 'lucide-react';
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
      <header className="bg-white border-b px-6 py-4 no-print sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {school.logoUrl ? (
              <img src={school.logoUrl} className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white"><SchoolIcon size={24} /></div>
            )}
            <div className="text-right">
              <h1 className="text-xl font-black text-slate-900">{school.name}</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">بوابة الخطط الأسبوعية</p>
            </div>
          </div>
          
          {selectedClass && (
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedClass("")} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition text-sm">
                <LayoutGrid size={16} /> تغيير الفصل
              </button>
              <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black shadow-lg flex items-center gap-2 hover:bg-black transition text-sm">
                <Printer size={16} /> طباعة الخطة
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {!selectedClass ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center mb-10">
               <h2 className="text-3xl font-black text-slate-800 mb-2">اختر الفصل الدراسي</h2>
               <p className="text-slate-500 font-bold">عرض وتحميل الخطة الأسبوعية المعتمدة</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableClasses.map((cls) => (
                <button key={cls} onClick={() => setSelectedClass(cls)} className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                     <Book size={40} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">{cls}</h3>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500 flex justify-center">
            {/* Optimized A4 Container */}
            <div className="a4-page bg-white shadow-2xl border p-[6mm] relative flex flex-col" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
              
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-0 text-right leading-tight min-w-[150px]">
                  {headerLines.map((line, i) => <p key={i} className={i === 0 ? 'text-[9pt] font-black underline underline-offset-2' : 'text-[8pt] font-bold'}>{line}</p>)}
                </div>
                <div className="flex flex-col items-center">
                  {school.logoUrl ? (
                    <img src={school.logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
                  ) : (
                    <div className="w-14 h-14 bg-slate-100 rounded-xl border-2 border-dashed"></div>
                  )}
                </div>
                <div className="space-y-0 text-left text-[8pt] font-black" dir="ltr">
                  <p className="border-b border-slate-900 pb-0.5">{school.name}</p>
                  <p>Class: {selectedClass}</p>
                  <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                </div>
              </div>

              <div className="text-center mb-2">
                <h2 className="text-[12pt] font-black bg-slate-900 text-white py-1 px-8 inline-block rounded-lg">الخطة الأسبوعية</h2>
                <div className="h-[1.5px] bg-slate-900 w-full mt-1"></div>
              </div>

              {/* Table with specific 6 columns: اليوم | م | المادة | الدرس المقرر | الواجب | الملاحظات */}
              <div className="flex-1 overflow-hidden border-[1.5px] border-slate-900 rounded-sm">
                <table className="w-full border-collapse table-fixed h-full">
                  <thead>
                    <tr className="bg-slate-100 border-b-[1.5px] border-slate-900">
                      <th className="border-l border-slate-900 p-1 text-[8pt] font-black w-8 text-center">اليوم</th>
                      <th className="border-l border-slate-900 p-1 text-[7pt] font-black w-5 text-center">م</th>
                      <th className="border-l border-slate-900 p-1 text-[8pt] font-black w-20 text-center">المادة</th>
                      <th className="border-l border-slate-900 p-1 text-[8pt] font-black w-40 text-center">الدرس المقرر</th>
                      <th className="border-l border-slate-900 p-1 text-[8pt] font-black text-center">الواجب</th>
                      <th className="p-1 text-[8pt] font-black w-32 text-center">الملاحظات</th>
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
                            <tr key={`${day.id}-${period}`} className={`h-7 border-b ${pIdx === PERIODS.length - 1 ? 'border-b-[1.5px] border-slate-900' : 'border-slate-300'}`}>
                              {pIdx === 0 && (
                                <td rowSpan={PERIODS.length} className="border-l border-slate-900 p-0 text-center font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-slate-900 text-[7.5pt] tracking-widest leading-none">
                                  {day.label}
                                </td>
                              )}
                              <td className="border-l border-slate-900 p-0.5 text-center text-[7pt] font-black">{period}</td>
                              <td className="border-l border-slate-900 p-0.5 text-center text-[7.5pt] font-black bg-slate-50/50 truncate px-1">{subject}</td>
                              <td className="border-l border-slate-900 p-0.5 text-center text-[7.5pt] font-bold leading-tight px-1">{plan.lesson || '---'}</td>
                              <td className="border-l border-slate-900 p-0.5 text-center text-[7pt] font-medium leading-tight px-1 overflow-hidden">{plan.homework || '---'}</td>
                              <td className="p-0.5 text-center text-[7pt] font-medium leading-tight px-1 overflow-hidden text-slate-500 italic">{plan.enrichment || '---'}</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Section */}
              <div className="grid grid-cols-2 gap-3 mt-2 h-[30mm]">
                 <div className="border-[1.5px] border-slate-900 p-2 rounded-lg bg-white overflow-hidden">
                   <h3 className="text-[7.5pt] font-black mb-1 border-b border-slate-900 pb-0.5 text-center uppercase">توجيهات عامة</h3>
                   <p className="text-[7pt] font-bold leading-tight whitespace-pre-wrap text-slate-700">{school.generalMessages || "..."}</p>
                 </div>
                 <div className="border-[1.5px] border-slate-900 p-2 rounded-lg bg-white flex flex-col items-center overflow-hidden">
                   <h3 className="text-[7.5pt] font-black mb-1 border-b border-slate-900 pb-0.5 text-center w-full uppercase">نشاط الأسبوع</h3>
                   <div className="flex-1 flex flex-col items-center justify-center w-full">
                     {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="max-h-[12mm] object-contain mb-1" />}
                     <p className="text-[7.5pt] font-black text-center text-blue-800 leading-none">{school.weeklyNotes || "..."}</p>
                   </div>
                 </div>
              </div>
              
              <div className="mt-2 text-center border-t border-slate-100 pt-1 opacity-50">
                 <p className="text-[6.5pt] font-black text-slate-400">تم الإنشاء آلياً عبر نظام الخطط الأسبوعية - {school.name}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .a4-page { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 auto !important; 
            padding: 6mm !important;
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
