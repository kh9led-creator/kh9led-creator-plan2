
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { Printer, Book, Users, ArrowRight, User } from 'lucide-react';
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

  if (isLoading) return <div className="p-24 text-center font-black animate-pulse text-slate-400">جاري تحضير ملفات الطباعة...</div>;
  if (!school) return <div className="p-24 text-center font-black text-rose-500">عذراً، المدرسة غير موجودة.</div>;
  if (studentsToPrint.length === 0) return <div className="p-24 text-center font-black text-slate-400">لا يوجد طلاب مسجلين للطباعة.</div>;

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم").split('\n');

  return (
    <div className="bg-slate-100 min-h-screen font-['Tajawal']">
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
              <div className="a4-page mx-auto bg-white shadow-2xl border p-[8mm] relative flex flex-col text-[10pt] min-h-[297mm]" style={{ width: '210mm' }}>
                
                {/* Header Branding */}
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-0 font-black text-slate-900 text-right leading-tight min-w-[150px]">
                    {headerLines.map((line, i) => <p key={i} className={i === 0 ? 'text-[9pt] mb-0.5 underline underline-offset-4' : 'text-[8pt]'}>{line}</p>)}
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-[8mm]">
                    {school.logoUrl ? (
                      <img src={school.logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
                    ) : (
                      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 border-2 border-dashed"><Book size={20} /></div>
                    )}
                  </div>
                  <div className="space-y-0.5 font-black text-left text-slate-900 text-[8pt]" dir="ltr">
                    <p>School: {school.name}</p>
                    <p>Class: {classTitle}</p>
                    <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                {/* Individual Student Info Bar - Updated to show full name prominently */}
                <div className="bg-slate-900 text-white p-3 rounded-xl flex justify-between items-center mb-4 border-b-4 border-blue-600">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm">
                        <User size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">اسم الطالب الكامل:</span>
                        <span className="text-base font-black tracking-tight">{student.name}</span>
                      </div>
                   </div>
                   <div className="text-left">
                     <div className="text-[8px] font-black opacity-40 mb-0.5">سجل المتابعة الأسبوعي</div>
                     <div className="text-[10pt] font-black text-blue-400">{classTitle}</div>
                   </div>
                </div>

                <div className="flex-1 overflow-hidden border-2 border-slate-900 rounded-sm mb-4">
                  <table className="w-full border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-slate-900">
                        <th className="border-l-2 border-slate-900 p-1 text-[8pt] font-black w-8">اليوم</th>
                        <th className="border-l-2 border-slate-900 p-1 text-[7pt] font-black w-6">م</th>
                        <th className="border-l-2 border-slate-900 p-1 text-[8pt] font-black w-24">المادة</th>
                        <th className="border-l-2 border-slate-900 p-1 text-[8pt] font-black">الدرس المقرر</th>
                        <th className="p-1 text-[8pt] font-black w-32">الواجب</th>
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
                              <tr key={`${day.id}-${period}`} className={`h-8 border-b ${pIdx === PERIODS.length - 1 ? 'border-b-2 border-slate-900' : 'border-slate-200'}`}>
                                {pIdx === 0 && (
                                  <td rowSpan={PERIODS.length} className="border-l-2 border-slate-900 p-0 text-center font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-slate-900 text-[7pt] tracking-widest">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l-2 border-slate-900 p-0.5 text-center text-[7pt] font-black">{period}</td>
                                <td className="border-l-2 border-slate-900 p-0.5 text-center text-[8pt] font-black bg-slate-50/30 truncate px-1">{subject}</td>
                                <td className="border-l-2 border-slate-900 p-0.5 text-center text-[8pt] font-bold leading-none truncate px-1">{plan.lesson || '---'}</td>
                                <td className="p-0.5 text-center text-[7pt] leading-tight overflow-hidden truncate px-1">
                                   {plan.homework || '---'}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Notes */}
                <div className="grid grid-cols-2 gap-4 mt-auto">
                   <div className="border border-slate-300 p-2 rounded-lg bg-white min-h-[25mm] max-h-[30mm] overflow-hidden">
                     <h3 className="text-[7pt] font-black mb-1 border-b border-slate-200 pb-0.5 text-center">توجيهات ولي الأمر</h3>
                     <p className="text-[7pt] font-bold leading-tight whitespace-pre-wrap text-slate-600">{school.generalMessages || "..."}</p>
                   </div>
                   <div className="border border-slate-300 p-2 rounded-lg bg-white min-h-[25mm] max-h-[30mm] flex flex-col items-center overflow-hidden">
                     <h3 className="text-[7pt] font-black mb-1 border-b border-slate-200 pb-0.5 text-center w-full">نشاط الأسبوع</h3>
                     {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="max-h-[12mm] object-contain mb-1" />}
                     <p className="text-[7pt] font-black text-center text-blue-800 leading-none">{school.weeklyNotes}</p>
                   </div>
                </div>
                
                <div className="mt-4 text-center border-t border-slate-100 pt-2 opacity-40">
                   <p className="text-[6pt] font-bold text-slate-400 italic">طالب: {student.name} - تم الإنشاء عبر منصة مدرستي</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media screen {
          .student-page-container { margin-bottom: 40px; }
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; overflow: hidden; }
          .student-page-container {
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            height: 297mm;
            overflow: hidden;
          }
          .a4-page { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 auto !important; 
            padding: 8mm !important;
            width: 210mm !important;
            height: 297mm !important;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
};

export default BulkStudentPlans;
