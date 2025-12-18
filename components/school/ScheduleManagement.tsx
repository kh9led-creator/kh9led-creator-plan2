
import React, { useState, useMemo } from 'react';
import { DAYS, PERIODS, MOCK_SUBJECTS, MOCK_TEACHERS, MOCK_STUDENTS } from '../../constants';
import { School } from '../../types';
import { Save, Info, User, Book, LayoutGrid, ChevronRight, School as SchoolIcon } from 'lucide-react';

const ScheduleManagement: React.FC<{ school: School }> = ({ school }) => {
  // استخراج الفصول الفريدة من قائمة الطلاب
  const availableClasses = useMemo(() => {
    const classes = MOCK_STUDENTS.map(s => `${s.grade} - فصل ${s.section}`);
    return Array.from(new Set(classes));
  }, []);

  const [selectedClass, setSelectedClass] = useState<string>(availableClasses[0] || "");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">إعداد الجداول الدراسية</h2>
          <p className="text-slate-500">قم بتوزيع المواد والمعلمين لكل فصل دراسي بشكل مستقل.</p>
        </div>
        <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-slate-200 hover:scale-105 transition-all">
          <Save size={20} />
          حفظ جميع الجداول
        </button>
      </div>

      {/* اختيار الفصل */}
      <div className="bg-white p-2 rounded-[2rem] border shadow-sm flex flex-wrap gap-2">
        {availableClasses.map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              selectedClass === cls 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
              : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={18} />
            {cls}
          </button>
        ))}
      </div>

      {selectedClass ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 w-fit rounded-full text-blue-700 font-black text-sm">
            <SchoolIcon size={16} />
            أنت تقوم الآن بإعداد جدول: {selectedClass}
          </div>

          <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-3xl flex gap-4 text-blue-800">
            <Info size={24} className="shrink-0 text-blue-500" />
            <p className="text-sm font-bold leading-relaxed">
              عند إسناد مادة ومعلم لحصة معينة في هذا الفصل ({selectedClass})، ستظهر هذه الحصة مباشرة في جدول المعلم المختار ليتمكن من رصد الدروس والواجبات.
            </p>
          </div>

          <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="p-6 border-b border-l text-center font-bold text-slate-400 w-24">الحصة</th>
                  {DAYS.map(day => (
                    <th key={day.id} className="p-6 border-b border-l text-center font-black text-slate-800">
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(period => (
                  <tr key={period} className="hover:bg-slate-50/50 transition">
                    <td className="p-6 border-b border-l text-center font-black text-slate-300 bg-slate-50/30">
                      {period}
                    </td>
                    {DAYS.map(day => (
                      <td key={`${day.id}-${period}`} className="p-4 border-b border-l space-y-3 group">
                        <div className="relative">
                          <select className="w-full p-3 pr-9 bg-slate-50 border-2 border-transparent rounded-2xl text-xs font-bold text-slate-700 focus:ring-0 focus:border-blue-200 hover:bg-white transition appearance-none cursor-pointer">
                            <option value="">- المادة -</option>
                            {MOCK_SUBJECTS.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <Book size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                        </div>
                        
                        <div className="relative">
                          <select className="w-full p-3 pr-9 bg-blue-50/30 border-2 border-transparent rounded-2xl text-xs font-bold text-blue-700 focus:ring-0 focus:border-blue-300 hover:bg-white transition appearance-none cursor-pointer">
                            <option value="">- المعلم -</option>
                            {MOCK_TEACHERS.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          <User size={16} className="absolute right-3 top-3.5 text-blue-300 pointer-events-none" />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-center pt-4">
             <button className="bg-slate-100 text-slate-600 px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">
                نسخ هذا الجدول لفصل آخر
                <ChevronRight size={18} />
             </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] border border-dashed border-slate-200 text-center">
          <LayoutGrid size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-black text-slate-400">يرجى اختيار فصل للبدء في إعداد الجدول</h3>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
