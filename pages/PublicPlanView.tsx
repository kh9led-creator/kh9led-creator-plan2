
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { Printer, Book, LayoutGrid, School as SchoolIcon } from 'lucide-react';
import { School, Subject } from '../types.ts';

const PublicPlanView: React.FC = () => {
  const { schoolSlug } = useParams();
  const [school, setSchool] = useState<School | null>(null);
  const [plans, setPlans] = useState<any>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [schedule, setSchedule] = useState<any>({});

  useEffect(() => {
    if (schoolSlug) {
      const s = db.getSchoolBySlug(schoolSlug);
      if (s) {
        setSchool(s);
        setPlans(db.getPlans(s.id));
        setSubjects(db.getSubjects(s.id));
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

  if (!school) return <div className="p-24 text-center font-black animate-pulse text-slate-400 text-2xl">جاري تحميل البوابة التعليمية...</div>;

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم\nمدرسة أحد الابتدائية").split('\n');

  return (
    <div className="bg-slate-50 min-h-screen font-['Tajawal'] pb-20">
      <header className="bg-white border-b px-6 py-4 no-print sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {school.logoUrl ? (
              <img src={school.logoUrl} className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white"><SchoolIcon size={24} /></div>
            )}
            <div className="text-right">
              <h1 className="text-xl font-black text-slate-900">{school.name}</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">بوابة الخطط الأسبوعية المعتمدة</p>
            </div>
          </div>
          
          {selectedClass && (
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedClass("")} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition text-sm">
                <LayoutGrid size={16} /> تغيير الفصل
              </button>
              <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black shadow-lg flex items-center gap-2 hover:bg-black transition text-sm">
                <Printer size={16} /> طباعة الخطة
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-10 flex justify-center">
        {!selectedClass ? (
          <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center mb-10">
               <h2 className="text-4xl font-black text-slate-800 mb-3">اختر الفصل الدراسي</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableClasses.map((cls) => (
                <button key={cls} onClick={() => setSelectedClass(cls)} className="group bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all text-center flex flex-col items-center gap-5">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                     <Book size={44} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">{cls}</h3>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* A4 Report Simulation - Exact Copy of Attachment */
          <div className="a4-page bg-white shadow-2xl border p-[8mm] relative flex flex-col text-[10pt] overflow-hidden" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
            
            {/* Header Branding (3 Columns) */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {/* Left Info Column */}
              <div className="text-right space-y-0.5 font-bold text-[9pt]">
                <p>من:</p>
                <p>إلى:</p>
                <p>الأسبوع: الأسبوع الأول</p>
                <p>الصف: {selectedClass}</p>
                <p>الفصل الدراسي الأول</p>
              </div>

              {/* Center Logo Column */}
              <div className="flex flex-col items-center justify-center">
                {school.logoUrl ? (
                  <img src={school.logoUrl} alt="Ministry Logo" className="w-20 h-20 object-contain" />
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-200">Logo</div>
                )}
              </div>

              {/* Right School Info Column */}
              <div className="text-right space-y-0.5 font-black text-[9pt] leading-tight">
                {headerLines.map((line, i) => <p key={i}>{line}</p>)}
              </div>
            </div>

            {/* Plan Table - Exact Structure */}
            <div className="flex-1 overflow-hidden border-2 border-black">
              <table className="w-full border-collapse table-fixed h-full text-center">
                <thead className="border-b-2 border-black font-black bg-slate-50">
                  <tr className="h-10">
                    <th className="border-l-2 border-black w-10 text-[9pt]">اليوم</th>
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
                        const plan = plans[`${selectedClass}_${day.id}_${period}`] || {};
                        const subject = subjects.find(s => s.id === sched.subjectId)?.name || '-';
                        
                        return (
                          <tr key={`${day.id}-${period}`} className={`h-[32px] border-b ${pIdx === PERIODS.length - 1 ? 'border-b-2 border-black' : 'border-slate-200'}`}>
                            {pIdx === 0 && (
                              <td rowSpan={PERIODS.length} className="border-l-2 border-black font-black rotate-180 [writing-mode:vertical-rl] bg-white text-[9pt] tracking-widest leading-none border-b-2 border-black">
                                {day.label}
                              </td>
                            )}
                            <td className="border-l-2 border-black text-[8pt] font-black">{period}</td>
                            <td className="border-l-2 border-black text-[9pt] font-bold px-1">{subject}</td>
                            <td className="border-l-2 border-black text-[9pt] px-1">{plan.lesson || '-'}</td>
                            <td className="border-l-2 border-black text-[9pt] px-1">{plan.homework || '-'}</td>
                            <td className="text-[9pt] px-1 text-slate-400 italic">{plan.enrichment || '-'}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer boxes - Exactly like attachment */}
            <div className="grid grid-cols-2 gap-4 mt-4 h-[55mm]">
               {/* Messages Box (Right) */}
               <div className="border-2 border-black p-3 bg-white flex flex-col">
                  <h3 className="text-[10pt] font-black border-b border-black pb-1 mb-2 text-center">رسائل وتوجيهات عامة</h3>
                  <div className="text-[9pt] font-bold leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {school.generalMessages || "( رسالة عامة )\n- عزيزي ولي أمر الطالب احرص على عدم غياب ابنك\n- عزيزي الطالب احرص على دخولك لمنصة مدرستي يوميا"}
                  </div>
               </div>

               {/* Activity Box (Left) */}
               <div className="border-2 border-black p-3 bg-white flex flex-col">
                  <h3 className="text-[10pt] font-black border-b border-black pb-1 mb-2 text-center">ملاحظات / نشاط أسبوعي</h3>
                  <div className="flex-1 overflow-hidden relative">
                    {school.weeklyNotesImage && (
                       <img src={school.weeklyNotesImage} className="max-h-[25mm] w-full object-contain mb-2 opacity-50" />
                    )}
                    <div className="text-[9pt] font-bold text-slate-600 leading-tight">
                       {school.weeklyNotes || "- الاهتمام بالحضور وعدم الغياب\n- إحضار الكتب والأدوات المدرسية\n- اجعل حقيبة الطالب مثالية"}
                    </div>
                  </div>
               </div>
            </div>

            <p className="mt-4 text-[7pt] text-center text-slate-400 font-bold border-t border-slate-100 pt-1 italic no-print">
               تم التوليد آلياً عبر نظام الخطط الأسبوعية - مدرسة {school.name}
            </p>
          </div>
        )}
      </main>

      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; overflow: hidden; }
          .a4-page { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 auto !important; 
            padding: 8mm !important;
            width: 210mm !important;
            height: 297mm !important;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            -webkit-print-color-adjust: exact;
          }
          table { border-collapse: collapse !important; border: 2px solid black !important; }
          th, td { border: 1px solid #ccc !important; }
          .border-black { border-color: black !important; }
          .border-l-2 { border-left-width: 2px !important; }
          .border-b-2 { border-bottom-width: 2px !important; }
        }
      `}</style>
    </div>
  );
};

export default PublicPlanView;
