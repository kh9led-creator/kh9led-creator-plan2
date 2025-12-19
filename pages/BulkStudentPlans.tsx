
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DAYS, PERIODS, db, formatToHijri } from '../constants.tsx';
import { 
  Printer, User, Bookmark, CalendarDays, 
  Backpack, Compass, Calculator, Library, 
  NotebookPen, Shapes, Telescope, GraduationCap, 
  School as SchoolIcon, BookOpen, Microscope
} from 'lucide-react';
import { School, Subject, Student, AcademicWeek } from '../types.ts';

// مصفوفة الأيقونات المتاحة للفصول
const CLASS_ICONS = [
  Backpack, Compass, Calculator, Library, 
  NotebookPen, Shapes, Telescope, GraduationCap, 
  SchoolIcon, BookOpen, Microscope
];

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
        if (week) setAllPlans(db.getPlans(s.id, week.id));
        setSubjects(db.getSubjects(s.id));
        let students = db.getStudents(s.id);
        if (filterClass) students = students.filter(std => `${std.grade} - فصل ${std.section}` === filterClass);
        setStudentsToPrint(students);
        
        const classes = Array.from(new Set(students.map(std => `${std.grade} - فصل ${std.section}`)));
        const schedules: any = {};
        classes.forEach(cls => schedules[cls] = db.getSchedule(s.id, cls));
        setAllSchedules(schedules);
      }
      setIsLoading(false);
    }
  }, [schoolSlug, filterClass]);

  // دالة للحصول على أيقونة ثابتة للفصل بناءً على اسمه
  const getClassIcon = (classTitle: string) => {
    let hash = 0;
    for (let i = 0; i < classTitle.length; i++) {
      hash = classTitle.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % CLASS_ICONS.length;
    return CLASS_ICONS[index];
  };

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
    <div className="bg-slate-200 min-h-screen font-['Tajawal'] pb-20 no-print-bg">
      <div className="max-w-[1100px] mx-auto p-6 no-print flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-xl z-50 border-b shadow-2xl rounded-b-3xl mb-10">
        <div className="flex items-center gap-5">
           <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-lg animate-bounce">
             <Printer size={32} />
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">محرك الطباعة الجماعي</h1>
              <p className="text-sm text-slate-400 font-bold tracking-widest">إجمالي الفصول: {Object.keys(groupedStudents).length} | إجمالي الطلاب: {studentsToPrint.length}</p>
           </div>
        </div>
        <button onClick={() => window.print()} className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl hover:bg-indigo-700 transition-all active:scale-95">بدء طباعة جميع الفصول</button>
      </div>

      <div className="flex flex-col items-center gap-10">
        {(Object.entries(groupedStudents) as [string, Student[]][]).map(([classTitle, students]) => {
          const ClassIcon = getClassIcon(classTitle);
          return (
            <div key={classTitle} className="w-full flex flex-col items-center gap-16">
              {/* عنوان الفصل في المعاينة بأيقونة خاصة */}
              <div className="no-print w-full max-w-[210mm] bg-white p-6 rounded-[2.5rem] border-2 border-indigo-100 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <ClassIcon size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">{classTitle}</h2>
                        <p className="text-xs text-indigo-400 font-bold">مجموعة الطباعة الخاصة بالفصل</p>
                    </div>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="bg-slate-100 px-4 py-2 rounded-xl text-slate-600 font-black text-sm">الطلاب: {students.length}</span>
                 </div>
              </div>

              {students.map((student) => {
                const schedule = allSchedules[classTitle] || {};
                const isNameActuallyPhone = /^[0-9+ ]+$/.test(student.name);
                const isPhoneActuallyName = student.phoneNumber && !/^[0-9+ ]+$/.test(student.phoneNumber);
                const finalDisplayName = (isNameActuallyPhone && isPhoneActuallyName) ? student.phoneNumber : student.name;

                return (
                  <div key={student.id} className="student-page-container print:m-0 print:shadow-none break-after-page" style={{ pageBreakAfter: 'always' }}>
                    <div className="a4-page bg-white shadow-2xl p-[8mm] relative flex flex-col overflow-hidden border border-slate-100" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
                      
                      {/* العلامة المائية */}
                      {school.logoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] z-0 overflow-hidden">
                          <img src={school.logoUrl} className="w-[500px] h-[500px] object-contain grayscale" alt="خلفية" />
                        </div>
                      )}

                      {/* الترويسة */}
                      <div className="relative z-10 grid grid-cols-3 gap-3 mb-2.5 border-b-2 border-slate-900 pb-2.5 items-center">
                        <div className="text-right space-y-0.5 font-black text-[7.5pt] leading-tight text-slate-800">
                          {headerLines.map((line, i) => <p key={i}>{line}</p>)}
                        </div>

                        <div className="flex flex-col items-center justify-center">
                          {school.logoUrl ? <img src={school.logoUrl} className="w-16 h-16 object-contain" alt="شعار" /> : <div className="w-14 h-14 border rounded-lg flex items-center justify-center text-[7pt] text-slate-200 font-black">LOGO</div>}
                          <div className="mt-1 bg-slate-900 text-white px-3 py-0.5 rounded-full">
                            <span className="text-[6.5pt] font-black uppercase tracking-wider">الخطة الدراسية الأسبوعية</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="bg-slate-900 text-white p-2.5 rounded-2xl text-center shadow-lg border-t-2 border-slate-500 relative overflow-hidden">
                            <p className="text-[6pt] font-black opacity-60 mb-0.5 flex items-center justify-center gap-1">
                              <User size={8} className="text-slate-300" /> الاسم الرباعي للطالب
                            </p>
                            <h4 className="text-[11.5pt] font-black leading-none truncate px-1">
                              {finalDisplayName}
                            </h4>
                          </div>
                          <div className="text-[8.5pt] font-bold space-y-0.5 pr-2 border-r-2 border-slate-300 text-slate-900">
                            <p className="flex items-center gap-1.5">
                              <CalendarDays size={10} className="text-slate-500" /> الأسبوع: <span className="font-black">{activeWeek?.name || "---"}</span>
                              <span className="text-[6.8pt] text-slate-400 font-bold mr-0.5">({activeWeek ? formatToHijri(activeWeek.startDate) : '--'})</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                                <ClassIcon size={10} className="text-slate-500" /> الصف: <span className="font-black">{classTitle}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* الجدول الدراسي */}
                      <div className="relative z-10 flex-1 overflow-hidden border-[2.5px] border-slate-900 rounded-sm mb-4">
                        <table className="w-full border-collapse table-fixed h-full text-center">
                          <thead className="bg-slate-50 border-b-[2.5px] border-slate-900 font-black text-slate-900">
                            <tr className="h-8">
                              <th className="border-l-[1.5px] border-slate-900 w-12 text-[9.5pt] bg-slate-100">اليوم</th>
                              <th className="border-l-[1.5px] border-slate-900 w-8 text-[8.5pt]">م</th>
                              <th className="border-l-[1.5px] border-slate-900 w-28 text-[9.5pt]">المادة</th>
                              <th className="border-l-[1.5px] border-slate-900 text-[9.5pt]">الدرس المقرر</th>
                              <th className="border-l-[1.5px] border-slate-900 text-[9.5pt]">الواجب المنزلي</th>
                              <th className="w-24 text-[8pt] bg-slate-50">ملاحظات</th>
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
                                    <tr key={`${day.id}-${period}`} className={`h-[18px] border-b ${pIdx === 6 ? 'border-b-[2px] border-slate-900' : 'border-slate-200'}`}>
                                      {pIdx === 0 && (
                                        <td rowSpan={7} className="border-l-[2.5px] border-slate-900 font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-[10pt] tracking-[0.1em] border-b-[2px] border-slate-900 leading-none">
                                          {day.label}
                                        </td>
                                      )}
                                      <td className="border-l-[1.2px] border-slate-200 text-[9pt] font-black bg-slate-50/50">{period}</td>
                                      <td className="border-l-[1.2px] border-slate-200 text-[9pt] font-black truncate px-1">{subject}</td>
                                      <td className="border-l-[1.2px] border-slate-200 text-[8.5pt] leading-tight px-2 truncate font-bold text-slate-700 italic">{plan.lesson || '-'}</td>
                                      <td className="border-l-[1.2px] border-slate-200 text-[8.5pt] leading-tight px-2 truncate font-bold text-slate-800">{plan.homework || '-'}</td>
                                      <td className="text-[7pt] px-1 text-slate-400 font-black truncate bg-slate-50/20 leading-none italic">{plan.enrichment || '-'}</td>
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* صناديق المعلومات السفلية */}
                      <div className="relative z-10 grid grid-cols-2 gap-6 h-[40mm]">
                         <div className="border-[1.5px] border-slate-900 p-3.5 bg-white rounded-xl shadow-sm">
                           <h3 className="text-[10pt] font-black mb-2 border-b border-slate-900 pb-1 text-center bg-slate-50 rounded-md">توجيهات الشراكة الأسرية</h3>
                           <p className="text-[9pt] font-bold leading-relaxed text-slate-700 whitespace-pre-wrap pr-2 overflow-hidden h-[26mm]">
                             {school.generalMessages || "١. المتابعة المستمرة لمنصة مدرستي لتعزيز التحصيل العلمي.\n٢. الالتزام بالحضور الصباحي.\n٣. إحضار الكتب المدرسية يومياً."}
                           </p>
                         </div>
                         <div className="border-[1.5px] border-slate-900 p-3.5 bg-white rounded-xl shadow-sm">
                           <h3 className="text-[10pt] font-black mb-2 border-b border-slate-900 pb-1 text-center bg-slate-50 rounded-md">القيمة التربوية</h3>
                           <div className="flex flex-col items-center justify-center flex-1 pt-1 h-[26mm] overflow-hidden">
                             {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="max-h-[14mm] object-contain mb-1" alt="قيمة" />}
                             <p className="text-[10.5pt] font-black text-center text-slate-800 leading-snug px-3">
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
