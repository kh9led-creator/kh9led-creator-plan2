
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { Printer, Book, User } from 'lucide-react';
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

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم").split('\n');

  return (
    <div className="bg-slate-100 min-h-screen font-['Tajawal'] pb-10">
      <div className="max-w-[1100px] mx-auto p-6 no-print flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b shadow-sm">
        <div className="flex items-center gap-4">
           <div className="bg-blue-600 p-2.5 rounded-xl text-white"><Printer size={24} /></div>
           <div>
              <h1 className="text-xl font-black text-slate-800">محرك الطباعة الفردية للطلاب</h1>
              <p className="text-xs text-slate-400 font-bold">توليد {studentsToPrint.length} صفحة طباعة</p>
           </div>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-lg hover:bg-blue-700 transition">
             ابدأ الطباعة الآن
        </button>
      </div>

      <div className="py-6 space-y-10">
        {studentsToPrint.map((student) => {
          const classTitle = `${student.grade} - فصل ${student.section}`;
          const schedule = allSchedules[classTitle] || {};

          return (
            <div key={student.id} className="student-page-container flex justify-center">
              <div className="a4-page bg-white shadow-2xl p-[6mm] relative flex flex-col" style={{ width: '210mm', height: '297mm' }}>
                
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-0 text-right leading-tight min-w-[150px]">
                    {headerLines.map((line, i) => <p key={i} className={i === 0 ? 'text-[9pt] font-black underline underline-offset-2' : 'text-[8pt] font-bold'}>{line}</p>)}
                  </div>
                  <div className="flex flex-col items-center">
                    {school.logoUrl && <img src={school.logoUrl} className="w-14 h-14 object-contain" />}
                  </div>
                  <div className="space-y-0 text-left text-[8pt] font-black" dir="ltr">
                    <p className="border-b border-slate-900 pb-0.5">{school.name}</p>
                    <p>Class: {classTitle}</p>
                    <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                {/* Student Info Bar - FULL NAME ONLY */}
                <div className="bg-slate-900 text-white p-3 rounded-lg flex justify-between items-center mb-2 shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white"><User size={20} /></div>
                      <div className="flex flex-col">
                        <span className="text-[8pt] font-black opacity-60">اسم الطالب:</span>
                        <span className="text-[12pt] font-black tracking-tight leading-none">{student.name}</span>
                      </div>
                   </div>
                   <div className="text-left border-l border-white/20 pl-4">
                     <span className="text-[10pt] font-black text-blue-400">{classTitle}</span>
                   </div>
                </div>

                {/* Table with specific 6 columns: اليوم | م | المادة | الدرس المقرر | الواجب | الملاحظات */}
                <div className="flex-1 overflow-hidden border-[1.5px] border-slate-900 rounded-sm">
                  <table className="w-full border-collapse table-fixed h-full">
                    <thead>
                      <tr className="bg-slate-100 border-b-[1.5px] border-slate-900">
                        <th className="border-l border-slate-900 p-1 text-[8pt] font-black w-8 text-center">اليوم</th>
                        <th className="border-l border-slate-900 p-1 text-[7pt] font-black w-5 text-center">م</th>
                        <th className="border-l border-slate-900 p-1 text-[8pt] font-black w-20 text-center">المادة</th>
                        <th className="border-l border-slate-900 p-1 text-[8pt] font-black w-40 text-center">الدرس المقرر</th>
                        <th className="border-l border-slate-900 p-1 text-[8pt] font-black text-center">الواجب</th>
                        <th className="p-1 text-[8pt] font-black w-32 text-center">الملاحظات</th>
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
                              <tr key={`${day.id}-${period}`} className={`h-7 border-b ${pIdx === PERIODS.length - 1 ? 'border-b-[1.5px] border-slate-900' : 'border-slate-200'}`}>
                                {pIdx === 0 && (
                                  <td rowSpan={PERIODS.length} className="border-l border-slate-900 p-0 text-center font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-slate-900 text-[7pt] tracking-widest leading-none">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l border-slate-900 p-0.5 text-center text-[7pt] font-black">{period}</td>
                                <td className="border-l border-slate-900 p-0.5 text-center text-[7.5pt] font-black truncate px-1">{subject}</td>
                                <td className="border-l border-slate-900 p-0.5 text-center text-[7.5pt] font-bold leading-tight px-1">{plan.lesson || '---'}</td>
                                <td className="border-l border-slate-900 p-0.5 text-center text-[7pt] font-medium leading-tight px-1 overflow-hidden">{plan.homework || '---'}</td>
                                <td className="p-0.5 text-center text-[7pt] font-medium leading-tight px-1 overflow-hidden text-slate-400">{plan.enrichment || '---'}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Section */}
                <div className="grid grid-cols-2 gap-3 mt-2 h-[28mm]">
                   <div className="border-[1.5px] border-slate-900 p-2 rounded-lg bg-white overflow-hidden">
                     <h3 className="text-[7.5pt] font-black mb-1 border-b border-slate-900 pb-0.5 text-center uppercase">توجيهات ولي الأمر</h3>
                     <p className="text-[7pt] font-bold leading-tight whitespace-pre-wrap text-slate-700">{school.generalMessages || "..."}</p>
                   </div>
                   <div className="border-[1.5px] border-slate-900 p-2 rounded-lg bg-white flex flex-col items-center overflow-hidden">
                     <h3 className="text-[7.5pt] font-black mb-1 border-b border-slate-900 pb-0.5 text-center w-full uppercase">نشاط الأسبوع</h3>
                     <div className="flex-1 flex flex-col items-center justify-center w-full">
                       {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="max-h-[10mm] object-contain mb-1" />}
                       <p className="text-[7.5pt] font-black text-center text-blue-800 leading-none">{school.weeklyNotes || "..."}</p>
                     </div>
                   </div>
                </div>
                
                <div className="mt-2 text-center border-t border-slate-100 pt-1 opacity-50">
                   <p className="text-[6.5pt] font-black text-slate-400 italic">خطة الطالب: {student.name} - تم الإنشاء عبر بوابة الخطط الأسبوعية الموحدة</p>
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
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
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
            padding: 6mm !important;
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
