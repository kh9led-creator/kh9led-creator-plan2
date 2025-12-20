
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
    const fetchAttendanceData = async () => {
      setReports(await db.getAttendance(school.id));
      setArchivedReports(await db.getArchivedAttendance(school.id));
    };
    fetchAttendanceData();
  }, [school.id]);

  const handleArchiveReport = (id: string) => {
    if (confirm('هل تريد نقل هذا التقرير إلى الأرشيف التاريخي؟')) {
      db.archiveAttendance(school.id, id);
      const updateData = async () => {
        setReports(await db.getAttendance(school.id));
        setArchivedReports(await db.getArchivedAttendance(school.id));
      };
      updateData();
    }
  };

  const handleRestoreReport = (id: string) => {
    const restoreData = async () => {
      await db.restoreAttendance(school.id, id);
      setReports(await db.getAttendance(school.id));
      setArchivedReports(await db.getArchivedAttendance(school.id));
    };
    restoreData();
  };

  const handlePrint = (report: any) => {
    setPrintingReport(report);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم").split('\n');

  return (
    <div className="space-y-12 animate-in fade-in duration-700 w-full">
      
      {/* -------------------- منطقة الطباعة الاحترافية -------------------- */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-[10mm]">
        <div className="max-w-[190mm] mx-auto border-[1.5pt] border-slate-900 p-10 min-h-[270mm] flex flex-col">
          <div className="grid grid-cols-3 gap-6 border-b-[1.5pt] border-slate-900 pb-8 mb-10 items-center">
            <div className="text-right space-y-1 font-black text-[9.5pt] leading-tight text-slate-900">
              {headerLines.map((line, i) => <p key={i}>{line}</p>)}
            </div>
            <div className="flex flex-col items-center justify-center">
              {school.logoUrl ? (
                <img src={school.logoUrl} className="w-20 h-20 object-contain mb-3" alt="Logo" />
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300"><SchoolIcon size={32} /></div>
              )}
              <div className="bg-slate-900 text-white px-6 py-1 rounded-full font-black text-[9pt] uppercase tracking-widest">تقرير غياب رسمي</div>
            </div>
            <div className="text-left font-bold text-[10pt] space-y-1.5 text-slate-900">
               <p>المدرسة: <span className="font-black">{school.name}</span></p>
               <p>التاريخ: <span className="font-black" dir="ltr">{printingReport?.date || formatToHijri(new Date())}</span></p>
               <p>اليوم: <span className="font-black">{printingReport?.day || '---'}</span></p>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-slate-50 p-8 rounded-[2rem] border-[1.2pt] border-slate-200 mb-10 flex justify-between items-center shadow-sm">
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{printingReport?.className}</h2>
                  <p className="text-sm font-bold text-slate-500 mt-2">المعلم الراصد: {printingReport?.teacherName}</p>
               </div>
               <div className="text-center px-10 border-r-2 border-slate-200">
                  <div className="text-5xl font-black text-rose-600 leading-none">{printingReport?.absentCount}</div>
                  <div className="text-[9pt] font-black text-slate-400 mt-2 uppercase tracking-widest">عدد الغائبين</div>
               </div>
            </div>

            <table className="w-full border-collapse border-[1.5pt] border-slate-900 text-right">
              <thead className="bg-slate-100 border-b-[1.5pt] border-slate-900">
                <tr>
                  <th className="p-5 border-l-[1.5pt] border-slate-900 w-20 text-center font-black text-[11pt]">م</th>
                  <th className="p-5 border-l-[1.5pt] border-slate-900 font-black text-[11pt]">اسم الطالب الغائب</th>
                  <th className="p-5 font-black text-center text-[11pt]">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {printingReport?.students?.map((name: string, idx: number) => (
                  <tr key={idx} className="border-b-[1pt] border-slate-200 last:border-0">
                    <td className="p-5 border-l-[1.5pt] border-slate-900 text-center font-bold text-[10.5pt] bg-slate-50/50">{idx + 1}</td>
                    <td className="p-5 border-l-[1.5pt] border-slate-900 font-black text-lg text-slate-800">{name}</td>
                    <td className="p-5 text-center font-black text-rose-600 text-[10.5pt]">غائب</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-16 pt-10 border-t-[1pt] border-dashed border-slate-300 grid grid-cols-2 gap-12 text-center">
             <div className="space-y-6">
                <p className="font-black text-slate-900 text-lg underline underline-offset-8 decoration-slate-200">توقيع المعلم الراصد</p>
                <div className="h-20 border-b border-slate-100 w-56 mx-auto bg-slate-50/30 rounded-t-xl"></div>
             </div>
             <div className="space-y-6">
                <p className="font-black text-slate-900 text-lg underline underline-offset-8 decoration-slate-200">ختم وتوقيع الإدارة</p>
                <div className="h-20 border-b border-slate-100 w-56 mx-auto bg-slate-50/30 rounded-t-xl"></div>
             </div>
          </div>
          <div className="mt-auto text-center pt-12 border-t border-slate-50">
             <p className="text-[8.5pt] text-slate-300 font-bold tracking-widest uppercase">تم توليد التقرير آلياً عبر نظام مدرستي الذكي - {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 no-print bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
           <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-100"><ClipboardCheck size={36} /></div>
           <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">إدارة رصد الغياب</h2>
              <p className="text-slate-500 font-bold text-lg mt-1">مراجعة وتوثيق تقارير الحضور المرفوعة من المعلمين.</p>
           </div>
        </div>
        <div className="flex gap-2 p-2 bg-slate-100 rounded-[2rem] w-full lg:w-auto shadow-inner">
          <button onClick={() => setActiveTab('daily')} className={`flex-1 lg:px-10 py-4 rounded-[1.5rem] font-black text-sm transition-all duration-300 ${activeTab === 'daily' ? 'bg-white text-indigo-600 shadow-xl translate-x-1' : 'text-slate-500 hover:text-indigo-400'}`}>التقارير الحالية</button>
          <button onClick={() => setActiveTab('archive')} className={`flex-1 lg:px-10 py-4 rounded-[1.5rem] font-black text-sm transition-all duration-300 ${activeTab === 'archive' ? 'bg-white text-indigo-600 shadow-xl -translate-x-1' : 'text-slate-500 hover:text-indigo-400'}`}>الأرشيف التاريخي</button>
        </div>
      </header>

      <div className="space-y-8 no-print w-full">
        {activeTab === 'daily' && (
          reports.length === 0 ? (
            <div className="bg-white p-32 md:p-48 rounded-[4rem] text-center text-slate-300 font-black border-4 border-dashed border-slate-100 flex flex-col items-center gap-10 animate-fade-up">
               <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200 shadow-inner"><ClipboardCheck size={64} /></div>
               <p className="text-3xl font-black tracking-widest uppercase">لا توجد تقارير نشطة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
               {reports.map(report => (
                 <div key={report.id} className="bg-white p-8 md:p-12 rounded-[4rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all duration-500 animate-fade-up">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
                       <div className="flex-1 space-y-10 w-full">
                         <div className="flex items-center gap-8">
                           <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center font-black text-4xl shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                             {report.absentCount}
                           </div>
                           <div className="overflow-hidden">
                             <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{report.className}</h3>
                             <div className="flex flex-wrap gap-x-6 gap-y-3">
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm bg-slate-50 px-4 py-2 rounded-full border border-slate-100"><Calendar size={16} /> {report.date}</div>
                                <div className="flex items-center gap-2 text-indigo-600 font-black text-sm bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100"><UserCheck size={16} /> الراصد: {report.teacherName}</div>
                             </div>
                           </div>
                         </div>
                         <div className="space-y-4">
                           <p className="text-sm font-black text-rose-500 flex items-center gap-3 uppercase tracking-widest px-4"><UserX size={18} /> سجل الطلاب الغائبين:</p>
                           <div className="flex flex-wrap gap-3 p-2">
                             {report.students.map((name: string, i: number) => (
                               <span key={i} className="bg-rose-50/50 text-rose-700 px-8 py-3 rounded-[1.5rem] font-black border border-rose-100/50 text-sm shadow-sm group-hover:bg-rose-50 transition-colors">{name}</span>
                             ))}
                           </div>
                         </div>
                       </div>
                       <div className="flex lg:flex-col gap-4 w-full lg:w-auto shrink-0">
                          <button 
                           onClick={() => handlePrint(report)} 
                           className="flex-1 lg:w-64 bg-slate-900 text-white px-10 py-6 rounded-[2rem] font-black text-base flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95"
                          >
                            <Printer size={22} /> طباعة رسمية
                          </button>
                          <button 
                           onClick={() => handleArchiveReport(report.id)} 
                           className="flex-1 lg:w-64 bg-indigo-50 text-indigo-600 px-10 py-6 rounded-[2rem] font-black text-base flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border border-indigo-100 shadow-sm"
                          >
                            <Archive size={22} /> نقل للأرشيف
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )
        )}

        {activeTab === 'archive' && (
          archivedReports.length === 0 ? (
            <div className="bg-white p-32 md:p-48 rounded-[4rem] text-center text-slate-300 font-black border-4 border-dashed border-slate-100 flex flex-col items-center gap-10">
               <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200"><History size={64} /></div>
               <p className="text-3xl font-black tracking-widest uppercase">الأرشيف التاريخي فارغ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {archivedReports.map(report => (
                  <div key={report.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex justify-between items-center gap-8 group hover:shadow-xl transition-all duration-500">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">{report.absentCount}</div>
                        <div className="overflow-hidden">
                           <h4 className="font-black text-slate-700 text-xl truncate">{report.className}</h4>
                           <p className="text-xs text-slate-400 font-bold mt-1">{report.date}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => handlePrint(report)} className="p-4 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="طباعة">
                           <Printer size={20} />
                        </button>
                        <button onClick={() => handleRestoreReport(report.id)} className="p-4 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="استعادة">
                           <RotateCcw size={20} />
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
