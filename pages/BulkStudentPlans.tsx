
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DAYS, PERIODS, db, formatToHijri } from '../constants.tsx';
import { Printer, User, GraduationCap } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (schoolSlug) {
      const s = db.getSchoolBySlug(schoolSlug);
      if (s) {
        setSchool(s);
        const week = db.getActiveWeek(s.id);
        setActiveWeek(week);
        if (week) {
          setAllPlans(db.getPlans(s.id, week.id));
        }
        setSubjects(db.getSubjects(s.id));
        
        let students = db.getStudents(s.id);
        if (filterClass) {
          students = students.filter(std => `${std.grade} - فصل ${std.section}` === filterClass);
        }
        setStudentsToPrint(students);

        const classes = Array.from(new Set(students.map(std => `${std.grade} - فصل ${std.section}`)));
        const schedules: any = {};
        classes.forEach(cls => {
          schedules[cls] = db.getSchedule(s.id, cls);
        });
        setAllSchedules(schedules);
      }
      setIsLoading(false);
    }
  }, [schoolSlug, filterClass]);

  if (isLoading) return <div className="p-24 text-center font-black animate-pulse text-slate-400 text-2xl">جاري تحضير ملفات الطباعة...</div>;
  if (!school) return <div className="p-24 text-center font-black text-rose-500 text-2xl">المدرسة غير موجودة.</div>;

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم").split('\n');

  return (
    <div className="bg-slate-100 min-h-screen font-['Tajawal'] pb-10">
      <div className="max-w-[1100px] mx-auto p-6 no-print flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-50 border-b shadow-md">
        <div className="flex items-center gap-4">
           <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-100"><Printer size={28} /></div>
           <div>
              <h1 className="text-2xl font-black text-slate-800">محرك الطباعة الفردية للطلاب</h1>
              <p className="text-sm text-slate-400 font-bold tracking-tight">إجمالي المستندات: {studentsToPrint.length} ورقة</p>
           </div>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
             بدء الطباعة الآن
        </button>
      </div>

      <div className="py-8 space-y-12">
        {studentsToPrint.map((student) => {
          const classTitle = `${student.grade} - فصل ${student.section}`;
          const schedule = allSchedules[classTitle] || {};

          return (
            <div key={student.id} className="student-page-container flex justify-center">
              <div className="a4-page bg-white shadow-2xl p-[8mm] relative flex flex-col overflow-hidden" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
                
                {/* Header */}
                <div className="grid grid-cols-3 gap-2 mb-2 border-b-2 border-black pb-2">
                  <div className="text-right space-y-0 font-black text-[8pt] leading-tight">
                    {headerLines.map((line, i) => <p key={i}>{line}</p>)}
                    <p>{school.name}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    {school.logoUrl && <img src={school.logoUrl} className="w-14 h-14 object-contain" />}
                  </div>

                  <div className="text-right space-y-0.5 font-bold text-[8pt]">
                    <p>الصف: <span className="font-black underline">{classTitle}</span></p>
                    <p className="text-blue-600 font-black">الطالب: {student.name}</p>
                    <p>الأسبوع: <span className="font-black">{activeWeek?.name || "---"}</span></p>
                    <p className="text-[7pt]">الفترة: {activeWeek ? `${formatToHijri(activeWeek.startDate)} إلى ${formatToHijri(activeWeek.endDate)}` : '--'}</p>
                  </div>
                </div>

                {/* باقي الجدول والمحتوى ... */}
                <div className="flex-1 overflow-hidden border-2 border-black rounded-sm mb-2">
                  <table className="w-full border-collapse table-fixed h-full text-center">
                    <thead className="bg-slate-100 border-b-2 border-black font-black">
                      <tr className="h-8">
                        <th className="border-l-2 border-black w-10 text-[8pt]">اليوم</th>
                        <th className="border-l-2 border-black w-7 text-[7pt]">م</th>
                        <th className="border-l-2 border-black w-24 text-[8pt]">المادة</th>
                        <th className="border-l-2 border-black text-[8pt]">الدرس المقرر</th>
                        <th className="border-l-2 border-black text-[8pt]">الواجب</th>
                        <th className="w-24 text-[8pt]">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((day) => (
                        <React.Fragment key={day.id}>
                          {PERIODS.map((period, pIdx) => {
                            const sched = schedule[`${day.id}_${period}`] || {};
                            const planKey = `${classTitle}_${day.id}_${period}`;
                            const plan = allPlans[planKey] || {};
                            const subject = subjects.find(s => s.id === sched.subjectId)?.name || '-';
                            
                            return (
                              <tr key={`${day.id}-${period}`} className={`h-[18.5px] border-b ${pIdx === PERIODS.length - 1 ? 'border-b-2 border-black' : 'border-slate-200'}`}>
                                {pIdx === 0 && (
                                  <td rowSpan={PERIODS.length} className="border-l-2 border-black font-black rotate-180 [writing-mode:vertical-rl] bg-white text-[8pt] tracking-widest leading-none border-b-2 border-black">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l-2 border-black text-[7pt] font-black">{period}</td>
                                <td className="border-l-2 border-black text-[8pt] font-black truncate px-1">{subject}</td>
                                <td className="border-l-2 border-black text-[7.5pt] leading-tight px-1 truncate font-medium">{plan.lesson || '-'}</td>
                                <td className="border-l-2 border-black text-[7.5pt] leading-tight px-1 truncate font-medium">{plan.homework || '-'}</td>
                                <td className="text-[7pt] leading-tight px-1 text-slate-400 truncate">{plan.enrichment || '-'}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-4 h-[38mm]">
                   <div className="border-2 border-black p-2 bg-white">
                     <h3 className="text-[8.5pt] font-black mb-1 border-b border-black pb-0.5 text-center bg-slate-50">توجيهات ولي الأمر</h3>
                     <p className="text-[8pt] font-bold leading-snug text-slate-700 whitespace-pre-wrap">{school.generalMessages || "- نرجو المتابعة المستمرة لمستوى الطالب\n- الحرص على الحضور المبكر"}</p>
                   </div>
                   <div className="border-2 border-black p-2 bg-white flex flex-col">
                     <h3 className="text-[8.5pt] font-black mb-1 border-b border-black pb-0.5 text-center bg-slate-50">نشاط الأسبوع</h3>
                     <div className="flex-1 flex flex-col items-center justify-center">
                       {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="max-h-[14mm] object-contain mb-1" />}
                       <p className="text-[8.5pt] font-black text-center text-indigo-700 leading-tight">{school.weeklyNotes || "مدرستنا بيئة آمنة للتعلم"}</p>
                     </div>
                   </div>
                </div>
                
                <div className="mt-1 text-center border-t border-slate-100 pt-1 opacity-50">
                   <p className="text-[6pt] font-black text-slate-400 uppercase tracking-tighter">سجل الطالب: {student.name} - مدرسة {school.name}</p>
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
