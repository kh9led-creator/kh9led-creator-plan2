
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { Printer, User, GraduationCap } from 'lucide-react';
import { School, Subject, Student } from '../types.ts';

const BulkStudentPlans: React.FC = () => {
  const { schoolSlug } = useParams();
  const [searchParams] = useSearchParams();
  const filterClass = searchParams.get('class');

  const [school, setSchool] = useState<School | null>(null);
  const [allPlans, setAllPlans] = useState<any>({});
  const [allSchedules, setAllSchedules] = useState<any>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentsToPrint, setStudentsToPrint] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (schoolSlug) {
      const s = db.getSchoolBySlug(schoolSlug);
      if (s) {
        setSchool(s);
        setAllPlans(db.getPlans(s.id));
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

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم\nمدرسة أحد الابتدائية").split('\n');

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
              {/* Single Page A4 Frame */}
              <div className="a4-page bg-white shadow-2xl p-[10mm] relative flex flex-col overflow-hidden" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
                
                {/* Header Section - Order Adjusted */}
                <div className="grid grid-cols-3 gap-2 mb-3 border-b-2 border-black pb-3">
                  {/* Right: School Info */}
                  <div className="text-right space-y-0.5 font-black text-[9pt] leading-tight">
                    {headerLines.map((line, i) => <p key={i}>{line}</p>)}
                  </div>

                  {/* Center: Logo */}
                  <div className="flex flex-col items-center justify-center">
                    {school.logoUrl && <img src={school.logoUrl} className="w-16 h-16 object-contain" />}
                  </div>

                  {/* Left: Student Info */}
                  <div className="text-right space-y-0.5 font-bold text-[8.5pt]">
                    <p>الصف: <span className="font-black underline">{classTitle}</span></p>
                    <p>الأسبوع: الأسبوع الأول</p>
                    <p>الفصل الدراسي الأول</p>
                    <p className="mt-1 text-slate-900 bg-slate-50 p-1 px-2 border-r-4 border-blue-600 inline-block text-[10pt] font-black">
                      اسم الطالب: {student.name}
                    </p>
                  </div>
                </div>

                {/* Table - Optimized row height to fit all days */}
                <div className="flex-1 overflow-hidden border-2 border-black rounded-sm mb-4">
                  <table className="w-full border-collapse table-fixed h-full text-center">
                    <thead className="bg-slate-100 border-b-2 border-black font-black">
                      <tr className="h-9">
                        <th className="border-l-2 border-black w-12 text-[9pt]">اليوم</th>
                        <th className="border-l-2 border-black w-8 text-[8pt]">م</th>
                        <th className="border-l-2 border-black w-24 text-[9pt]">المادة</th>
                        <th className="border-l-2 border-black text-[9pt]">الدرس المقرر</th>
                        <th className="border-l-2 border-black text-[9pt]">الواجب</th>
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
                              <tr key={`${day.id}-${period}`} className={`h-[21px] border-b ${pIdx === PERIODS.length - 1 ? 'border-b-2 border-black' : 'border-slate-300'}`}>
                                {pIdx === 0 && (
                                  <td rowSpan={PERIODS.length} className="border-l-2 border-black font-black rotate-180 [writing-mode:vertical-rl] bg-white text-[8.5pt] tracking-widest leading-none border-b-2 border-black">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l-2 border-black text-[7.5pt] font-black">{period}</td>
                                <td className="border-l-2 border-black text-[8.5pt] font-black truncate px-1">{subject}</td>
                                <td className="border-l-2 border-black text-[8pt] leading-tight px-1 truncate">{plan.lesson || '-'}</td>
                                <td className="border-l-2 border-black text-[8pt] leading-tight px-1 truncate">{plan.homework || '-'}</td>
                                <td className="text-[7.5pt] leading-tight px-1 text-slate-400 truncate">{plan.enrichment || '-'}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Sections */}
                <div className="grid grid-cols-2 gap-4 h-[42mm]">
                   <div className="border-2 border-black p-3 bg-white">
                     <h3 className="text-[9.5pt] font-black mb-1 border-b border-black pb-0.5 text-center">رسائل وتوجيهات ولي الأمر</h3>
                     <p className="text-[8.5pt] font-bold leading-snug text-slate-700 whitespace-pre-wrap">{school.generalMessages || "- نرجو المتابعة المستمرة لمستوى الطالب\n- الحرص على الحضور المبكر"}</p>
                   </div>
                   <div className="border-2 border-black p-3 bg-white flex flex-col">
                     <h3 className="text-[9.5pt] font-black mb-1 border-b border-black pb-0.5 text-center">ملاحظات / نشاط أسبوعي</h3>
                     <div className="flex-1 flex flex-col items-center justify-center">
                       {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="max-h-[16mm] object-contain mb-1 opacity-50" />}
                       <p className="text-[8.5pt] font-bold text-center text-slate-600 leading-none">{school.weeklyNotes || "مدرستنا بيئة آمنة للتعلم"}</p>
                     </div>
                   </div>
                </div>
                
                <div className="mt-2 text-center border-t border-slate-100 pt-1 opacity-50">
                   <p className="text-[6.5pt] font-black text-slate-400">سجل متابعة الطالب: {student.name} - حقوق النشر محفوظة لمدرسة {school.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; overflow: hidden; }
          .student-page-container { 
            margin: 0 !important; 
            padding: 0 !important; 
            page-break-after: always !important; 
            break-after: page !important;
            height: 297mm;
          }
          .a4-page { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 auto !important; 
            padding: 10mm !important;
            width: 210mm !important;
            height: 297mm !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact;
          }
          table { border: 2px solid black !important; border-collapse: collapse !important; }
          .border-black { border-color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default BulkStudentPlans;
