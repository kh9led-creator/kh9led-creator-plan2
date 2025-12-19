
import React, { useState, useEffect } from 'react';
import { School } from '../../types.ts';
import { db } from '../../constants.tsx';
import { ClipboardCheck, Search, Check, X, Printer, Archive, History, FileText, Trash2, UserX, Calendar, UserCheck, RotateCcw } from 'lucide-react';

const AttendanceManagement: React.FC<{ school: School }> = ({ school }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'archive'>('daily');
  const [reports, setReports] = useState<any[]>([]);
  const [archivedReports, setArchivedReports] = useState<any[]>([]);

  useEffect(() => {
    setReports(db.getAttendance(school.id));
    setArchivedReports(db.getArchivedAttendance(school.id));
  }, [school.id]);

  const handleArchiveReport = (id: string) => {
    if (confirm('هل تريد نقل هذا التقرير إلى الأرشيف؟')) {
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

  const handleDeleteArchived = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقرير نهائياً من الأرشيف؟')) {
      db.deleteArchivedAttendance(school.id, id);
      setArchivedReports(db.getArchivedAttendance(school.id));
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
              <div key={report.id} className="bg-white p-10 lg:p-14 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:border-indigo-100 transition-all duration-700">
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
                          <UserX size={18} /> قائمة الطلاب الغائبين:
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {report.students.map((name: string, i: number) => (
                            <span key={i} className="bg-rose-50 text-rose-700 px-6 py-2.5 rounded-2xl font-black border border-rose-100 text-sm shadow-sm">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-3 shrink-0 no-print">
                       <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200">
                         <Printer size={20} /> طباعة الكشف
                       </button>
                       <button 
                        onClick={() => handleArchiveReport(report.id)}
                        className="bg-indigo-50 text-indigo-600 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"
                       >
                         <Archive size={20} /> أرشفة التقرير
                       </button>
                    </div>
                 </div>
              </div>
            ))
          )
        )}

        {activeTab === 'archive' && (
          archivedReports.length === 0 ? (
            <div className="bg-white p-32 rounded-[4rem] text-center space-y-8 animate-in zoom-in-95 duration-700">
              <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-200">
                 <History size={64} />
              </div>
              <h3 className="text-2xl font-black text-slate-400">الأرشيف فارغ حالياً</h3>
            </div>
          ) : (
            <div className="space-y-6">
               {archivedReports.map(report => (
                  <div key={report.id} className="bg-slate-50/50 p-8 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-indigo-200 transition-all opacity-75 hover:opacity-100">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white text-slate-400 rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:text-indigo-600">
                           {report.absentCount}
                        </div>
                        <div>
                           <h4 className="font-black text-slate-700">{report.className} - {report.date}</h4>
                           <p className="text-xs text-slate-400 font-bold">بواسطة: {report.teacherName}</p>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <button 
                          onClick={() => handleRestoreReport(report.id)}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 transition"
                        >
                           <RotateCcw size={14} /> استعادة
                        </button>
                        <button 
                          onClick={() => handleDeleteArchived(report.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                        >
                           <Trash2 size={20} />
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
