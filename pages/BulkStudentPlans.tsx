
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DAYS, PERIODS, db, formatToHijri } from '../constants.tsx';
import { 
  Printer, User, Bookmark, CalendarDays, 
  Backpack, Compass, Calculator, Library, 
  NotebookPen, Shapes, Telescope, GraduationCap, 
  School as SchoolIcon, BookOpen, Microscope,
  Layers, Palette, Binary, Atom, Globe
} from 'lucide-react';
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
    const loadBulkData = async () => {
      if (schoolSlug) {
        const s = await db.getSchoolBySlug(schoolSlug);
        if (s) {
          setSchool(s);
          const week = await db.getActiveWeek(s.id);
          setActiveWeek(week);
          if (week) {
            setAllPlans(await db.getPlans(s.id, week.id));
          }
          setSubjects(await db.getSubjects(s.id));
          let students: Student[] = await db.getStudents(s.id);
          if (filterClass) {
            students = students.filter(std => `${std.grade} - فصل ${std.section}` === filterClass);
          }
          setStudentsToPrint(students);
          
          const classes: string[] = Array.from(new Set(students.map((std: Student) => `${std.grade} - فصل ${std.section}`)));
          const schedules: Record<string, any> = {};
          for (const cls of classes) {
            schedules[cls] = await db.getSchedule(s.id, cls);
          }
          setAllSchedules(schedules);
        }
        setIsLoading(false);
      }
    };
    loadBulkData();
  }, [schoolSlug, filterClass]);

  const groupedStudents: Record<string, Student[]> = useMemo(() => {
    const groups: Record<string, Student[]> = {};
    studentsToPrint.forEach(student => {
      const classKey = `${student.grade} - فصل ${student.section}`;
      if (!groups[classKey]) groups[classKey] = [];
      groups[classKey].push(student);
    });
    return groups;
  }, [studentsToPrint]);

  if (isLoading) return <div className="p-24 text-center font-black animate-pulse text-slate-400 text-2xl">جاري تحضير ملفات الطباعة...</div>;
  if (!school) return <div className="p-24 text-center font-black text-rose-500 text-2xl">المدرسة غير موجودة.</div>;

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم").split('\n');

  return (
    <div className="bg-slate-100 min-h-screen font-['Tajawal'] pb-20 no-print-bg">
      <div className="max-w-[1100px] mx-auto p-6 no-print flex justify-between items-center sticky top-0 bg-white border-b shadow-sm z-50 mb-10 rounded-b-2xl">
        <div className="flex items-center gap-4">
           <div className="bg-slate-900 p-3 rounded-xl text-white">
             <Printer size={24} />
           </div>
           <div>
              <h1 className="text-xl font-black text-slate-800">محرك الطباعة الجماعي</h1>
              <p className="text-xs text-slate-400 font-bold">كل طالب سيظهر في صفحة مستقلة تماماً.</p>
           </div>
        </div>
        <button onClick={() => window.print()} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black shadow-lg hover:bg-indigo-700 transition-all">بدء طباعة جميع الصفحات</button>
      </div>

      <div className="flex flex-col items-center gap-8 print:gap-0">
        {(Object.entries(groupedStudents) as [string, Student[]][]).map(([classTitle, students]) => {
          return (
            <div key={classTitle} className="w-full flex flex-col items-center print:block">
              {students.map((student) => {
                const schedule = allSchedules[classTitle] || {};
                const isNameActuallyPhone = /^[0-9+ ]+$/.test(student.name);
                const isPhoneActuallyName = student.phoneNumber && !/^[0-9+ ]+$/.test(student.phoneNumber);
                const finalDisplayName = (isNameActuallyPhone && isPhoneActuallyName) ? student.phoneNumber : student.name;

                return (
                  <div key={student.id} className="mb-10 shadow-xl print:m-0 print:shadow-none break-after-page" style={{ pageBreakAfter: 'always' }}>
                    <div className="bg-white p-[6mm] relative flex flex-col overflow-hidden print:border-none print:m-0" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
                      
                      {/* ترويسة نظيفة بدون أيقونات نظام */}
                      <div className="relative z-10 grid grid-cols-3 gap-2 mb-2.5 border-b-2 border-black pb-2 items-center">
                        <div className="text-right space-y-0.5 font-black text-[7pt] leading-tight text-black">
                          {headerLines.map((line, i) => <p key={i}>{line}</p>)}
                        </div>

                        <div className="flex flex-col items-center justify-center">
                          {school.logoUrl && <img src={school.logoUrl} className="w-16 h-16 object-contain" alt="شعار" />}
                          <div className="mt-1 bg-black text-white px-4 py-0.5 rounded-full">
                            <span className="text-[6.5pt] font-black uppercase tracking-wider">الخطة الدراسية الأسبوعية</span>
                          </div>
                        </div>

                        <div className="space-y-1 text-left">
                          <div className="border border-black p-1.5 rounded-md text-center bg-slate-50">
                            <p className="text-[6pt] font-black opacity-60 mb-0.5">اسم الطالب</p>
                            <h4 className="text-[10pt] font-black leading-none truncate">{finalDisplayName}</h4>
                          </div>
                          <div className="text-[8pt] font-bold text-black space-y-0.5 pr-1">
                            <p>الأسبوع: <span className="font-black">{activeWeek?.name || "---"}</span></p>
                            <p>الصف: <span className="font-black text-[9pt]">{classTitle}</span></p>
                          </div>
                        </div>
                      </div>

                      {/* جدول دراسي مضغوط ليناسب صفحة واحدة */}
                      <div className="relative z-10 flex-1 overflow-hidden border-[1.5pt] border-black rounded-sm mb-4">
                        <table className="w-full border-collapse table-fixed h-full text-center">
                          <thead className="bg-slate-50 border-b-[1.5pt] border-black font-black text-black">
                            <tr className="h-7">
                              <th className="border-l-[1.2pt] border-black w-10 text-[8.5pt] bg-slate-100">اليوم</th>
                              <th className="border-l-[1.2pt] border-black w-6 text-[7.5pt]">م</th>
                              <th className="border-l-[1.2pt] border-black w-24 text-[8.5pt]">المادة</th>
                              <th className="border-l-[1.2pt] border-black text-[8.5pt]">الدرس المقرر</th>
                              <th className="border-l-[1.2pt] border-black text-[8.5pt]">الواجب المنزلي</th>
                              <th className="w-20 text-[7pt] bg-slate-50">ملاحظات</th>
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
                                    <tr key={`${day.id}-${period}`} className={`h-[17px] border-b ${pIdx === 6 ? 'border-b-[1.5pt] border-black' : 'border-slate-300'}`}>
                                      {pIdx === 0 && (
                                        <td rowSpan={7} className="border-l-[1.5pt] border-black font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-[10pt] tracking-[0.1em] border-b-[1.5pt] border-black leading-none">
                                          {day.label}
                                        </td>
                                      )}
                                      <td className="border-l-[0.8pt] border-slate-300 text-[8.5pt] font-black">{period}</td>
                                      <td className="border-l-[0.8pt] border-slate-300 text-[8.5pt] font-black truncate px-1">{subject}</td>
                                      <td className="border-l-[0.8pt] border-slate-300 text-[8pt] leading-tight px-1.5 truncate text-slate-700">{plan.lesson || '-'}</td>
                                      <td className="border-l-[0.8pt] border-slate-300 text-[8pt] leading-tight px-1.5 truncate font-bold text-black">{plan.homework || '-'}</td>
                                      <td className="text-[6.5pt] px-1 text-slate-500 truncate leading-none">{plan.enrichment || '-'}</td>
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* تذييل مضغوط */}
                      <div className="relative z-10 grid grid-cols-2 gap-4 h-[35mm] shrink-0">
                         <div className="border-[1pt] border-black p-3 bg-white rounded-md">
                           <h3 className="text-[9pt] font-black mb-1 border-b border-black pb-0.5 text-center bg-slate-50">توجيهات الشراكة الأسرية</h3>
                           <p className="text-[8pt] font-bold leading-tight text-slate-800 whitespace-pre-wrap pr-1 h-[24mm] overflow-hidden">
                             {school.generalMessages || "١. المتابعة المستمرة لمنصة مدرستي لتعزيز التحصيل العلمي.\n٢. الالتزام بالحضور الصباحي.\n٣. إحضار الكتب المدرسية يومياً."}
                           </p>
                         </div>
                         <div className="border-[1pt] border-black p-3 bg-white rounded-md">
                           <h3 className="text-[9pt] font-black mb-1 border-b border-black pb-0.5 text-center bg-slate-50">القيمة التربوية</h3>
                           <div className="flex flex-col items-center justify-center h-[24mm]">
                             {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="max-h-[12mm] object-contain mb-1" alt="قيمة" />}
                             <p className="text-[9.5pt] font-black text-center text-black leading-tight px-2">
                               {school.weeklyNotes || "البيئة المدرسية الآمنة هي منطلق الإبداع والتميز"}
                             </p>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BulkStudentPlans;
