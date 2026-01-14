
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DAYS, PERIODS, db, formatToHijri } from '../constants.tsx';
import { Printer, Backpack, ChevronRight, Calculator, BookOpen, Microscope, GraduationCap } from 'lucide-react';
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
    const loadSchoolData = async () => {
      if (schoolSlug) {
        const s = await db.getSchoolBySlug(schoolSlug);
        if (s) {
          setSchool(s);
          const week = await db.getActiveWeek(s.id);
          setActiveWeek(week);
          setSubjects(await db.getSubjects(s.id));
          if (week) setPlans(await db.getPlans(s.id, week.id));
          const classesData = await db.getClasses(s.id);
          setAvailableClasses(classesData.map(c => `${c.grade} - فصل ${c.section}`));
        }
      }
    };
    loadSchoolData();
  }, [schoolSlug]);

  useEffect(() => {
    const loadSchedule = async () => {
      if (school && selectedClass) {
        setSchedule(await db.getSchedule(school.id, selectedClass));
      }
    };
    loadSchedule();
  }, [school, selectedClass]);

  if (!school) return <div className="p-24 text-center font-black animate-pulse text-indigo-400 text-2xl">جاري تحميل البوابة...</div>;

  const headerLines = (school.headerContent || "").split('\n');

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-['Tajawal'] pb-10 overflow-x-hidden">
      <header className="bg-white border-b px-8 py-3 no-print sticky top-0 z-50 shadow-sm flex justify-between items-center">
        <div className="text-right">
          <h1 className="text-lg font-black text-slate-900">{school.name}</h1>
          <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">بوابة الخطط الأسبوعية</p>
        </div>
        <div className="flex gap-2">
          {selectedClass && <button onClick={() => setSelectedClass("")} className="bg-slate-100 px-4 py-2 rounded-xl font-black text-xs">تغيير الفصل</button>}
          <button onClick={() => window.print()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black shadow-lg flex items-center gap-2 hover:bg-indigo-700 text-xs transition-all">
            <Printer size={14} /> طباعة الخطة
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 flex flex-col items-center">
        {!selectedClass ? (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {availableClasses.map((cls) => (
              <button key={cls} onClick={() => setSelectedClass(cls)} className="bg-white p-8 rounded-[2.5rem] border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Backpack size={32} /></div>
                <h3 className="text-xl font-black text-slate-800">{cls}</h3>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
            ))}
          </div>
        ) : (
          <div className="w-full flex justify-center py-4">
             <div className="print-area bg-white p-[8mm] relative flex flex-col print:p-0 print:border-none print:shadow-none" style={{ width: '210mm', minHeight: '290mm', boxSizing: 'border-box' }}>
                
                {/* ترويسة الطباعة الرسمية */}
                <div className="grid grid-cols-3 gap-2 mb-4 border-b-2 border-black pb-2 items-center">
                  <div className="text-right space-y-0.5 font-black text-[8pt] leading-tight">
                    {headerLines.map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    {school.logoUrl && <img src={school.logoUrl} className="w-20 h-20 object-contain" alt="Logo" />}
                    <div className="mt-1 bg-black text-white px-4 py-0.5 rounded-full"><span className="text-[7pt] font-black uppercase">الخطة الأسبوعية</span></div>
                  </div>
                  <div className="text-left space-y-1 text-[9pt] font-bold">
                    <p>الأسبوع: <span className="font-black">{activeWeek?.name || "---"}</span></p>
                    <p>الصف: <span className="font-black">{selectedClass}</span></p>
                    <p className="text-[7pt]">تاريخ: {activeWeek ? formatToHijri(activeWeek.startDate) : '--'}</p>
                  </div>
                </div>

                {/* جدول الخطة المضغوط لملائمة صفحة واحدة */}
                <div className="flex-1 border-[1.5pt] border-black rounded-sm overflow-hidden mb-4">
                  <table className="w-full border-collapse h-full text-center table-fixed">
                    <thead className="bg-slate-50 border-b-[1.5pt] border-black font-black text-[9pt]">
                      <tr className="h-8">
                        <th className="border-l-[1.2pt] border-black w-12">اليوم</th>
                        <th className="border-l-[1.2pt] border-black w-8 text-[7pt]">ح</th>
                        <th className="border-l-[1.2pt] border-black w-24">المادة</th>
                        <th className="border-l-[1.2pt] border-black">الدرس المقرر</th>
                        <th className="border-l-[1.2pt] border-black">الواجب</th>
                        <th className="w-20 text-[7pt]">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="text-[8pt]">
                      {DAYS.map((day) => (
                        <React.Fragment key={day.id}>
                          {PERIODS.map((period, pIdx) => {
                            const sched = schedule[`${day.id}_${period}`] || {};
                            const planKey = `${selectedClass}_${day.id}_${period}`;
                            const plan = plans[planKey] || {};
                            const subject = subjects.find(s => s.id === sched.subjectId)?.name || '-';
                            return (
                              <tr key={`${day.id}-${period}`} className={`h-[18.5px] border-b ${pIdx === 6 ? 'border-b-[1.5pt] border-black' : 'border-slate-300'}`}>
                                {pIdx === 0 && (
                                  <td rowSpan={7} className="border-l-[1.5pt] border-black font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-[10pt] tracking-widest leading-none border-b-[1.5pt] border-black">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l-[0.8pt] border-slate-300 font-bold">{period}</td>
                                <td className="border-l-[0.8pt] border-slate-300 font-black truncate px-1">{subject}</td>
                                <td className="border-l-[0.8pt] border-slate-300 leading-tight px-1 truncate text-slate-700">{plan.lesson || '-'}</td>
                                <td className="border-l-[0.8pt] border-slate-300 leading-tight px-1 truncate font-bold">{plan.homework || '-'}</td>
                                <td className="text-[7pt] text-slate-400 truncate px-1">{plan.enrichment || '-'}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* تذييل الصفحة */}
                <div className="grid grid-cols-2 gap-4 h-[35mm]">
                   <div className="border-[1.2pt] border-black p-3 bg-white rounded-md">
                      <h3 className="text-[9pt] font-black mb-1 border-b border-black pb-0.5 bg-slate-50 text-center">توجيهات ولي الأمر</h3>
                      <p className="text-[8.5pt] font-bold leading-tight whitespace-pre-wrap h-[20mm] overflow-hidden">{school.generalMessages || "..."}</p>
                   </div>
                   <div className="border-[1.2pt] border-black p-3 bg-white rounded-md flex flex-col items-center justify-center text-center">
                      <h3 className="text-[9pt] font-black mb-1 border-b border-black w-full pb-0.5 bg-slate-50">القيمة التربوية</h3>
                      <div className="flex-1 flex flex-col justify-center gap-1">
                        {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="h-10 object-contain mx-auto" />}
                        <p className="text-[10pt] font-black leading-tight">{school.weeklyNotes || "التميز هدفنا"}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicPlanView;
