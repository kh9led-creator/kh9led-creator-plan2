
import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DAYS, PERIODS, db, MOCK_SUBJECTS } from '../constants.tsx';
import { Printer, Camera } from 'lucide-react';
import { School } from '../types.ts';

const PublicPlanView: React.FC = () => {
  const { schoolSlug, classId } = useParams();
  const [school, setSchool] = useState<School | null>(null);
  const [plans, setPlans] = useState<any>({});
  const [schedule, setSchedule] = useState<any>({});
  const [localActivityImg, setLocalActivityImg] = useState<string | null>(null);

  useEffect(() => {
    if (schoolSlug) {
      const s = db.getSchoolBySlug(schoolSlug);
      if (s) {
        setSchool(s);
        setPlans(db.getPlans(s.id));
        if (classId && classId !== 'all-classes') {
           const classIdClean = classId.replace('bulk-print-', '').replace(/-/g, ' ');
           setSchedule(db.getSchedule(s.id, classIdClean));
        }
      }
    }
  }, [schoolSlug, classId]);

  if (!school) return <div className="p-20 text-center font-black">جاري تحميل الخطة...</div>;

  const activeClassTitle = classId === 'all-classes' ? 'جميع الفصول' : classId?.replace('bulk-print-', '').replace(/-/g, ' ');
  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم").split('\n');
  const activeActivityImg = localActivityImg || school.weeklyNotesImage;

  return (
    <div className="bg-slate-100 min-h-screen font-['Tajawal']">
      <div className="max-w-[1100px] mx-auto p-6 no-print flex justify-between items-center">
        <h1 className="text-xl font-black text-slate-800">معاينة الخطة: {activeClassTitle}</h1>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2">
            <Printer size={18} /> طباعة (PDF)
          </button>
        </div>
      </div>

      <div className="p-4 md:p-10">
        <div className="a4-page mx-auto bg-white shadow-2xl border p-[15mm] relative overflow-hidden text-[11pt] min-h-[297mm]" style={{ maxWidth: '210mm' }}>
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-0.5 font-black text-slate-900 text-right leading-tight">
              {headerLines.map((line, i) => <p key={i} className={i === 0 ? 'text-lg mb-0.5' : 'text-sm'}>{line}</p>)}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-[10mm]">
              {school.logoUrl && <img src={school.logoUrl} alt="Logo" className="w-24 h-24 object-contain" />}
            </div>
            <div className="space-y-0.5 font-black text-left text-slate-900 text-sm" dir="ltr">
              <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
              <p>School: {school.name}</p>
            </div>
          </div>

          <div className="text-center mb-6 mt-10">
            <h2 className="text-2xl font-black border-y-2 border-slate-900 py-2 px-12 text-slate-900 mb-1">الخطة الأسبوعية الموحدة</h2>
            <p className="text-xl font-black text-blue-700 mt-2">الفصل: {activeClassTitle}</p>
          </div>

          <div className="overflow-hidden border-2 border-slate-900 rounded-sm mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-200 border-b-2 border-slate-900">
                  <th className="border-l-2 border-slate-900 p-2 text-sm font-black w-20">اليوم</th>
                  <th className="border-l-2 border-slate-900 p-2 text-xs font-black w-10">م</th>
                  <th className="border-l-2 border-slate-900 p-2 text-sm font-black w-32">المادة</th>
                  <th className="border-l-2 border-slate-900 p-2 text-sm font-black">الدرس المقرر</th>
                  <th className="border-l-2 border-slate-900 p-2 text-sm font-black">الواجب والمهام</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, dIdx) => (
                  <React.Fragment key={day.id}>
                    {PERIODS.map((period, pIdx) => {
                      const sched = schedule[`${day.id}_${period}`] || {};
                      const plan = plans[`${activeClassTitle}_${day.id}_${period}`] || {};
                      const subject = MOCK_SUBJECTS.find(s => s.id === sched.subjectId)?.name || '---';
                      
                      return (
                        <tr key={`${day.id}-${period}`} className={`h-10 border-b ${pIdx === PERIODS.length - 1 ? 'border-b-2 border-slate-900' : 'border-slate-300'}`}>
                          {pIdx === 0 && (
                            <td rowSpan={PERIODS.length} className="border-l-2 border-slate-900 p-2 text-center font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-slate-900 text-sm tracking-widest">
                              {day.label}
                            </td>
                          )}
                          <td className="border-l-2 border-slate-900 p-2 text-center text-xs font-black">{period}</td>
                          <td className="border-l-2 border-slate-900 p-2 text-center text-xs font-bold">{subject}</td>
                          <td className="border-l-2 border-slate-900 p-2 text-center text-[9pt] font-bold">{plan.lesson || '---'}</td>
                          <td className="p-2 text-center text-[8pt] leading-tight">
                             {plan.homework && <div className="text-emerald-700 font-bold">الواجب: {plan.homework}</div>}
                             {plan.enrichment && <div className="text-amber-600 italic">إثرائي: {plan.enrichment}</div>}
                             {!plan.homework && !plan.enrichment && '---'}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="border-2 border-slate-900 p-4 rounded-xl bg-slate-50 min-h-[30mm]">
               <h3 className="text-sm font-black mb-2 border-b-2 border-slate-900 pb-1 text-center">توجيهات عامة</h3>
               <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">{school.generalMessages || "..."}</p>
             </div>
             <div className="border-2 border-slate-900 p-4 rounded-xl bg-slate-50 min-h-[30mm] flex flex-col items-center">
               <h3 className="text-sm font-black mb-2 border-b-2 border-slate-900 pb-1 text-center w-full">نشاط الأسبوع</h3>
               {activeActivityImg && <img src={activeActivityImg} className="max-h-[30mm] object-contain" />}
               <p className="text-[10px] font-bold mt-2 text-center">{school.weeklyNotes}</p>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .a4-page { box-shadow: none !important; border: none !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default PublicPlanView;
