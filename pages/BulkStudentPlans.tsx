
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { Printer, Book, Users, ArrowRight } from 'lucide-react';
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

        // تحميل جميع الجداول للفصول الموجودة
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

  if (isLoading) return <div className="p-24 text-center font-black animate-pulse text-slate-400">جاري تحضير ملفات الطباعة...</div>;
  if (!school) return <div className="p-24 text-center font-black text-rose-500">عذراً، المدرسة غير موجودة.</div>;
  if (studentsToPrint.length === 0) return <div className="p-24 text-center font-black text-slate-400">لا يوجد طلاب مسجلين للطباعة.</div>;

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم").split('\n');

  return (
    <div className="bg-slate-100 min-h-screen font-['Tajawal']">
      {/* Top Controller Bar */}
      <div className="max-w-[1100px] mx-auto p-6 no-print flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b shadow-sm">
        <div className="flex items-center gap-4">
           <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100"><Printer size={24} /></div>
           <div>
              <h1 className="text-xl font-black text-slate-800">محرك الطباعة الفردية للطلاب</h1>
              <p className="text-xs text-slate-400 font-bold">سيتم توليد {studentsToPrint.length} صفحة طباعة</p>
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black shadow-xl shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition active:scale-95">
             ابدأ الطباعة الآن
          </button>
        </div>
      </div>

      <div className="py-10">
        {studentsToPrint.map((student, sIdx) => {
          const classTitle = `${student.grade} - فصل ${student.section}`;
          const schedule = allSchedules[classTitle] || {};

          return (
            <div key={student.id} className="student-page-container mb-10">
              <div className="a4-page mx-auto bg-white shadow-2xl border p-[12mm] relative overflow-hidden text-[10pt] min-h-[296mm]" style={{ maxWidth: '210mm' }}>
                
                {/* Header Branding */}
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-0.5 font-black text-slate-900 text-right leading-tight min-w-[150px]">
                    {headerLines.map((line, i) => <p key={i} className={i === 0 ? 'text-lg mb-1 underline underline-offset-4' : 'text-sm'}>{line}</p>)}
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-[12mm]">
                    {school.logoUrl ? (
                      <img src={school.logoUrl} alt="Logo" className="w-20 h-20 object-contain" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 border-2 border-dashed"><Book size={24} /></div>
                    )}
                  </div>
                  <div className="space-y-1 font-black text-left text-slate-900 text-xs" dir="ltr">
                    <p>School: {school.name}</p>
                    <p>Class: {classTitle}</p>
                    <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                {/* Individual Student Info Bar */}
                <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center mb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">{sIdx + 1}</div>
                      <span className="text-lg font-black tracking-tight">اسم الطالب: {student.name}</span>
                   </div>
                   <div className="text-xs font-bold opacity-60">الخطة الأسبوعية المخصصة</div>
                </div>

                <div className="overflow-hidden border-2 border-slate-900 rounded-sm mb-6">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-slate-900">
                        <th className="border-l-2 border-slate-900 p-2 text-xs font-black w-20">اليوم</th>
                        <th className="border-l-2 border-slate-900 p-2 text-[8pt] font-black w-8">م</th>
                        <th className="border-l-2 border-slate-900 p-2 text-xs font-black w-32">المادة</th>
                        <th className="border-l-2 border-slate-900 p-2 text-xs font-black">الدرس المقرر</th>
                        <th className="p-2 text-xs font-black">الواجب والمهام</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((day) => (
                        <React.Fragment key={day.id}>
                          {PERIODS.map((period, pIdx) => {
                            const sched = schedule[`${day.id}_${period}`] || {};
                            const planKey = `${classTitle}_${day.id}_${period}`;
                            const plan = allPlans[planKey] || {};
                            const subject = subjects.find(s => s.id === sched.subjectId)?.name || '---';
                            
                            return (
                              <tr key={`${day.id}-${period}`} className={`h-10 border-b ${pIdx === PERIODS.length - 1 ? 'border-b-2 border-slate-900' : 'border-slate-200'}`}>
                                {pIdx === 0 && (
                                  <td rowSpan={PERIODS.length} className="border-l-2 border-slate-900 p-2 text-center font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-slate-900 text-xs tracking-widest">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l-2 border-slate-900 p-1 text-center text-[8pt] font-black">{period}</td>
                                <td className="border-l-2 border-slate-900 p-1 text-center text-[9pt] font-black bg-slate-50/30">{subject}</td>
                                <td className="border-l-2 border-slate-900 p-1 text-center text-[9pt] font-bold leading-tight">{plan.lesson || '---'}</td>
                                <td className="p-1 text-center text-[8pt] leading-tight">
                                   {plan.homework && <div className="text-slate-900 font-black">{plan.homework}</div>}
                                   {!plan.homework && '---'}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Single Page Footer Branding */}
                <div className="grid grid-cols-2 gap-4 mt-auto">
                   <div className="border border-slate-300 p-4 rounded-xl bg-white min-h-[30mm]">
                     <h3 className="text-[8pt] font-black mb-1 border-b border-slate-200 pb-0.5 text-center">توجيهات لولي الأمر</h3>
                     <p className="text-[8pt] font-bold leading-relaxed whitespace-pre-wrap text-slate-600">{school.generalMessages || "..."}</p>
                   </div>
                   <div className="border border-slate-300 p-4 rounded-xl bg-white min-h-[30mm] flex flex-col items-center">
                     <h3 className="text-[8pt] font-black mb-2 border-b border-slate-200 pb-0.5 text-center w-full">نشاط الأسبوع</h3>
                     {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="max-h-[20mm] object-contain mb-1" />}
                     <p className="text-[8pt] font-black text-center text-blue-800">{school.weeklyNotes}</p>
                   </div>
                </div>
                
                <div className="mt-6 text-center border-t border-slate-100 pt-3 opacity-40">
                   <p className="text-[7pt] font-bold text-slate-400 italic">تم إنشاء هذه الخطة الفردية للطالب: {student.name} عبر منصة مدرستي</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media screen {
          .student-page-container {
            margin-bottom: 40px;
          }
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .student-page-container {
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .a4-page { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 !important; 
            padding: 10mm !important;
            width: 100% !important;
            height: 100vh !important;
            max-width: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default BulkStudentPlans;
