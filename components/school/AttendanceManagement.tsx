
import React, { useState, useEffect } from 'react';
import { School } from '../../types.ts';
import { db, formatToHijri } from '../../constants.tsx';
import { 
  ClipboardCheck, Search, Check, X, Printer, 
  Archive, History, FileText, Trash2, UserX, 
  Calendar, UserCheck, RotateCcw, Clock, MoreVertical,
  School as SchoolIcon
} from 'lucide-react';

const AttendanceManagement: React.FC<{ school: School }> = ({ school }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'archive'>('daily');
  const [reports, setReports] = useState<any[]>([]);
  const [archivedReports, setArchivedReports] = useState<any[]>([]);
  const [printingReport, setPrintingReport] = useState<any>(null);

  useEffect(() => {
    setReports(db.getAttendance(school.id));
    setArchivedReports(db.getArchivedAttendance(school.id));
  }, [school.id]);

  const handleArchiveReport = (id: string) => {
    if (confirm('هل تريد نقل هذا التقرير إلى الأرشيف التاريخي؟')) {
      db.archiveAttendance(school.id, id);
      setReports(db.getAttendance(school.id));
      setArchivedReports(db.getArchivedAttendance(school.id));
    }
  };

  const handleRestoreReport = (id: string) => {
    db.restoreAttendance(school.id, id);
    setReports(db.getAttendance(school.id));
    setArchivedReports(db.getArchivedAttendance(school.id));
  };

  const handlePrint = (report: any) => {
    setPrintingReport(report);
    // الانتظار قليلاً للتأكد من رندر المكون المخفي ثم الطباعة
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم").split('\n');

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 font-['Tajawal']">
      
      {/* -------------------- منطقة الطباعة المخفية -------------------- */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-[10mm]">
        <div className="max-w-[190mm] mx-auto border-2 border-slate-900 p-8 min-h-[270mm] flex flex-col">
          {/* ترويسة الطباعة الرسمية */}
          <div className="grid grid-cols-3 gap-4 border-b-2 border-slate-900 pb-6 mb-8 items-center">
            <div className="text-right space-y-1 font-black text-[10pt] leading-tight text-slate-900">
              {headerLines.map((line, i) => <p key={i}>{line}</p>)}
            </div>
            <div className="flex flex-col items-center justify-center">
              {school.logoUrl ? (
                <img src={school.logoUrl} className="w-20 h-20 object-contain mb-2" alt="Logo" />
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300"><SchoolIcon size={32} /></div>
              )}
              <div className="bg-slate-900 text-white px-4 py-1 rounded-full font-black text-[9pt]">تقرير غياب رسمي</div>
            </div>
            <div className="text-left font-bold text-[10pt] space-y-1">
               <p>المدرسة: <span className="font-black">{school.name}</span></p>
               <p>التاريخ: <span className="font-black" dir="ltr">{printingReport?.date || formatToHijri(new Date())}</span></p>
               <p>اليوم: <span className="font-black">{printingReport?.day || '---'}</span></p>
            </div>
          </div>

          {/* محتوى التقرير المطبوع */}
          <div className="flex-1">
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-900 mb-8 flex justify-between items-center">
               <div>
                  <h2 className="text-2xl font-black text-slate-900">{printingReport?.className}</h2>
                  <p className="text-sm font-bold text-slate-600 mt-1">المعلم الراصد: {printingReport?.teacherName}</p>
               </div>
               <div className="text-center">
                  <div className="text-4xl font-black text-rose-600">{printingReport?.absentCount}</div>
                  <div className="text-[10pt] font-black text-slate-400">إجمالي الغياب</div>
               </div>
            </div>

            <table className="w-full border-collapse border-2 border-slate-900 text-right">
              <thead className="bg-slate-100 border-b-2 border-slate-900">
                <tr>
                  <th className="p-4 border-l-2 border-slate-900 w-16 text-center font-black">م</th>
                  <th className="p-4 border-l-2 border-slate-900 font-black">اسم الطالب الغائب</th>
                  <th className="p-4 font-black text-center">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {printingReport?.students?.map((name: string, idx: number) => (
                  <tr key={idx} className="border-b-2 border-slate-200 last:border-0">
                    <td className="p-4 border-l-2 border-slate-900 text-center font-bold">{idx + 1}</td>
                    <td className="p-4 border-l-2 border-slate-900 font-black text-lg">{name}</td>
                    <td className="p-4 text-center font-bold text-rose-600">غائب</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* تذييل الطباعة */}
          <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-300 grid grid-cols-2 gap-8 text-center">
             <div className="space-y-4">
                <p className="font-black text-slate-900">توقيع المعلم الراصد</p>
                <div className="h-16 border-b border-slate-300 w-48 mx-auto"></div>
             </div>
             <div className="space-y-4">
                <p className="font-black text-slate-900">ختم وتوقيع الإدارة</p>
                <div className="h-16 border-b border-slate-300 w-48 mx-auto"></div>
             </div>
          </div>
          <div className="mt-auto text-center pt-10">
             <p className="text-[8pt] text-slate-300 font-bold">تم توليد هذا التقرير آلياً عبر نظام "مدرستي" لإدارة الخطط الأسبوعية - {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      {/* -------------------- نهاية منطقة الطباعة -------------------- */}

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 no-print">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">رصد الغياب</h2>
          <p className="text-slate-400 font-bold mt-1 text-sm md:text-base">إدارة سجلات الحضور والغياب المرفوعة من المعلمين.</p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-full lg:w-auto">
          <button onClick={() => setActiveTab('daily')} className={`flex-1 lg:px-8 py-3 rounded-xl font-black text-xs md:text-sm transition-all ${activeTab === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-400'}`}>التقارير الحالية</button>
          <button onClick={() => setActiveTab('archive')} className={`flex-1 lg:px-8 py-3 rounded-xl font-black text-xs md:text-sm transition-all ${activeTab === 'archive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-400'}`}>الأرشيف</button>
        </div>
      </header>

      <div className="space-y-6 md:space-y-8 no-print">
        {activeTab === 'daily' && (
          reports.length === 0 ? (
            <div className="bg-white p-20 md:p-32 rounded-[3rem] md:rounded-[4rem] text-center text-slate-300 font-black border-4 border-dashed border-slate-100 flex flex-col items-center gap-6">
               <ClipboardCheck size={48} className="opacity-20 md:w-16 md:h-16" />
               <p className="text-xl md:text-2xl">لا توجد تقارير غياب حالياً</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="bg-white p-6 md:p-10 lg:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500 animate-in slide-in-from-bottom-5">
                 <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                    <div className="flex-1 space-y-6 md:space-y-8 w-full">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 text-indigo-600 rounded-[1.5rem] md:rounded-3xl flex items-center justify-center font-black text-xl md:text-2xl shadow-inner">
                          {report.absentCount}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="text-xl md:text-2xl font-black text-slate-900 truncate">{report.className}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                             <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] md:text-xs"><Calendar size={14} /> {report.date}</div>
                             <div className="flex items-center gap-1.5 text-indigo-600 font-black text-[10px] md:text-xs"><UserCheck size={14} /> الراصد: {report.teacherName}</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-black text-rose-500 flex items-center gap-2 mr-1"><UserX size={16} /> قائمة الغائبين:</p>
                        <div className="flex flex-wrap gap-2">
                          {report.students.map((name: string, i: number) => (
                            <span key={i} className="bg-rose-50 text-rose-700 px-4 py-1.5 md:px-6 md:py-2 rounded-xl md:rounded-2xl font-black border border-rose-100 text-[10px] md:text-xs shadow-sm">{name}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex lg:flex-col gap-2 w-full lg:w-auto no-print">
                       <button 
                        onClick={() => handlePrint(report)} 
                        className="flex-1 lg:w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                       >
                         <Printer size={18} /> طباعة رسمية
                       </button>
                       <button 
                        onClick={() => handleArchiveReport(report.id)} 
                        className="flex-1 lg:w-full bg-indigo-50 text-indigo-600 px-8 py-4 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                       >
                         <Archive size={18} /> أرشفة
                       </button>
                    </div>
                 </div>
              </div>
            ))
          )
        )}

        {activeTab === 'archive' && (
          archivedReports.length === 0 ? (
            <div className="bg-white p-20 md:p-32 rounded-[3rem] md:rounded-[4rem] text-center space-y-6 md:space-y-8 animate-in zoom-in-95 duration-700">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-200"><History size={48} className="md:w-16 md:h-16" /></div>
              <h3 className="text-xl md:text-2xl font-black text-slate-400">الأرشيف فارغ حالياً</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
               {archivedReports.map(report => (
                  <div key={report.id} className="bg-slate-50/50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-200 flex justify-between items-center gap-6 group hover:border-indigo-200 transition-all opacity-80 hover:opacity-100">
                     <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white text-slate-400 rounded-xl md:rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:text-indigo-600 text-sm md:text-base">{report.absentCount}</div>
                        <div className="overflow-hidden">
                           <h4 className="font-black text-slate-700 text-sm md:text-base truncate">{report.className}</h4>
                           <p className="text-[10px] md:text-xs text-slate-400 font-bold">{report.date}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => handlePrint(report)} className="p-3 bg-white text-slate-400 rounded-xl shadow-sm hover:text-indigo-600 transition-all" title="طباعة">
                           <Printer size={18} />
                        </button>
                        <button onClick={() => handleRestoreReport(report.id)} className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-600 hover:text-white transition-all" title="استعادة للنشط">
                           <RotateCcw size={18} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;
