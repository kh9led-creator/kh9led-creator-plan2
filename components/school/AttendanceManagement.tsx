
import React, { useState, useEffect } from 'react';
import { School } from '../../types.ts';
import { db } from '../../constants.tsx';
import { ClipboardCheck, Search, Check, X, Printer, Archive, History, FileText, Trash2, UserX, Calendar, UserCheck } from 'lucide-react';

const AttendanceManagement: React.FC<{ school: School }> = ({ school }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'archive'>('daily');
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    setReports(db.getAttendance(school.id));
  }, [school.id]);

  const handleDeleteReport = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      const all = db.getAttendance(school.id);
      const filtered = all.filter((r: any) => r.id !== id);
      localStorage.setItem(`madrasati_attendance_${school.id}`, JSON.stringify(filtered));
      setReports(filtered);
    }
  };

  const headerLines = (school.headerContent || "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم").split('\n');

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">رصد الغياب المرفوع</h2>
          <p className="text-slate-400 font-bold mt-2">سجل تقارير الغياب اليومية المرسلة من قبل المعلمين.</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-[1.5rem] shadow-inner">
          <button onClick={() => setActiveTab('daily')} className={`px-8 py-3 rounded-xl font-black transition-all ${activeTab === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>التقارير اليومية</button>
          <button onClick={() => setActiveTab('archive')} className={`px-8 py-3 rounded-xl font-black transition-all ${activeTab === 'archive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>الأرشيف</button>
        </div>
      </header>

      <div className="space-y-8">
        {activeTab === 'daily' && (
          reports.length === 0 ? (
            <div className="bg-white p-32 rounded-[4rem] text-center text-slate-300 font-black border-4 border-dashed border-slate-100 flex flex-col items-center gap-6">
               <ClipboardCheck size={64} className="opacity-20" />
               <p className="text-2xl">لا توجد تقارير غياب مرفوعة حالياً</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="bg-white p-10 lg:p-14 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:border-indigo-100 transition-all duration-700 animate-in slide-in-from-bottom-6">
                 
                 {/* Print-Only Header Simulation */}
                 <div className="hidden print:block mb-8 border-b-2 border-black pb-6">
                    <div className="grid grid-cols-3 items-start mb-6">
                      <div className="text-right text-[10pt] font-black leading-tight">
                        {headerLines.map((l, i) => <p key={i}>{l}</p>)}
                        <p>{school.name}</p>
                      </div>
                      <div className="flex justify-center">
                        {school.logoUrl ? <img src={school.logoUrl} className="w-20 h-20 object-contain" /> : <div className="w-20 h-20 border-2 border-dashed border-black rounded-lg"></div>}
                      </div>
                      <div className="text-right text-[10pt] font-bold">
                        <p>اليوم: {report.day}</p>
                        <p>التاريخ: {report.date}</p>
                        <p>الفصل: {report.className}</p>
                      </div>
                    </div>
                    <h2 className="text-center text-xl font-black underline underline-offset-8">بيان بأسماء الطلاب الغائبين</h2>
                 </div>

                 <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                    <div className="flex-1 space-y-8">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center font-black text-2xl shadow-inner">
                          {report.absentCount}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-900">{report.className}</h3>
                          <div className="flex flex-wrap gap-4 mt-2">
                             <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                                <Calendar size={16} /> {report.day}، {report.date}
                             </div>
                             <div className="flex items-center gap-2 text-indigo-600 font-black text-sm">
                                <UserCheck size={16} /> الراصد: {report.teacherName}
                             </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-sm font-black text-rose-500 flex items-center gap-2 mr-2">
                          <UserX size={18} />
                          قائمة الطلاب الغائبين:
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {report.students.length > 0 ? report.students.map((name: string, i: number) => (
                            <span key={i} className="bg-rose-50 text-rose-700 px-6 py-2.5 rounded-2xl font-black border border-rose-100 text-sm shadow-sm">
                              {name}
                            </span>
                          )) : (
                            <span className="text-emerald-500 font-black italic bg-emerald-50 px-6 py-2.5 rounded-2xl border border-emerald-100">لا يوجد غياب (حضور كامل)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-3 shrink-0 no-print">
                       <button 
                        onClick={() => window.print()}
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200"
                       >
                         <Printer size={20} /> طباعة الكشف
                       </button>
                       <button className="bg-indigo-50 text-indigo-600 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all">
                         <Archive size={20} /> أرشفة
                       </button>
                       <button 
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                       >
                         <Trash2 size={20} />
                       </button>
                    </div>
                 </div>

                 {/* Print-Only Footer */}
                 <div className="hidden print:block mt-12 pt-8 border-t-2 border-slate-900 text-[10pt]">
                    <div className="grid grid-cols-2 gap-10">
                       <div className="text-center font-black">اسم المعلم الراصد: .......................................</div>
                       <div className="text-center font-black">توقيع مدير المدرسة: .......................................</div>
                    </div>
                    <p className="text-center text-[8pt] text-slate-400 mt-10">تم استخراج هذا التقرير آلياً عبر نظام مدرستي لإدارة الخطط المدرسية</p>
                 </div>
              </div>
            ))
          )
        )}

        {activeTab === 'archive' && (
          <div className="bg-white p-32 rounded-[4rem] text-center space-y-8 animate-in zoom-in-95 duration-700">
            <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-200">
               <History size={64} />
            </div>
            <div>
               <h3 className="text-2xl font-black text-slate-400">الأرشيف فارغ حالياً</h3>
               <p className="text-slate-400 font-bold max-w-sm mx-auto mt-2">ستظهر هنا التقارير التي قمت بنقلها للأرشيف لمراجعتها لاحقاً.</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only *, .print-report-header, .print-report-header * { visibility: visible; }
          .bg-white { background: white !important; }
          .no-print { display: none !important; }
          .reports-container { display: block !important; }
          /* Logic to print only the clicked report would need a specific reference, 
             for now we show all reports content in print mode */
          main, body { background: white !important; }
          .animate-in { animation: none !important; }
          .a4-page { width: 210mm; height: 297mm; padding: 15mm; }
          
          /* Special class for report content visibility */
          div[key] { visibility: visible; position: absolute; top: 0; left: 0; width: 100%; border: none !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default AttendanceManagement;
