
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DAYS, PERIODS, MOCK_SCHOOLS, MOCK_STUDENTS } from '../constants';
import { Printer, Share2, FileText, LayoutGrid, Camera } from 'lucide-react';

const PublicPlanView: React.FC = () => {
  const { schoolSlug, classId } = useParams();
  const school = MOCK_SCHOOLS[0]; 
  const [localActivityImg, setLocalActivityImg] = useState<string | null>(null);

  // Determine what to display: Single Student, All Classes, or Bulk Students in a Class
  const displayMode = useMemo(() => {
    if (classId === 'all-classes') return 'ALL_CLASSES';
    if (classId?.startsWith('bulk-print-')) return 'BULK_STUDENTS';
    if (classId?.startsWith('student-')) return 'SINGLE_STUDENT';
    return 'GENERAL';
  }, [classId]);

  const itemsToRender = useMemo(() => {
    if (displayMode === 'SINGLE_STUDENT') {
      const studentId = classId!.replace('student-', '');
      const student = MOCK_STUDENTS.find(s => s.id === studentId);
      return [{
        type: 'INDIVIDUAL',
        title: student?.name || 'اسم الطالب',
        grade: student?.grade || '---',
        section: student?.section || '---'
      }];
    }
    
    if (displayMode === 'BULK_STUDENTS') {
      const classNameClean = classId!.replace('bulk-print-', '').replace(/-/g, ' ');
      return MOCK_STUDENTS
        .filter(s => `${s.grade} - فصل ${s.section}` === classNameClean)
        .map(s => ({
          type: 'INDIVIDUAL',
          title: s.name,
          grade: s.grade,
          section: s.section
        }));
    }

    if (displayMode === 'ALL_CLASSES') {
      // Create unique class items
      const classes = Array.from(new Set(MOCK_STUDENTS.map(s => `${s.grade}|${s.section}`)));
      return classes.map(c => {
        const [grade, section] = c.split('|');
        return {
          type: 'GENERAL',
          title: 'الخطة الأسبوعية الموحدة',
          grade,
          section
        };
      });
    }

    return [{
      type: 'GENERAL',
      title: 'الخطة الأسبوعية الموحدة',
      grade: 'الأول الابتدائي',
      section: '١'
    }];
  }, [displayMode, classId]);

  const handlePrint = () => {
    window.print();
  };

  const dayColors = [
    'bg-blue-50/70',
    'bg-emerald-50/70',
    'bg-amber-50/70',
    'bg-purple-50/70',
    'bg-rose-50/70'
  ];

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم\nمكتب تعليم الشمال").split('\n');

  // Use local override image first, then school default
  const activeActivityImg = localActivityImg || school.weeklyNotesImage;

  return (
    <div className="bg-slate-100 min-h-screen font-['Tajawal'] overflow-x-hidden">
      {/* Control Panel (No Print) */}
      <div className="max-w-[1100px] mx-auto p-6 md:p-10 pb-0 no-print flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
           <button 
            onClick={() => window.history.back()}
            className="p-3 bg-white rounded-2xl text-slate-600 hover:bg-slate-50 shadow-sm transition"
          >
            إغلاق
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Printer size={20} />
            </div>
            <h1 className="text-xl font-black text-slate-800">
              {displayMode === 'ALL_CLASSES' ? 'معاينة خطط جميع الفصول' : 
               displayMode === 'BULK_STUDENTS' ? 'معاينة طباعة الفصل كامل' : 'معاينة الخطة الأسبوعية'}
            </h1>
          </div>
        </div>
        <div className="flex gap-3">
          {(displayMode === 'SINGLE_STUDENT' || displayMode === 'BULK_STUDENTS' || displayMode === 'GENERAL') && (
            <label className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold border border-blue-100 hover:bg-blue-50 cursor-pointer transition">
              <Camera size={18} />
              تغيير صورة النشاط مؤقتاً
              <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                   const reader = new FileReader();
                   reader.onloadend = () => setLocalActivityImg(reader.result as string);
                   reader.readAsDataURL(file);
                 }
              }} />
            </label>
          )}
          <button 
            onClick={handlePrint}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition flex items-center gap-2"
          >
            <Printer size={18} />
            طباعة الكل (PDF)
          </button>
        </div>
      </div>

      {/* Printable Area - Loop through items */}
      <div className="space-y-10 p-4 md:p-10">
        {itemsToRender.map((item, idx) => (
          <div key={idx} className="a4-page mx-auto bg-white shadow-2xl border p-[15mm] relative overflow-hidden text-[11pt] mb-10 last:mb-0" style={{ maxWidth: '210mm', minHeight: '297mm', pageBreakAfter: 'always' }}>
            {/* Header Section */}
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-0.5 font-black text-slate-900 text-right leading-tight">
                {headerLines.map((line, i) => (
                  <p key={i} className={i === 0 ? 'text-lg mb-0.5' : 'text-sm'}>{line}</p>
                ))}
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-[10mm]">
                {school.logoUrl && (
                  <img src={school.logoUrl} alt="Logo" className="w-24 h-24 object-contain" />
                )}
              </div>
              <div className="space-y-0.5 font-black text-left text-slate-900 text-sm" dir="ltr">
                <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                <p>Grade: {item.grade}</p>
                <p>Section: {item.section}</p>
                <p>Week: 1</p>
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center mb-6 mt-10">
              <h2 className="text-2xl font-black border-y-2 border-slate-900 py-2 px-12 uppercase tracking-widest text-slate-900 mb-1">
                {item.type === 'INDIVIDUAL' ? 'خطة الطالب الأسبوعية' : 'الخطة الأسبوعية الموحدة'}
              </h2>
              {item.type === 'INDIVIDUAL' && (
                <p className="text-xl font-black text-blue-700 mt-2">اسم الطالب: {item.title}</p>
              )}
              <div className="mt-4 flex justify-center gap-8 font-black text-slate-900 bg-slate-50 py-2 rounded-xl border border-slate-200 px-8 text-sm">
                <span>الفترة من: ٢٠ / ٠٨ / ١٤٤٦ هـ</span>
                <span>إلى: ٢٤ / ٠٨ / ١٤٤٦ هـ</span>
              </div>
            </div>

            {/* Timetable Table */}
            <div className="overflow-hidden border-2 border-slate-900 rounded-sm mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b-2 border-slate-900">
                    <th className="border-l-2 border-slate-900 p-2 text-sm font-black w-20">اليوم</th>
                    <th className="border-l-2 border-slate-900 p-2 text-xs font-black w-10">م</th>
                    <th className="border-l-2 border-slate-900 p-2 text-sm font-black w-32">المادة</th>
                    <th className="border-l-2 border-slate-900 p-2 text-sm font-black">الدرس المقرر</th>
                    <th className="border-l-2 border-slate-900 p-2 text-sm font-black">الواجب</th>
                    <th className="p-2 text-sm font-black w-40">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, dIdx) => (
                    <React.Fragment key={day.id}>
                      {PERIODS.map((period, pIdx) => (
                        <tr key={`${day.id}-${period}`} className={`h-10 ${dayColors[dIdx]} ${pIdx === PERIODS.length - 1 ? 'border-b-2 border-slate-900' : 'border-b border-slate-300'}`}>
                          {pIdx === 0 && (
                            <td rowSpan={PERIODS.length} className="border-l-2 border-slate-900 p-2 text-center font-black rotate-180 [writing-mode:vertical-rl] bg-white/30 text-slate-900 text-sm tracking-widest">
                              {day.label}
                            </td>
                          )}
                          <td className="border-l-2 border-slate-900 p-2 text-center text-xs font-black">{period}</td>
                          <td className="border-l-2 border-slate-900 p-2 text-center text-xs font-bold">---</td>
                          <td className="border-l-2 border-slate-900 p-2 text-center text-[10pt]">---</td>
                          <td className="border-l-2 border-slate-900 p-2 text-center text-[10pt]">---</td>
                          <td className="p-2 text-center text-[10pt]">---</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Extra Sections */}
            <div className="grid grid-cols-2 gap-4">
               <div className="border-2 border-slate-900 p-4 rounded-xl bg-slate-50 min-h-[30mm]">
                 <h3 className="text-sm font-black mb-2 border-b-2 border-slate-900 pb-1 text-center">رسائل وتوجيهات عامة</h3>
                 <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">
                   {school.generalMessages || "يرجى من ولي أمر الطالب الكريم متابعة ابنكم في رصد الواجبات والدروس اليومية والحرص على عدم الغياب المتكرر."}
                 </p>
               </div>
               <div className="border-2 border-slate-900 p-4 rounded-xl bg-slate-50 min-h-[30mm] flex flex-col">
                 <h3 className="text-sm font-black mb-2 border-b-2 border-slate-900 pb-1 text-center">ملاحظات / نشاط أسبوعي</h3>
                 <div className="flex-1 flex flex-col items-center justify-center relative">
                    <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap mb-2 text-center">
                      {school.weeklyNotes}
                    </p>
                    {activeActivityImg ? (
                      <img src={activeActivityImg} className="max-h-[35mm] w-full object-contain rounded-lg shadow-sm" alt="Activity" />
                    ) : (
                      !school.weeklyNotes && <div className="text-[10pt] text-slate-400 font-bold italic">لا يوجد صورة نشاط</div>
                    )}
                 </div>
               </div>
            </div>

            {/* Footer Signatures */}
            <div className="mt-10 flex justify-between items-end">
               <div className="text-center font-black space-y-2">
                 <p className="text-sm">الختم الرسمي للمدرسة</p>
                 <div className="w-20 h-20 border-2 border-slate-200 rounded-full mx-auto border-dashed flex items-center justify-center text-[8pt] text-slate-300">موضع الختم</div>
               </div>
               <div className="text-center font-black space-y-6">
                 <p className="text-sm border-b-2 border-slate-900 pb-1 px-8">مدير المدرسة</p>
                 <div className="text-slate-300 text-sm">...................................</div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; }
          .a4-page { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 !important; 
            padding: 15mm !important;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicPlanView;
