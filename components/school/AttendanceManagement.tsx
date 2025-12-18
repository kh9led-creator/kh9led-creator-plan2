
import React, { useState } from 'react';
import { MOCK_STUDENTS, MOCK_SCHOOLS } from '../../constants';
import { ClipboardCheck, Search, Check, X, Printer, Archive, History, FileText } from 'lucide-react';

const AttendanceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'archive'>('daily');
  const school = MOCK_SCHOOLS[0];
  const [reports, setReports] = useState([
    { id: 'rep1', date: '2024-05-19', day: 'الأحد', teacherName: 'أ. محمد العتيبي', absentCount: 3, students: ['أحمد إبراهيم', 'فهد كمال', 'سلمان راشد'] },
    { id: 'rep2', date: '2024-05-18', day: 'الخميس', teacherName: 'أ. سارة القحطاني', absentCount: 1, students: ['خالد سلمان'] }
  ]);

  const headerLines = (school.headerContent || "").split('\n');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">سجل الغياب والأرشيف</h2>
          <p className="text-slate-500">تقارير غياب الطلاب المرفوعة من المعلمين.</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
          <button onClick={() => setActiveTab('daily')} className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>التقارير اليومية</button>
          <button onClick={() => setActiveTab('archive')} className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === 'archive' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>الأرشيف</button>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'daily' && reports.map(report => (
          <div key={report.id} className="bg-white p-10 rounded-[2.5rem] border shadow-sm relative overflow-hidden group hover:shadow-md transition">
             {/* Print header (normally hidden but shows when requested for export) */}
             <div className="hidden print-report-header mb-8 pb-8 border-b-2 border-slate-900">
                <div className="flex justify-between">
                  <div className="font-black text-sm">
                    {headerLines.map((l, i) => <p key={i}>{l}</p>)}
                  </div>
                  <img src={school.logoUrl} className="w-16 h-16 object-contain" />
                  <div className="text-left font-black text-sm" dir="ltr">
                    <p>Date: {report.date}</p>
                    <p>Day: {report.day}</p>
                  </div>
                </div>
                <h2 className="text-center text-xl font-black mt-4">تقرير غياب الطلاب</h2>
             </div>

             <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                      {report.day[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">{report.day} - {report.date}</h3>
                      <p className="text-sm font-bold text-slate-400">الراصد: <span className="text-blue-600">{report.teacherName}</span></p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-black text-rose-500 flex items-center gap-2">
                      <X size={16} />
                      الطلاب الغائبون ({report.absentCount}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {report.students.map((name, i) => (
                        <span key={i} className="bg-rose-50 text-rose-600 px-4 py-1 rounded-xl font-bold border border-rose-100 text-sm">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                   <button className="bg-slate-50 text-slate-600 px-6 py-3 rounded-2xl font-bold border border-slate-100 flex items-center gap-2">
                     <Printer size={18} />
                     طباعة التقرير
                   </button>
                   <button className="bg-amber-100 text-amber-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-200 transition">
                     <Archive size={18} />
                     نقل للأرشيف
                   </button>
                </div>
             </div>
          </div>
        ))}

        {activeTab === 'archive' && (
          <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 text-center space-y-4">
            <History size={48} className="mx-auto text-slate-300" />
            <h3 className="text-xl font-black text-slate-400">الأرشيف فارغ حالياً</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">سيتم نقل تقارير الغياب القديمة هنا عند أرشفتها يدوياً.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;
