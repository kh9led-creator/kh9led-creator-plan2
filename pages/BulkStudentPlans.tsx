
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { Printer, Book, User, GraduationCap } from 'lucide-react';
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
      <div className="max-w-[1100px] mx-auto p-6 no-print flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-50 border-b shadow-md">
        <div className="flex items-center gap-4">
           <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-100"><Printer size={28} /></div>
           <div>
              <h1 className="text-2xl font-black text-slate-800">محرك الطباعة الفردية</h1>
              <p className="text-sm text-slate-400 font-bold tracking-tight">توليد {studentsToPrint.length} ورقة طباعة شاملة</p>
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
              <div className="a4-page bg-white shadow-2xl p-[8mm] relative flex flex-col overflow-hidden" style={{ width: '210mm', height: '297mm' }}>
                
                {/* Header Section */}
                <div className="flex justify-between items-start mb-2 border-b-2 border-slate-900 pb-2">
                  <div className="space-y-0.5 text-right leading-tight min-w-[150px]">
                    {headerLines.map((line, i) => <p key={i} className={i === 0 ? 'text-[10pt] font-black underline underline-offset-2 mb-1' : 'text-[8.5pt] font-bold'}>{line}</p>)}
                  </div>
                  <div className="flex flex-col items-center">
                    {school.logoUrl ? (
                      <img src={school.logoUrl} className="w-16 h-16 object-contain" />
                    ) : (
                       <div className="w-16 h-16 bg-slate-50 border-2 border-dashed rounded-xl"></div>
                    )}
                  </div>
                  <div className="space-y-0.5 text-left text-[8.5pt] font-black" dir="ltr">
                    <p className="border-b border-slate-900 pb-0.5 mb-1">{school.name}</p>
                    <p>Class: {classTitle}</p>
                    <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                {/* Student Personal Info - NO PHONE NUMBER, SHOW FULL NAME CLEARLY */}
                <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center mb-3 shadow-lg border-b-4 border-blue-600">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-inner"><User size={24} /></div>
                      <div className="flex flex-col">
                        <span className="text-[9pt] font-black opacity-60 uppercase tracking-widest">اسم الطالب الرباعي:</span>
                        <span className="text-[14pt] font-black tracking-tight leading-tight">{student.name}</span>
                      </div>
                   </div>
                   <div className="text-left border-l border-white/20 pl-6">
                      <div className="text-[8pt] font-black opacity-40 mb-1 uppercase">بيانات الصف الدراسي</div>
                      <div className="text-[12pt] font-black text-blue-400">{classTitle}</div>
                   </div>
                </div>

                {/* Main Plan Table - 6 Columns Separated */}
                <div className="flex-1 overflow-hidden border-[1.5px] border-slate-900 rounded-sm mb-3">
                  <table className="w-full border-collapse table-fixed h-full">
                    <thead>
                      <tr className="bg-slate-100 border-b-[1.5px] border-slate-900">
                        <th className="border-l border-slate-900 p-1 text-[8.5pt] font-black w-10 text-center">اليوم</th>
                        <th className="border-l border-slate-900 p-1 text-[7.5pt] font-black w-6 text-center">م</th>
                        <th className="border-l border-slate-900 p-1 text-[9pt] font-black w-22 text-center">المادة</th>
                        <th className="border-l border-slate-900 p-1 text-[9pt] font-black w-44 text-center">الدرس المقرر</th>
                        <th className="border-l border-slate-900 p-1 text-[9pt] font-black text-center">الواجب</th>
                        <th className="p-1 text-[9pt] font-black w-36 text-center">الملاحظات</th>
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
                              <tr key={`${day.id}-${period}`} className={`h-[30px] border-b ${pIdx === PERIODS.length - 1 ? 'border-b-[1.5px] border-slate-900' : 'border-slate-200'}`}>
                                {pIdx === 0 && (
                                  <td rowSpan={PERIODS.length} className="border-l border-slate-900 p-0 text-center font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-slate-900 text-[8pt] tracking-widest leading-none">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l border-slate-900 p-0.5 text-center text-[7.5pt] font-black">{period}</td>
                                <td className="border-l border-slate-900 p-0.5 text-center text-[8pt] font-black truncate px-1">{subject}</td>
                                <td className="border-l border-slate-900 p-0.5 text-center text-[8.5pt] font-bold leading-tight px-1 overflow-hidden">{plan.lesson || '---'}</td>
                                <td className="border-l border-slate-900 p-0.5 text-center text-[7.5pt] font-medium leading-tight px-1 overflow-hidden">{plan.homework || '---'}</td>
                                <td className="p-0.5 text-center text-[7.5pt] font-medium leading-tight px-1 overflow-hidden text-slate-400">{plan.enrichment || '---'}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Section - Single Page Compatible */}
                <div className="grid grid-cols-2 gap-4 mt-auto h-[38mm]">
                   <div className="border-[1.5px] border-slate-900 p-3 rounded-xl bg-white overflow-hidden shadow-sm">
                     <h3 className="text-[9pt] font-black mb-1.5 border-b border-slate-900 pb-0.5 text-center uppercase tracking-tighter">توجيهات ولي الأمر</h3>
                     <p className="text-[8.5pt] font-bold leading-tight whitespace-pre-wrap text-slate-700">{school.generalMessages || "..."}</p>
                   </div>
                   <div className="border-[1.5px] border-slate-900 p-3 rounded-xl bg-white flex flex-col items-center overflow-hidden shadow-sm">
                     <h3 className="text-[9pt] font-black mb-1.5 border-b border-slate-900 pb-0.5 text-center w-full uppercase tracking-tighter">نشاط الأسبوع</h3>
                     <div className="flex-1 flex flex-col items-center justify-center w-full">
                       {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="max-h-[14mm] object-contain mb-1" />}
                       <p className="text-[9pt] font-black text-center text-blue-800 leading-none">{school.weeklyNotes || "..."}</p>
                     </div>
                   </div>
                </div>
                
                <div className="mt-3 text-center border-t border-slate-100 pt-2 opacity-50">
                   <p className="text-[7pt] font-black text-slate-400 italic">سجل المتابعة للطالب: {student.name} - حقوق النشر محفوظة لـ {school.name}</p>
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
