
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DAYS, PERIODS, db, formatToHijri } from '../constants.tsx';
import { Printer, School as SchoolIcon, ArrowLeft, ArrowRight, GraduationCap, Calendar } from 'lucide-react';
import { School, Subject, AcademicWeek } from '../types.ts';

const PublicPlanView: React.FC = () => {
  const { schoolSlug } = useParams();
  const [school, setSchool] = useState<School | null>(null);
  const [plans, setPlans] = useState<any>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [schedule, setSchedule] = useState<any>({});
  const [activeWeek, setActiveWeek] = useState<AcademicWeek | undefined>(undefined);

  useEffect(() => {
    if (schoolSlug) {
      const s = db.getSchoolBySlug(schoolSlug);
      if (s) {
        setSchool(s);
        const week = db.getActiveWeek(s.id);
        setActiveWeek(week);
        setSubjects(db.getSubjects(s.id));
        if (week) setPlans(db.getPlans(s.id, week.id));
        const students = db.getStudents(s.id);
        const classes = Array.from(new Set(students.map(std => `${std.grade} - فصل ${std.section}`)));
        setAvailableClasses(classes);
      }
    }
  }, [schoolSlug]);

  useEffect(() => {
    if (school && selectedClass) setSchedule(db.getSchedule(school.id, selectedClass));
  }, [school, selectedClass]);

  if (!school) return <div className="p-24 text-center font-black animate-pulse text-indigo-400 text-2xl">جاري تهيئة البوابة التعليمية...</div>;

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم").split('\n');

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-['Tajawal'] pb-10 overflow-x-hidden">
      <header className="glass border-b border-slate-100 px-4 md:px-8 py-3 no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm border">
               {school.logoUrl ? <img src={school.logoUrl} className="w-10 h-10 object-contain" alt="شعار" /> : <SchoolIcon className="text-indigo-600" size={24} />}
            </div>
            <div className="text-right">
              <h1 className="text-lg font-black text-slate-900">{school.name}</h1>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">بوابة الخطط الأسبوعية</p>
            </div>
          </div>
          
          {selectedClass && (
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedClass("")} className="bg-white text-slate-600 px-4 py-2 rounded-xl font-black flex items-center gap-2 hover:bg-slate-50 border text-xs">
                <ArrowRight size={14} /> تغيير الفصل
              </button>
              <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black shadow-xl flex items-center gap-2 hover:bg-black text-xs">
                <Printer size={14} /> طباعة الخطة
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 flex flex-col items-center">
        {!selectedClass ? (
          <div className="w-full animate-in fade-in slide-in-from-bottom-5">
            <div className="text-center mb-10 space-y-2">
               <h2 className="text-3xl font-black text-slate-900">أهلاً بكم في فصولنا</h2>
               <p className="text-slate-400 font-bold">يرجى اختيار الفصل الدراسي لعرض الخطة المعتمدة</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableClasses.map((cls) => (
                <button key={cls} onClick={() => setSelectedClass(cls)} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                     <GraduationCap size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">{cls}</h3>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center py-4">
            <div className="origin-top scale-[0.45] sm:scale-[0.7] md:scale-100 mb-[-550px] sm:mb-[-150px] md:mb-0">
               <div className="a4-page bg-white shadow-2xl border p-[10mm] relative flex flex-col overflow-hidden" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
                
                {/* العلامة المائية - Watermark */}
                {school.logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.025] z-0 overflow-hidden">
                    <img src={school.logoUrl} className="w-[480px] h-[480px] object-contain grayscale" alt="علامة مائية" />
                  </div>
                )}

                {/* الترويسة - مصغرة جداً */}
                <div className="relative z-10 grid grid-cols-3 gap-2 mb-4 border-b-2 border-slate-900 pb-3 items-center">
                  <div className="text-right space-y-0.5 font-black text-[7.5pt] leading-tight text-slate-700">
                    {headerLines.map((line, i) => <p key={i}>{line}</p>)}
                    <p className="text-indigo-600 font-black pt-1">مدرسة: {school.name}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    {school.logoUrl ? <img src={school.logoUrl} className="w-14 h-14 object-contain" alt="شعار" /> : <div className="w-12 h-12 border border-dashed rounded-lg flex items-center justify-center text-[6pt] text-slate-300 font-black uppercase">Logo</div>}
                    <div className="mt-1 bg-slate-900 text-white px-3 py-0.5 rounded-full">
                      <span className="text-[6.5pt] font-black">الخطة الدراسية الأسبوعية</span>
                    </div>
                  </div>

                  <div className="text-left space-y-0.5 font-bold text-[8.5pt]">
                    <p className="flex items-center justify-end gap-1">الأسبوع: <span className="font-black text-indigo-700">{activeWeek?.name || "---"}</span></p>
                    <p className="flex items-center justify-end gap-1">الصف: <span className="font-black">{selectedClass}</span></p>
                    <p className="text-[7pt] text-slate-400 text-left font-black">التاريخ: {activeWeek ? `${formatToHijri(activeWeek.startDate)}` : '--'}</p>
                  </div>
                </div>

                {/* الجدول الدراسي - 7 حصص يومياً (35 حصة إجمالاً) */}
                <div className="relative z-10 flex-1 overflow-hidden border-[2.5px] border-slate-900 rounded-sm mb-4">
                  <table className="w-full border-collapse table-fixed h-full text-center">
                    <thead className="bg-slate-50 border-b-[2.5px] border-slate-900 font-black">
                      <tr className="h-9">
                        <th className="border-l-[2px] border-slate-900 w-12 text-[9pt] bg-slate-100">اليوم</th>
                        <th className="border-l-[1.5px] border-slate-900 w-7 text-[8pt]">م</th>
                        <th className="border-l-[1.5px] border-slate-900 w-24 text-[9pt]">المادة</th>
                        <th className="border-l-[1.5px] border-slate-900 text-[9pt]">الدرس المقرر</th>
                        <th className="border-l-[1.5px] border-slate-900 text-[9pt]">الواجب المنزلي</th>
                        <th className="w-24 text-[8pt] bg-slate-50/50">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((day) => (
                        <React.Fragment key={day.id}>
                          {PERIODS.map((period, pIdx) => {
                            const sched = schedule[`${day.id}_${period}`] || {};
                            const planKey = `${selectedClass}_${day.id}_${period}`;
                            const plan = plans[planKey] || {};
                            const subject = subjects.find(s => s.id === sched.subjectId)?.name || '-';
                            return (
                              <tr key={`${day.id}-${period}`} className={`h-[18.2px] border-b ${pIdx === 6 ? 'border-b-[2.5px] border-slate-900' : 'border-slate-300'}`}>
                                {pIdx === 0 && (
                                  <td rowSpan={7} className="border-l-[2.5px] border-slate-900 font-black rotate-180 [writing-mode:vertical-rl] bg-slate-100/30 text-[10pt] tracking-[0.1em] border-b-[2px] border-slate-900 leading-none">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l-[1.2px] border-slate-300 text-[9pt] font-black bg-slate-50/50">{period}</td>
                                <td className="border-l-[1.2px] border-slate-300 text-[9pt] font-black truncate px-1 text-indigo-900">{subject}</td>
                                <td className="border-l-[1.2px] border-slate-300 text-[8.5pt] leading-tight px-1.5 truncate font-bold text-slate-700 italic">{plan.lesson || '-'}</td>
                                <td className="border-l-[1.2px] border-slate-300 text-[8.5pt] leading-tight px-1.5 truncate font-bold text-slate-800">{plan.homework || '-'}</td>
                                <td className="text-[7pt] px-1 text-slate-400 font-black truncate italic leading-none">{plan.enrichment || '-'}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* صناديق المعلومات السفلية */}
                <div className="relative z-10 grid grid-cols-2 gap-5 h-[42mm]">
                   <div className="border-[2px] border-slate-900 p-3 bg-white rounded-xl shadow-sm">
                      <h3 className="text-[10pt] font-black mb-2 border-b-2 border-slate-900 pb-1 text-center bg-slate-50 rounded-md">توجيهات ولي الأمر</h3>
                      <p className="text-[8.5pt] font-bold leading-relaxed text-slate-700 whitespace-pre-wrap pr-1 overflow-hidden h-[28mm]">
                        {school.generalMessages || "١. المتابعة المستمرة لمنصة مدرستي.\n٢. الالتزام بالحضور الصباحي.\n٣. إحضار الكتب المدرسية يومياً."}
                      </p>
                   </div>
                   <div className="border-[2px] border-slate-900 p-3 bg-white rounded-xl shadow-sm">
                      <h3 className="text-[10pt] font-black mb-2 border-b-2 border-slate-900 pb-1 text-center bg-indigo-50 text-indigo-900 rounded-md">القيمة التربوية</h3>
                      <div className="flex flex-col items-center justify-center h-[28mm]">
                        {school.weeklyNotesImage && <img src={school.weeklyNotesImage} className="max-h-[16mm] object-contain mb-1" alt="قيمة" />}
                        <p className="text-[10pt] font-black text-center text-indigo-800 leading-snug px-2">
                          {school.weeklyNotes || "البيئة المدرسية الآمنة هي منطلق الإبداع والتميز"}
                        </p>
                      </div>
                   </div>
                </div>
                
                {/* سطر التذييل تم حذفه لزيادة المساحة بناءً على طلبك */}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicPlanView;
