
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DAYS, PERIODS, db, formatToHijri } from '../constants.tsx';
import { Printer, Book, LayoutGrid, School as SchoolIcon, ArrowLeft, ArrowRight, GraduationCap, Calendar, QrCode } from 'lucide-react';
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
        
        if (week) {
          setPlans(db.getPlans(s.id, week.id));
        }

        const students = db.getStudents(s.id);
        const classes = Array.from(new Set(students.map(std => `${std.grade} - فصل ${std.section}`)));
        setAvailableClasses(classes);
      }
    }
  }, [schoolSlug]);

  useEffect(() => {
    if (school && selectedClass) {
      setSchedule(db.getSchedule(school.id, selectedClass));
    }
  }, [school, selectedClass]);

  if (!school) return <div className="p-24 text-center font-black animate-pulse text-indigo-400 text-2xl">جاري تهيئة البوابة التعليمية...</div>;

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم").split('\n');

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-['Tajawal'] pb-10 md:pb-20 overflow-x-hidden">
      {/* الترويسة العلوية للموقع */}
      <header className="glass border-b border-slate-100 px-4 md:px-8 py-4 md:py-5 no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="bg-white p-2 md:p-3 rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
               {school.logoUrl ? (
                <img src={school.logoUrl} className="w-10 h-10 md:w-14 md:h-14 object-contain" alt="شعار المدرسة" />
               ) : (
                <SchoolIcon className="text-indigo-600" size={32} />
               )}
            </div>
            <div className="text-right">
              <h1 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">{school.name}</h1>
              <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                 <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <p className="text-[8px] md:text-[10px] text-indigo-600 font-black uppercase tracking-widest">بوابة الخطط الدراسية الأسبوعية</p>
              </div>
            </div>
          </div>
          
          {selectedClass && (
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              <button 
                onClick={() => setSelectedClass("")} 
                className="flex-1 md:flex-none bg-white text-slate-600 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-50 border border-slate-200 transition-all text-xs md:text-sm"
              >
                <ArrowRight size={16} /> تغيير الفصل
              </button>
              <button 
                onClick={() => window.print()} 
                className="flex-1 md:flex-none bg-slate-900 text-white px-4 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black shadow-xl shadow-slate-200 flex items-center justify-center gap-2 hover:bg-black transition-all text-xs md:text-sm"
              >
                <Printer size={16} /> طباعة الخطة
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-10 lg:p-16 flex flex-col items-center">
        {!selectedClass ? (
          <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="text-center mb-10 md:mb-16 space-y-3 md:space-y-4">
               <h2 className="text-3xl md:text-5xl font-black text-slate-900">أهلاً بكم في فصولنا</h2>
               <p className="text-slate-400 font-bold text-base md:text-xl max-w-xl mx-auto leading-relaxed">
                  {activeWeek ? `عرض خطة ${activeWeek.name} - الفترة من ${formatToHijri(activeWeek.startDate)} إلى ${formatToHijri(activeWeek.endDate)}` : 'يرجى اختيار الفصل الدراسي لعرض وتحميل الخطة الأسبوعية المعتمدة.'}
               </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {availableClasses.map((cls) => (
                <button 
                  key={cls} 
                  onClick={() => setSelectedClass(cls)} 
                  className="group bg-white p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-2 transition-all duration-700 text-center flex flex-col items-center gap-6 md:gap-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-indigo-50/50 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 group-hover:bg-indigo-600 transition-colors duration-700"></div>
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-indigo-50 text-indigo-600 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 relative z-10 shadow-inner">
                     <GraduationCap size={32} />
                  </div>
                  <div className="relative z-10">
                     <h3 className="text-xl md:text-3xl font-black text-slate-800 mb-1 md:mb-2">{cls}</h3>
                     <p className="text-slate-400 font-bold flex items-center justify-center gap-2 text-sm">
                        عرض الخطة <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" />
                     </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center overflow-x-auto py-4">
            <div className="origin-top scale-[0.45] sm:scale-[0.7] md:scale-100 mb-[-450px] sm:mb-[-150px] md:mb-0">
               <div className="a4-page bg-white shadow-2xl border p-[10mm] relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-700" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
                
                {/* العلامة المائية - Watermark */}
                {school.logoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0 overflow-hidden">
                    <img src={school.logoUrl} className="w-[500px] h-[500px] object-contain grayscale" alt="شعار الخلفية" />
                  </div>
                )}

                {/* ترويسة الصفحة الرسمية */}
                <div className="relative z-10 grid grid-cols-3 gap-2 mb-4 border-b-4 border-double border-slate-900 pb-4 items-center">
                  <div className="text-right space-y-1 font-black text-[9.5pt] leading-tight text-slate-800">
                    {headerLines.map((line, i) => <p key={i}>{line}</p>)}
                    <p className="text-indigo-600 pt-1">مدرسة: {school.name}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center scale-110">
                    {school.logoUrl ? (
                      <img src={school.logoUrl} className="w-20 h-20 object-contain drop-shadow-md" alt="Logo" />
                    ) : (
                      <div className="w-16 h-16 border-4 border-double rounded-2xl flex items-center justify-center text-slate-300 font-black">شعار</div>
                    )}
                    <div className="mt-2 bg-slate-900 text-white px-4 py-0.5 rounded-full">
                      <span className="text-[7.5pt] font-black tracking-widest uppercase">الخطة الدراسية الأسبوعية</span>
                    </div>
                  </div>

                  <div className="text-left space-y-1.5 font-bold text-[9pt]">
                    <p className="flex items-center justify-end gap-2">الأسبوع الدراسي: <span className="font-black text-indigo-700 underline underline-offset-4">{activeWeek?.name || "---"}</span></p>
                    <p className="flex items-center justify-end gap-2">الصف الدراسي: <span className="font-black underline">{selectedClass}</span></p>
                    <p className="text-[7.5pt] text-slate-400 font-black text-left">الفترة: {activeWeek ? `${formatToHijri(activeWeek.startDate)} - ${formatToHijri(activeWeek.endDate)}` : '--'}</p>
                  </div>
                </div>

                {/* جدول الحصص الأسبوعي - 7 حصص لكل يوم */}
                <div className="relative z-10 flex-1 overflow-hidden border-[2.5px] border-slate-900 rounded-sm mb-4 bg-white/50">
                  <table className="w-full border-collapse table-fixed h-full text-center">
                    <thead className="bg-slate-100 border-b-[2.5px] border-slate-900 font-black">
                      <tr className="h-10">
                        <th className="border-l-[2px] border-slate-900 w-14 text-[10pt] bg-slate-200">اليوم</th>
                        <th className="border-l-[1.5px] border-slate-900 w-8 text-[9pt]">م</th>
                        <th className="border-l-[1.5px] border-slate-900 w-28 text-[10pt]">المادة</th>
                        <th className="border-l-[1.5px] border-slate-900 text-[10pt]">الدرس المقرر</th>
                        <th className="border-l-[1.5px] border-slate-900 text-[10pt]">الواجب المنزلي</th>
                        <th className="w-28 text-[9pt] bg-slate-50">ملاحظات</th>
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
                              <tr key={`${day.id}-${period}`} className={`h-[18.2px] border-b ${pIdx === PERIODS.length - 1 ? 'border-b-[2px] border-slate-900' : 'border-slate-300'}`}>
                                {pIdx === 0 && (
                                  <td rowSpan={PERIODS.length} className="border-l-[2.5px] border-slate-900 font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-[10.5pt] tracking-[0.2em] leading-none border-b-[2px] border-slate-900">
                                    {day.label}
                                  </td>
                                )}
                                <td className="border-l-[1.5px] border-slate-900 text-[9.5pt] font-black bg-slate-50/50">{period}</td>
                                <td className="border-l-[1.5px] border-slate-900 text-[9.5pt] font-black truncate px-1 text-indigo-900">{subject}</td>
                                <td className="border-l-[1.5px] border-slate-900 text-[9pt] leading-snug px-2 truncate font-bold text-slate-700 italic">{plan.lesson || '-'}</td>
                                <td className="border-l-[1.5px] border-slate-900 text-[9pt] leading-snug px-2 truncate font-bold text-slate-800">{plan.homework || '-'}</td>
                                <td className="text-[8pt] leading-tight px-1 text-slate-400 font-black italic truncate bg-slate-50/30">{plan.enrichment || '-'}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* تذييل الصفحة - التوجيهات والقيمة */}
                <div className="relative z-10 grid grid-cols-2 gap-4 h-[42mm]">
                   <div className="border-[2px] border-slate-900 p-4 bg-white flex flex-col shadow-sm rounded-xl">
                      <h3 className="text-[10.5pt] font-black mb-3 border-b-2 border-slate-900 pb-1 text-center bg-slate-100 rounded-md">توجيهات لولي الأمر</h3>
                      <p className="text-[9pt] font-bold leading-relaxed text-slate-700 whitespace-pre-wrap flex-1 overflow-hidden pr-2">
                        {school.generalMessages || "١. المتابعة المستمرة لمنصة مدرستي.\n٢. الالتزام بالحضور الصباحي المبكر.\n٣. التأكد من إحضار كافة الكتب يومياً."}
                      </p>
                   </div>
                   
                   <div className="border-[2px] border-slate-900 p-4 bg-white flex flex-col shadow-sm rounded-xl">
                      <h3 className="text-[10.5pt] font-black mb-3 border-b-2 border-slate-900 pb-1 text-center bg-indigo-50 text-indigo-900 rounded-md">القيمة التربوية للأسبوع</h3>
                      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                        {school.weeklyNotesImage && (
                           <img src={school.weeklyNotesImage} className="max-h-[20mm] object-contain mb-2" alt="قيمة الأسبوع" />
                        )}
                        <p className="text-[10pt] font-black text-center text-indigo-800 leading-snug">
                          {school.weeklyNotes || "البيئة المدرسية الآمنة هي منطلق الإبداع والتميز"}
                        </p>
                      </div>
                   </div>
                </div>
                
                {/* حقوق الحقوق والتذييل الفني */}
                <div className="relative z-10 mt-auto pt-4 flex justify-between items-center px-4 border-t border-slate-100 opacity-60">
                   <p className="text-[7pt] font-black text-slate-500 uppercase tracking-tighter">
                     خطة الأسبوع الموحدة - {school.name}
                   </p>
                   <div className="flex items-center gap-2 text-[7pt] font-black text-indigo-600">
                      نظام الخطط المدرسية الرقمي - {new Date().getFullYear()}
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicPlanView;
