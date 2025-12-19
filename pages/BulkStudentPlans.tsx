
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DAYS, PERIODS, db, formatToHijri } from '../constants.tsx';
import { Printer, User, GraduationCap, FileCheck, Award, QrCode } from 'lucide-react';
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
           <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-xl shadow-slate-200"><Printer size={28} /></div>
           <div>
              <h1 className="text-2xl font-black text-slate-800">محرك الطباعة الفردية للطلاب</h1>
              <p className="text-sm text-slate-400 font-bold tracking-tight">إجمالي المستندات: {studentsToPrint.length} ورقة</p>
           </div>
        </div>
        <button onClick={() => window.print()} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-3">
             <Printer size={22} /> بدء الطباعة الآن
        </button>
      </div>

      <div className="py-8 space-y-12">
        {studentsToPrint.map((student) => {
          const classTitle = `${student.grade} - فصل ${student.section}`;
          const schedule = allSchedules[classTitle] || {};

          // ميزة التصحيح الذكي: إذا كان حقل الاسم يحتوي على أرقام فقط وحقل الجوال يحتوي على نص، نقوم بتبديلهما
          const isNameActuallyPhone = /^[0-9+ ]+$/.test(student.name);
          const isPhoneActuallyName = student.phoneNumber && !/^[0-9+ ]+$/.test(student.phoneNumber);
          const finalDisplayName = (isNameActuallyPhone && isPhoneActuallyName) ? student.phoneNumber : student.name;

          return (
            <div key={student.id} className="student-page-container flex justify-center mb-10">
              <div className="a4-page bg-white shadow-2xl p-[10mm] relative flex flex-col overflow-hidden border border-slate-200" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
                
                {/* Header Section */}
                <div className="grid grid-cols-3 gap-2 mb-4 border-b-2 border-black pb-4 items-center">
                  <div className="text-right space-y-0.5 font-black text-[9pt] leading-tight">
                    {headerLines.map((line, i) => <p key={i}>{line}</p>)}
                    <p>{school.name}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    {school.logoUrl ? (
                      <img src={school.logoUrl} className="w-20 h-20 object-contain" alt="Logo" />
                    ) : (
                      <div className="w-16 h-16 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-300">LOGO</div>
                    )}
                    <div className="mt-2 bg-indigo-50 px-4 py-1 rounded-full border border-indigo-100">
                      <span className="text-[7.5pt] font-black text-indigo-600 tracking-tighter">الخطة الدراسية الأسبوعية</span>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    {/* Student Name Box - Fixed to show Quadruple Name only */}
                    <div className="bg-slate-900 text-white p-4 rounded-2xl text-center shadow-lg">
                      <p className="text-[7pt] font-bold opacity-70 mb-1 flex items-center justify-center gap-1">
                        <User size={10} className="text-indigo-400" /> اسم الطالب الرباعي
                      </p>
                      <h4 className="text-[15pt] font-black tracking-tight leading-none">
                        {finalDisplayName}
                      </h4>
                    </div>
                    
                    <div className="text-[9pt] font-bold space-y-1 pr-2">
                      <p>الأسبوع: <span className="font-black underline">{activeWeek?.name || "---"}</span></p>
                      <p>الصف: <span className="font-black">{classTitle}</span></p>
                      <p className="text-[7pt] opacity-60">الفترة: {activeWeek ? `${formatToHijri(activeWeek.startDate)} - ${formatToHijri(activeWeek.endDate)}` : '--'}</p>
                    </div>
                  </div>
                </div>

                {/* Main Schedule Table */}
                <div className="flex-1 overflow-hidden border-2 border-black rounded-sm mb-4">
                  <table className="w-full border-collapse table-fixed h-full text-center">
                    <thead className="bg-slate-50 border-b-2 border-black font-black">
                      <tr className="h-10">
                        <th className="border-l-2 border-black w-14 text-[10pt]">اليوم</th>
                        <th className="border-l-2 border-black w-8 text-[9pt]">م</th>
                        <th className="border-l-2 border-black w-28 text-[10pt]">المادة</th>
                        <th className="border-l-2 border-black text-[10pt]">الدرس المقرر</th>
                        <th className="border-l-2 border-black text-[10pt]">الواجب المنزلي</th>
                        <th className="w-28 text-[9pt]">ملاحظات</th>
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
                                  <td rowSpan={PERIODS.length} className="border-l-2 border-black font-black rotate-180 [writing-mode:vertical-rl] bg-white text-[10pt] tracking-widest leading-none border-b-2 border-black">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l-2 border-black text-[9pt] font-black">{period}</td>
                                <td className="border-l-2 border-black text-[9.5pt] font-black truncate px-1">{subject}</td>
                                <td className="border-l-2 border-black text-[9pt] leading-tight px-2 truncate font-medium italic">{plan.lesson || '-'}</td>
                                <td className="border-l-2 border-black text-[9pt] leading-tight px-2 truncate font-medium">{plan.homework || '-'}</td>
                                <td className="text-[8pt] leading-tight px-1 text-slate-400 font-bold italic truncate">{plan.enrichment || '-'}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Boxes */}
                <div className="grid grid-cols-2 gap-6 h-[45mm]">
                   <div className="border-2 border-black p-4 bg-white flex flex-col shadow-sm">
                     <h3 className="text-[10pt] font-black mb-3 border-b border-black pb-1.5 text-center bg-slate-50 flex items-center justify-center gap-2">
                       <FileCheck size={16} className="text-slate-600" /> توجيهات ولي الأمر
                     </h3>
                     <p className="text-[9pt] font-bold leading-relaxed text-slate-700 whitespace-pre-wrap flex-1 overflow-hidden">
                       {school.generalMessages || "١. نرجو المتابعة المستمرة لمستوى الطالب\n٢. الحرص على الحضور المبكر\n٣. إحضار الأدوات المدرسية"}
                     </p>
                   </div>
                   <div className="border-2 border-black p-4 bg-white flex flex-col shadow-sm">
                     <h3 className="text-[10pt] font-black mb-3 border-b border-black pb-1.5 text-center bg-slate-50 flex items-center justify-center gap-2">
                       <GraduationCap size={16} className="text-indigo-600" /> نشاط الأسبوع
                     </h3>
                     <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                       {school.weeklyNotesImage && (
                          <img src={school.weeklyNotesImage} className="max-h-[18mm] object-contain mb-2 shadow-sm rounded-sm" alt="Activity" />
                       )}
                       <p className="text-[10pt] font-black text-center text-indigo-700 leading-tight">
                         {school.weeklyNotes || "مدرستنا بيئة آمنة للتعلم"}
                       </p>
                     </div>
                   </div>
                </div>
                
                {/* Bottom Signature Section */}
                <div className="mt-4 grid grid-cols-2 gap-10 px-8 h-[15mm] items-center border-t border-slate-100 pt-4">
                   <div className="text-[8pt] font-bold text-slate-500 flex flex-col items-start gap-1">
                     <span className="flex items-center gap-2"><QrCode size={14} /> الختم الرسمي:</span>
                     <div className="w-16 h-16 border border-slate-200 mt-1 opacity-10"></div>
                   </div>
                   <div className="text-[8pt] font-bold text-slate-500 text-left flex flex-col items-end gap-1">
                     <span>توقيع مدير المدرسة:</span>
                     <div className="mt-2 font-black text-slate-400 italic">__________________________</div>
                   </div>
                </div>
                
                <div className="mt-4 text-center opacity-30">
                   <p className="text-[7pt] font-black text-slate-400 uppercase tracking-tighter">
                     خطة الطالب: {finalDisplayName} - {classTitle} - مدرسة {school.name}
                   </p>
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
