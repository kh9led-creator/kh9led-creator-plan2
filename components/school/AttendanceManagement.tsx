
import React, { useState, useEffect } from 'react';
import { School } from '../../types.ts';
import { db } from '../../constants.tsx';
import { ClipboardCheck, Search, Check, X, Printer, Archive, History, FileText, Trash2, UserX, Calendar, UserCheck, RotateCcw, Clock, MoreVertical } from 'lucide-react';

const AttendanceManagement: React.FC<{ school: School }> = ({ school }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'archive'>('daily');
  const [reports, setReports] = useState<any[]>([]);
  const [archivedReports, setArchivedReports] = useState<any[]>([]);

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

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">رصد الغياب</h2>
          <p className="text-slate-400 font-bold mt-1 text-sm md:text-base">إدارة سجلات الحضور والغياب المرفوعة من المعلمين.</p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-full lg:w-auto">
          <button onClick={() => setActiveTab('daily')} className={`flex-1 lg:px-8 py-3 rounded-xl font-black text-xs md:text-sm transition-all ${activeTab === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>التقارير الحالية</button>
          <button onClick={() => setActiveTab('archive')} className={`flex-1 lg:px-8 py-3 rounded-xl font-black text-xs md:text-sm transition-all ${activeTab === 'archive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>الأرشيف</button>
        </div>
      </header>

      <div className="space-y-6 md:space-y-8">
        {activeTab === 'daily' && (
          reports.length === 0 ? (
            <div className="bg-white p-20 md:p-32 rounded-[3rem] md:rounded-[4rem] text-center text-slate-300 font-black border-4 border-dashed border-slate-100 flex flex-col items-center gap-6">
               <ClipboardCheck size={48} className="opacity-20 md:w-16 md:h-16" />
               <p className="text-xl md:text-2xl">لا توجد تقارير غياب حالياً</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="bg-white p-6 md:p-10 lg:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500">
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
                       <button onClick={() => window.print()} className="flex-1 lg:w-full bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"><Printer size={18} /> طباعة</button>
                       <button onClick={() => handleArchiveReport(report.id)} className="flex-1 lg:w-full bg-indigo-50 text-indigo-600 px-6 py-3.5 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"><Archive size={18} /> أرشفة</button>
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
                     <button onClick={() => handleRestoreReport(report.id)} className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-600 hover:text-white transition-all" title="استعادة للنشط">
                        <RotateCcw size={18} />
                     </button>
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
