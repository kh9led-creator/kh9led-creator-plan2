
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DAYS, PERIODS, db, formatToHijri } from '../constants.tsx';
import { Printer } from 'lucide-react';
import { School, Subject, Student, AcademicWeek } from '../types.ts';

const BulkStudentPlans: React.FC = () => {
  const { schoolSlug } = useParams();
  const [searchParams] = useSearchParams();
  const filterClass = searchParams.get('class');

  const [school, setSchool] = useState<School | null>(null);
  const [allPlans, setAllPlans] = useState<any>({});
  const [allSchedules, setAllSchedules] = useState<any>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentsToPrint, setStudentsToPrint] = useState<Student[]>([]);
  const [activeWeek, setActiveWeek] = useState<AcademicWeek | undefined>(undefined);

  useEffect(() => {
    const loadData = async () => {
      if (schoolSlug) {
        const s = await db.getSchoolBySlug(schoolSlug);
        if (s) {
          setSchool(s);
          const week = await db.getActiveWeek(s.id);
          setActiveWeek(week);
          if (week) setAllPlans(await db.getPlans(s.id, week.id));
          setSubjects(await db.getSubjects(s.id));
          let students = await db.getStudents(s.id);
          if (filterClass) students = students.filter(st => `${st.grade} - فصل ${st.section}` === filterClass);
          setStudentsToPrint(students);
          
          const classes = Array.from(new Set(students.map(st => `${st.grade} - فصل ${st.section}`)));
          const schedules: any = {};
          for (const cls of classes) schedules[cls] = await db.getSchedule(s.id, cls);
          setAllSchedules(schedules);
        }
      }
    };
    loadData();
  }, [schoolSlug, filterClass]);

  if (!school) return null;

  const headerLines = (school.headerContent || "").split('\n');

  return (
    <div className="bg-slate-100 min-h-screen font-['Tajawal'] pb-20 print:bg-white print:pb-0">
      <div className="max-w-[1100px] mx-auto p-6 no-print flex justify-between items-center bg-white border-b mb-10 sticky top-0 z-50">
        <h1 className="text-xl font-black">محرك الطباعة الجماعي الذكي (A4)</h1>
        <button onClick={() => window.print()} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black shadow-lg">بدء الطباعة الآن</button>
      </div>

      <div className="flex flex-col items-center gap-10 print:gap-0">
        {studentsToPrint.map((student) => {
          const classTitle = `${student.grade} - فصل ${student.section}`;
          const schedule = allSchedules[classTitle] || {};

          return (
            <div key={student.id} className="bg-white p-[8mm] shadow-2xl print:shadow-none print:m-0 print:border-none break-after-page" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
               <div className="grid grid-cols-3 gap-2 mb-3 border-b-2 border-black pb-2 items-center">
                  <div className="text-right space-y-0.5 font-black text-[7.5pt] leading-tight">
                    {headerLines.map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    {school.logoUrl && <img src={school.logoUrl} className="w-16 h-16 object-contain" alt="Logo" />}
                    <div className="mt-1 bg-black text-white px-4 py-0.5 rounded-full"><span className="text-[6.5pt] font-black uppercase">الخطة الأسبوعية</span></div>
                  </div>
                  <div className="space-y-1 text-left">
                    <div className="border border-black p-1 text-center bg-slate-50">
                       <p className="text-[6pt] font-black opacity-60">اسم الطالب</p>
                       <h4 className="text-[9.5pt] font-black truncate">{student.name}</h4>
                    </div>
                    <div className="text-[8pt] font-bold space-y-0.5">
                       <p>الأسبوع: {activeWeek?.name}</p>
                       <p>الصف: {classTitle}</p>
                    </div>
                  </div>
               </div>

               <div className="flex-1 border-[1.5pt] border-black rounded-sm overflow-hidden mb-4">
                  <table className="w-full border-collapse h-full text-center table-fixed">
                    <thead className="bg-slate-50 border-b-[1.5pt] border-black font-black text-[9pt]">
                      <tr className="h-8">
                        <th className="border-l-[1.2pt] border-black w-10">اليوم</th>
                        <th className="border-l-[1.2pt] border-black w-7 text-[7pt]">ح</th>
                        <th className="border-l-[1.2pt] border-black w-24">المادة</th>
                        <th className="border-l-[1.2pt] border-black">الدرس المقرر</th>
                        <th className="border-l-[1.2pt] border-black">الواجب</th>
                        <th className="w-16 text-[6.5pt]">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="text-[8.5pt]">
                      {DAYS.map((day) => (
                        <React.Fragment key={day.id}>
                          {PERIODS.map((period, pIdx) => {
                            const sched = schedule[`${day.id}_${period}`] || {};
                            const planKey = `${classTitle}_${day.id}_${period}`;
                            const plan = allPlans[planKey] || {};
                            const subject = subjects.find(s => s.id === sched.subjectId)?.name || '-';
                            return (
                              <tr key={`${day.id}-${period}`} className={`h-[18.2px] border-b ${pIdx === 6 ? 'border-b-[1.5pt] border-black' : 'border-slate-300'}`}>
                                {pIdx === 0 && (
                                  <td rowSpan={7} className="border-l-[1.5pt] border-black font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-[10pt] leading-none border-b-[1.5pt] border-black">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l-[0.8pt] border-slate-300 font-bold">{period}</td>
                                <td className="border-l-[0.8pt] border-slate-300 font-black truncate px-1">{subject}</td>
                                <td className="border-l-[0.8pt] border-slate-300 leading-tight px-1 truncate text-slate-700">{plan.lesson || '-'}</td>
                                <td className="border-l-[0.8pt] border-slate-300 leading-tight px-1 truncate font-bold">{plan.homework || '-'}</td>
                                <td className="text-[6.5pt] text-slate-400 truncate px-1">{plan.enrichment || '-'}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
               </div>

               <div className="grid grid-cols-2 gap-4 h-[35mm]">
                  <div className="border-[1.2pt] border-black p-3 bg-white rounded-md">
                     <h3 className="text-[9pt] font-black mb-1 border-b border-black pb-0.5 bg-slate-50 text-center">توجيهات ولي الأمر</h3>
                     <p className="text-[8.5pt] font-bold leading-tight h-[20mm] overflow-hidden">{school.generalMessages || "..."}</p>
                  </div>
                  <div className="border-[1.2pt] border-black p-3 bg-white rounded-md flex flex-col items-center justify-center text-center">
                     <h3 className="text-[9pt] font-black mb-1 border-b border-black w-full pb-0.5 bg-slate-50">القيمة التربوية</h3>
                     <div className="flex-1 flex flex-col justify-center gap-1">
                       {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="h-10 object-contain mx-auto" />}
                       <p className="text-[10pt] font-black leading-tight">{school.weeklyNotes || "مدرستنا بيئتنا"}</p>
                     </div>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BulkStudentPlans;
