
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

  if (isLoading) return <div className="p-24 text-center font-black animate-pulse text-slate-400 text-2xl">جاري تحضير ملفات الطباعة...</div>;
  if (!school) return <div className="p-24 text-center font-black text-rose-500">عذراً، المدرسة غير موجودة.</div>;
  if (studentsToPrint.length === 0) return <div className="p-24 text-center font-black text-slate-400">لا يوجد طلاب مسجلين للطباعة.</div>;

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم").split('\n');

  return (
    <div className="bg-slate-100 min-h-screen font-['Tajawal']">
      <div className="max-w-[1100px] mx-auto p-6 no-print flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b shadow-md">
        <div className="flex items-center gap-4">
           <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-100"><Printer size={28} /></div>
           <div>
              <h1 className="text-2xl font-black text-slate-800">محرك الطباعة الفردية للطلاب</h1>
              <p className="text-sm text-slate-400 font-bold">سيتم توليد {studentsToPrint.length} ورقة طباعة منفصلة</p>
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-blue-100 flex items-center gap-3 hover:bg-blue-700 transition active:scale-95">
             ابدأ الطباعة الفورية
          </button>
        </div>
      </div>

      <div className="py-12">
        {studentsToPrint.map((student, sIdx) => {
          const classTitle = `${student.grade} - فصل ${student.section}`;
          const schedule = allSchedules[classTitle] || {};

          return (
            <div key={student.id} className="student-page-container mb-12">
              <div className="a4-page mx-auto bg-white shadow-2xl border p-[10mm] relative flex flex-col text-[10pt] min-h-[297mm]" style={{ width: '210mm' }}>
                
                {/* Header Branding */}
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-0.5 font-black text-slate-900 text-right leading-tight min-w-[180px]">
                    {headerLines.map((line, i) => <p key={i} className={i === 0 ? 'text-[10pt] mb-1 underline underline-offset-4 font-black' : 'text-[8pt]'}>{line}</p>)}
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-[10mm]">
                    {school.logoUrl ? (
                      <img src={school.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 border-2 border-dashed"><Book size={24} /></div>
                    )}
                  </div>
                  <div className="space-y-1 font-black text-left text-slate-900 text-[8pt]" dir="ltr">
                    <p className="font-black text-[9pt] border-b border-slate-900 pb-0.5 mb-1">{school.name}</p>
                    <p>Class: {classTitle}</p>
                    <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                {/* Individual Student Info Bar - NO PHONE NUMBER, ONLY FULL NAME */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl flex justify-between items-center mb-6 border-b-4 border-blue-600 shadow-lg">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-inner">
                        <User size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">اسم الطالب الكامل:</span>
                        <span className="text-xl font-black tracking-tight">{student.name}</span>
                      </div>
                   </div>
                   <div className="text-left border-l border-white/20 pl-6">
                     <div className="text-[9px] font-black opacity-40 mb-1 uppercase tracking-tighter">سجل المتابعة الأسبوعي الخاص</div>
                     <div className="text-[11pt] font-black text-blue-400">{classTitle}</div>
                   </div>
                </div>

                <div className="flex-1 overflow-hidden border-2 border-slate-900 rounded-sm mb-4">
                  <table className="w-full border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-slate-900">
                        <th className="border-l-2 border-slate-900 p-2 text-[9pt] font-black w-10 text-center">اليوم</th>
                        <th className="border-l-2 border-slate-900 p-2 text-[8pt] font-black w-7 text-center">م</th>
                        <th className="border-l-2 border-slate-900 p-2 text-[9pt] font-black w-24 text-center">المادة</th>
                        <th className="border-l-2 border-slate-900 p-2 text-[9pt] font-black text-center">الدرس المقرر</th>
                        <th className="p-2 text-[9pt] font-black w-48 text-center">الواجب والملاحظات</th>
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
                              <tr key={`${day.id}-${period}`} className={`h-9 border-b ${pIdx === PERIODS.length - 1 ? 'border-b-2 border-slate-900' : 'border-slate-200'}`}>
                                {pIdx === 0 && (
                                  <td rowSpan={PERIODS.length} className="border-l-2 border-slate-900 p-0 text-center font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-slate-900 text-[8pt] tracking-widest">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l-2 border-slate-900 p-1 text-center text-[8pt] font-black">{period}</td>
                                <td className="border-l-2 border-slate-900 p-1 text-center text-[9pt] font-black bg-slate-50/30 truncate px-2">{subject}</td>
                                <td className="border-l-2 border-slate-900 p-1 text-center text-[9pt] font-bold leading-tight px-2">{plan.lesson || '---'}</td>
                                <td className="p-1 text-center text-[8pt] leading-tight overflow-hidden px-2">
                                   {plan.homework || '---'}
                                   {plan.enrichment && <span className="block text-[7pt] opacity-60 mt-0.5">{plan.enrichment}</span>}
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
                <div className="grid grid-cols-2 gap-6 mt-auto">
                   <div className="border border-slate-300 p-3 rounded-xl bg-white min-h-[28mm] max-h-[32mm] overflow-hidden">
                     <h3 className="text-[8pt] font-black mb-1 border-b border-slate-200 pb-0.5 text-center">توجيهات ولي الأمر</h3>
                     <p className="text-[8pt] font-bold leading-tight whitespace-pre-wrap text-slate-600">{school.generalMessages || "..."}</p>
                   </div>
                   <div className="border border-slate-300 p-3 rounded-xl bg-white min-h-[28mm] max-h-[32mm] flex flex-col items-center overflow-hidden">
                     <h3 className="text-[8pt] font-black mb-1 border-b border-slate-200 pb-0.5 text-center w-full">نشاط الأسبوع</h3>
                     <div className="flex-1 flex flex-col items-center justify-center">
                        {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="max-h-[14mm] object-contain mb-1" />}
                        <p className="text-[8pt] font-black text-center text-blue-800 leading-none">{school.weeklyNotes || "..."}</p>
                     </div>
                   </div>
                </div>
                
                <div className="mt-6 text-center border-t border-slate-100 pt-3 opacity-50">
                   <p className="text-[7pt] font-black text-slate-400 italic tracking-wide">طالب: {student.name} - تم الإنشاء عبر منصة مدرستي - {school.name}</p>
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
          .student-page-container { margin-bottom: 60px; }
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
            padding: 10mm !important;
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
