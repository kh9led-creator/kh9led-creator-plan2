
import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DAYS, PERIODS, db } from '../constants.tsx';
import { Printer, Camera, Book } from 'lucide-react';
import { School, Subject } from '../types.ts';

const PublicPlanView: React.FC = () => {
  const { schoolSlug, classId } = useParams();
  const [school, setSchool] = useState<School | null>(null);
  const [plans, setPlans] = useState<any>({});
  const [schedule, setSchedule] = useState<any>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [localActivityImg, setLocalActivityImg] = useState<string | null>(null);

  useEffect(() => {
    if (schoolSlug) {
      const s = db.getSchoolBySlug(schoolSlug);
      if (s) {
        setSchool(s);
        setPlans(db.getPlans(s.id));
        setSubjects(db.getSubjects(s.id));
        if (classId && classId !== 'all-classes') {
           const classIdClean = classId.replace('bulk-print-', '').replace(/-/g, ' ');
           setSchedule(db.getSchedule(s.id, classIdClean));
        }
      }
    }
  }, [schoolSlug, classId]);

  if (!school) return <div className="p-24 text-center font-black animate-pulse text-slate-400">جاري تحميل الخطة الأسبوعية...</div>;

  const activeClassTitle = classId === 'all-classes' ? 'جميع الفصول' : classId?.replace('bulk-print-', '').replace(/-/g, ' ');
  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم").split('\n');
  const activeActivityImg = localActivityImg || school.weeklyNotesImage;

  return (
    <div className="bg-slate-100 min-h-screen font-['Tajawal'] pb-20">
      <div className="max-w-[1100px] mx-auto p-6 no-print flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="bg-blue-600 p-2 rounded-xl text-white"><Book size={20} /></div>
           <h1 className="text-xl font-black text-slate-800">معاينة الخطة الأسبوعية: {activeClassTitle}</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-slate-200 flex items-center gap-2 hover:bg-black transition active:scale-95">
            <Printer size={18} /> طباعة وحفظ PDF
          </button>
        </div>
      </div>

      <div className="p-4 md:p-10">
        <div className="a4-page mx-auto bg-white shadow-2xl border p-[15mm] relative overflow-hidden text-[11pt] min-h-[297mm]" style={{ maxWidth: '210mm' }}>
          {/* Header Branding */}
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-0.5 font-black text-slate-900 text-right leading-tight min-w-[150px]">
              {headerLines.map((line, i) => <p key={i} className={i === 0 ? 'text-lg mb-1 underline underline-offset-4' : 'text-sm'}>{line}</p>)}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-[12mm]">
              {school.logoUrl ? (
                <img src={school.logoUrl} alt="Logo" className="w-24 h-24 object-contain" />
              ) : (
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 border-2 border-dashed"><Book size={32} /></div>
              )}
            </div>
            <div className="space-y-1 font-black text-left text-slate-900 text-sm" dir="ltr">
              <p>School: {school.name}</p>
              <p>Class: {activeClassTitle}</p>
              <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black bg-slate-900 text-white py-3 px-12 inline-block rounded-xl mb-2">الخطة الأسبوعية الموحدة</h2>
            <div className="h-1 bg-slate-900 w-full mt-1"></div>
          </div>

          <div className="overflow-hidden border-2 border-slate-900 rounded-sm mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-900">
                  <th className="border-l-2 border-slate-900 p-2 text-sm font-black w-24">اليوم</th>
                  <th className="border-l-2 border-slate-900 p-2 text-xs font-black w-10">م</th>
                  <th className="border-l-2 border-slate-900 p-2 text-sm font-black w-40">المادة</th>
                  <th className="border-l-2 border-slate-900 p-2 text-sm font-black">الدرس المقرر</th>
                  <th className="p-2 text-sm font-black">الواجب والمهام</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, dIdx) => (
                  <React.Fragment key={day.id}>
                    {PERIODS.map((period, pIdx) => {
                      const sched = schedule[`${day.id}_${period}`] || {};
                      const plan = plans[`${activeClassTitle}_${day.id}_${period}`] || {};
                      const subject = subjects.find(s => s.id === sched.subjectId)?.name || '---';
                      
                      return (
                        <tr key={`${day.id}-${period}`} className={`h-11 border-b ${pIdx === PERIODS.length - 1 ? 'border-b-2 border-slate-900' : 'border-slate-300'}`}>
                          {pIdx === 0 && (
                            <td rowSpan={PERIODS.length} className="border-l-2 border-slate-900 p-2 text-center font-black rotate-180 [writing-mode:vertical-rl] bg-slate-50 text-slate-900 text-sm tracking-widest">
                              {day.label}
                            </td>
                          )}
                          <td className="border-l-2 border-slate-900 p-2 text-center text-xs font-black">{period}</td>
                          <td className="border-l-2 border-slate-900 p-2 text-center text-xs font-black bg-slate-50/50">{subject}</td>
                          <td className="border-l-2 border-slate-900 p-2 text-center text-[10pt] font-bold leading-tight">{plan.lesson || '---'}</td>
                          <td className="p-2 text-center text-[9pt] leading-tight">
                             {plan.homework && <div className="text-slate-900 font-black mb-1">الواجب: {plan.homework}</div>}
                             {plan.enrichment && <div className="text-slate-500 italic text-[8pt]">نشاط: {plan.enrichment}</div>}
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

          {/* Footer Notes */}
          <div className="grid grid-cols-2 gap-6 mt-auto">
             <div className="border-2 border-slate-900 p-5 rounded-2xl bg-white min-h-[40mm]">
               <h3 className="text-xs font-black mb-2 border-b-2 border-slate-900 pb-1 text-center">توجيهات عامة للطلاب</h3>
               <p className="text-[9pt] font-bold leading-relaxed whitespace-pre-wrap text-slate-700">{school.generalMessages || "..."}</p>
             </div>
             <div className="border-2 border-slate-900 p-5 rounded-2xl bg-white min-h-[40mm] flex flex-col items-center">
               <h3 className="text-xs font-black mb-3 border-b-2 border-slate-900 pb-1 text-center w-full">نشاط الأسبوع</h3>
               {activeActivityImg && <img src={activeActivityImg} className="max-h-[35mm] object-contain mb-2" />}
               <p className="text-[9pt] font-black mt-1 text-center text-blue-800">{school.weeklyNotes}</p>
             </div>
          </div>
          
          <div className="mt-8 text-center border-t border-slate-100 pt-4 opacity-50">
             <p className="text-[8pt] font-bold text-slate-400 italic">تم إنشاء هذه الخطة عبر منصة "مدرستي" للخطط الأسبوعية الرقمية</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .a4-page { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 !important; 
            padding: 10mm !important;
            width: 100% !important;
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicPlanView;
