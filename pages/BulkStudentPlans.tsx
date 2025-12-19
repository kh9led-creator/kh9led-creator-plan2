
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DAYS, PERIODS, db, formatToHijri } from '../constants.tsx';
import { Printer, User, GraduationCap, FileCheck, Award, QrCode, Bookmark, MapPin, CalendarDays } from 'lucide-react';
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

  if (isLoading) return <div className="p-24 text-center font-black animate-pulse text-slate-400 text-2xl">جاري تحضير ملفات الطباعة الفاخرة...</div>;
  if (!school) return <div className="p-24 text-center font-black text-rose-500 text-2xl">المدرسة غير موجودة.</div>;

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم").split('\n');

  return (
    <div className="bg-slate-200 min-h-screen font-['Tajawal'] pb-20 no-print-bg">
      {/* Control Bar */}
      <div className="max-w-[1100px] mx-auto p-6 no-print flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-xl z-50 border-b shadow-2xl rounded-b-3xl mb-10">
        <div className="flex items-center gap-5">
           <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-200 animate-bounce">
             <Printer size={32} />
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">محرك الطباعة الذكي</h1>
              <p className="text-sm text-slate-400 font-bold">جاهز لطباعة <span className="text-indigo-600 underline">{studentsToPrint.length}</span> مستند بجودة عالية</p>
           </div>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl hover:bg-black transition-all flex items-center gap-4 active:scale-95"
        >
          <Printer size={24} /> تأكيد وطباعة الكل
        </button>
      </div>

      <div className="flex flex-col items-center gap-16 pb-20">
        {studentsToPrint.map((student) => {
          const classTitle = `${student.grade} - فصل ${student.section}`;
          const schedule = allSchedules[classTitle] || {};

          // الذكاء الاصطناعي لتصحيح الاسم المعكوس
          const isNameActuallyPhone = /^[0-9+ ]+$/.test(student.name);
          const isPhoneActuallyName = student.phoneNumber && !/^[0-9+ ]+$/.test(student.phoneNumber);
          const finalDisplayName = (isNameActuallyPhone && isPhoneActuallyName) ? student.phoneNumber : student.name;

          return (
            <div key={student.id} className="student-page-container print:m-0 print:shadow-none transition-transform hover:scale-[1.01] duration-500">
              <div className="a4-page bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] p-[12mm] relative flex flex-col overflow-hidden border border-slate-100" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
                
                {/* Watermark Logo - العلامة المائية */}
                {school.logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0 overflow-hidden">
                    <img src={school.logoUrl} className="w-[450px] h-[450px] object-contain grayscale" alt="Watermark" />
                  </div>
                )}

                {/* Header Section */}
                <div className="relative z-10 grid grid-cols-3 gap-4 mb-6 border-b-4 border-double border-slate-900 pb-6 items-center">
                  {/* Right: Official Info */}
                  <div className="text-right space-y-1 font-black text-[9.5pt] leading-tight text-slate-800">
                    {headerLines.map((line, i) => <p key={i}>{line}</p>)}
                    <p className="text-indigo-600 pt-1">مدرسة: {school.name}</p>
                  </div>

                  {/* Center: Main Logo */}
                  <div className="flex flex-col items-center justify-center scale-110">
                    {school.logoUrl ? (
                      <img src={school.logoUrl} className="w-24 h-24 object-contain drop-shadow-md" alt="Logo" />
                    ) : (
                      <div className="w-20 h-20 border-4 border-double rounded-2xl flex items-center justify-center text-slate-300 font-black">LOGO</div>
                    )}
                    <div className="mt-3 bg-slate-900 text-white px-5 py-1 rounded-full">
                      <span className="text-[8pt] font-black tracking-widest uppercase">Weekly Academic Plan</span>
                    </div>
                  </div>

                  {/* Left: Student Identity Card */}
                  <div className="space-y-3">
                    <div className="bg-slate-900 text-white p-4 rounded-3xl text-center shadow-xl border-t-4 border-indigo-500 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50"></div>
                      <p className="text-[7.5pt] font-black opacity-60 mb-1.5 flex items-center justify-center gap-1.5 relative z-10">
                        <User size={12} className="text-indigo-300" /> الاسم الرباعي للطالب
                      </p>
                      <h4 className="text-[14.5pt] font-black tracking-tight leading-none relative z-10">
                        {finalDisplayName}
                      </h4>
                    </div>
                    
                    <div className="text-[9.5pt] font-bold space-y-1.5 pr-2 border-r-4 border-indigo-100 mr-2">
                      <p className="flex items-center gap-2"><CalendarDays size={14} className="text-slate-400" /> الأسبوع الدراسي: <span className="font-black text-indigo-700 underline underline-offset-4">{activeWeek?.name || "---"}</span></p>
                      <p className="flex items-center gap-2"><Bookmark size={14} className="text-slate-400" /> الصف والفصل: <span className="font-black text-slate-800">{classTitle}</span></p>
                      <p className="text-[8pt] text-slate-400 font-black pr-5">الفترة: {activeWeek ? `${formatToHijri(activeWeek.startDate)} - ${formatToHijri(activeWeek.endDate)}` : '--'}</p>
                    </div>
                  </div>
                </div>

                {/* Main Schedule Table */}
                <div className="relative z-10 flex-1 overflow-hidden border-[2.5px] border-slate-900 rounded-lg mb-6 shadow-sm">
                  <table className="w-full border-collapse table-fixed h-full text-center">
                    <thead className="bg-slate-100 border-b-[2.5px] border-slate-900 font-black">
                      <tr className="h-11">
                        <th className="border-l-[2px] border-slate-900 w-16 text-[10.5pt] bg-slate-200">اليوم</th>
                        <th className="border-l-[1.5px] border-slate-900 w-9 text-[9.5pt]">م</th>
                        <th className="border-l-[1.5px] border-slate-900 w-32 text-[10.5pt]">المادة</th>
                        <th className="border-l-[1.5px] border-slate-900 text-[10.5pt]">الدرس المقرر</th>
                        <th className="border-l-[1.5px] border-slate-900 text-[10.5pt]">الواجب المنزلي</th>
                        <th className="w-32 text-[9.5pt] bg-slate-50">ملاحظات إثرائية</th>
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
                              <tr key={`${day.id}-${period}`} className={`h-[18.2px] border-b ${pIdx === PERIODS.length - 1 ? 'border-b-[2px] border-slate-900' : 'border-slate-300'}`}>
                                {pIdx === 0 && (
                                  <td rowSpan={PERIODS.length} className="border-l-[2.5px] border-slate-900 font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-[11pt] tracking-[0.2em] leading-none border-b-[2px] border-slate-900">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l-[1.5px] border-slate-900 text-[10pt] font-black bg-slate-50/50">{period}</td>
                                <td className="border-l-[1.5px] border-slate-900 text-[10pt] font-black truncate px-2 text-indigo-900">{subject}</td>
                                <td className="border-l-[1.5px] border-slate-900 text-[9.5pt] leading-snug px-3 truncate font-bold text-slate-700 italic">{plan.lesson || '-'}</td>
                                <td className="border-l-[1.5px] border-slate-900 text-[9.5pt] leading-snug px-3 truncate font-bold text-slate-800">{plan.homework || '-'}</td>
                                <td className="text-[8.5pt] leading-tight px-2 text-slate-400 font-black italic truncate bg-slate-50/30">{plan.enrichment || '-'}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Interactive Boxes */}
                <div className="relative z-10 grid grid-cols-2 gap-8 h-[48mm]">
                   <div className="border-[2px] border-slate-900 p-5 bg-white flex flex-col shadow-lg rounded-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-[3rem] -mr-4 -mt-4 opacity-50 border-b border-l border-slate-200"></div>
                     <h3 className="text-[11pt] font-black mb-4 border-b-2 border-slate-900 pb-2 text-center bg-slate-100 flex items-center justify-center gap-2 rounded-lg relative z-10">
                       <FileCheck size={18} className="text-slate-600" /> توجيهات الشراكة الأسرية
                     </h3>
                     <p className="text-[9.5pt] font-bold leading-relaxed text-slate-700 whitespace-pre-wrap flex-1 overflow-hidden relative z-10 pr-2">
                       {school.generalMessages || "١. المتابعة المستمرة لمنصة مدرستي لتعزيز التحصيل العلمي.\n٢. الالتزام بالحضور الصباحي المبكر.\n٣. التأكد من إحضار كافة الكتب والأدوات المدرسية يومياً."}
                     </p>
                   </div>
                   
                   <div className="border-[2px] border-slate-900 p-5 bg-white flex flex-col shadow-lg rounded-2xl relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-16 h-16 bg-indigo-50 rounded-br-[3rem] -ml-4 -mt-4 opacity-50 border-b border-r border-indigo-100"></div>
                     <h3 className="text-[11pt] font-black mb-4 border-b-2 border-slate-900 pb-2 text-center bg-indigo-50 flex items-center justify-center gap-2 rounded-lg relative z-10 text-indigo-900">
                       <Award size={18} className="text-indigo-600" /> القيمة التربوية للأسبوع
                     </h3>
                     <div className="flex-1 flex flex-col items-center justify-center overflow-hidden relative z-10">
                       {school.weeklyNotesImage && (
                          <img src={school.weeklyNotesImage} className="max-h-[22mm] object-contain mb-3 drop-shadow-sm border-2 border-white rounded-xl" alt="Weekly Value" />
                       )}
                       <p className="text-[11.5pt] font-black text-center text-indigo-800 leading-snug px-4">
                         {school.weeklyNotes || "البيئة المدرسية الآمنة هي منطلق الإبداع والتميز"}
                       </p>
                     </div>
                   </div>
                </div>
                
                {/* Official Certification Section */}
                <div className="relative z-10 mt-6 grid grid-cols-2 gap-12 px-10 h-[18mm] items-center border-t-2 border-slate-100 pt-6">
                   <div className="text-[9pt] font-black text-slate-400 flex flex-col items-start gap-2">
                     <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full"><QrCode size={16} /> الختم الرسمي للمؤسسة:</span>
                     <div className="w-20 h-20 border-2 border-dashed border-slate-100 mt-1 flex items-center justify-center opacity-10">
                        <span className="rotate-45 text-[6pt]">STAMP HERE</span>
                     </div>
                   </div>
                   <div className="text-[9.5pt] font-black text-slate-800 text-left flex flex-col items-end gap-2">
                     <span className="bg-slate-50 px-4 py-1 rounded-full">اعتماد مدير المدرسة</span>
                     <div className="mt-3 font-black text-slate-300 italic text-[11pt]">__________________________</div>
                     <p className="text-[7pt] text-slate-400 mt-1 italic">التوقيع الإلكتروني معتمد</p>
                   </div>
                </div>
                
                {/* Micro-Branding Footer */}
                <div className="relative z-10 mt-auto text-center opacity-40 pt-4 flex justify-between items-center px-4">
                   <p className="text-[7.5pt] font-black text-slate-500 uppercase tracking-tighter">
                     خطة الطالب: <span className="text-slate-900">{finalDisplayName}</span>
                   </p>
                   <div className="flex items-center gap-2 text-[7pt] font-black text-indigo-600">
                      <MapPin size={8} /> بوابة مدرستي الرقمية - {new Date().getFullYear()}
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
