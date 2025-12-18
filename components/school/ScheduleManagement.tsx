
import React, { useState, useMemo, useEffect } from 'react';
import { DAYS, PERIODS, db } from '../../constants.tsx';
import { School, Teacher, Subject } from '../../types.ts';
import { Save, Info, User, Book, LayoutGrid, CheckCircle2 } from 'lucide-react';

const ScheduleManagement: React.FC<{ school: School }> = ({ school }) => {
  const students = db.getStudents(school.id);
  const teachers = db.getTeachers(school.id);
  const subjects = db.getSubjects(school.id);
  
  const availableClasses = useMemo(() => {
    const classes = students.map(s => `${s.grade} - فصل ${s.section}`);
    return Array.from(new Set(classes));
  }, [students]);

  const [selectedClass, setSelectedClass] = useState<string>(availableClasses[0] || "");
  const [schedule, setSchedule] = useState<any>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (selectedClass) {
      setSchedule(db.getSchedule(school.id, selectedClass));
    }
  }, [selectedClass, school.id]);

  const handleCellChange = (dayId: string, period: number, field: 'subjectId' | 'teacherId', value: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      [`${dayId}_${period}`]: {
        ...(prev[`${dayId}_${period}`] || {}),
        [field]: value
      }
    }));
  };

  const saveAll = () => {
    db.saveSchedule(school.id, selectedClass, schedule);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black">إعداد الجداول</h2>
          <p className="text-slate-500">وزع المواد والمعلمين على الحصص.</p>
        </div>
        <button onClick={saveAll} className={`px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white shadow-lg shadow-slate-200'}`}>
          {saved ? <CheckCircle2 /> : <Save />}
          {saved ? 'تم الحفظ بنجاح' : 'حفظ الجدول'}
        </button>
      </div>

      <div className="bg-white p-2 rounded-[2rem] border shadow-sm flex flex-wrap gap-2">
        {availableClasses.map((cls) => (
          <button key={cls} onClick={() => setSelectedClass(cls)} className={`px-6 py-3 rounded-xl font-bold transition ${selectedClass === cls ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
            {cls}
          </button>
        ))}
      </div>

      {selectedClass ? (
        <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-6 border-b border-l text-slate-400 font-black">الحصة</th>
                {DAYS.map(day => <th key={day.id} className="p-6 border-b border-l font-black">{day.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map(period => (
                <tr key={period}>
                  <td className="p-6 border-b border-l text-center font-black text-slate-300">{period}</td>
                  {DAYS.map(day => {
                    const cellData = schedule[`${day.id}_${period}`] || {};
                    return (
                      <td key={`${day.id}-${period}`} className="p-4 border-b border-l space-y-2">
                        <select 
                          className="w-full p-2 bg-slate-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-blue-100"
                          value={cellData.subjectId || ""}
                          onChange={e => handleCellChange(day.id, period, 'subjectId', e.target.value)}
                        >
                          <option value="">- المادة -</option>
                          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select 
                          className="w-full p-2 bg-blue-50/50 rounded-xl text-xs font-bold outline-none text-blue-700 border border-transparent focus:border-blue-200"
                          value={cellData.teacherId || ""}
                          onChange={e => handleCellChange(day.id, period, 'teacherId', e.target.value)}
                        >
                          <option value="">- المعلم -</option>
                          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-20 text-center font-bold text-slate-300 border-4 border-dashed rounded-[3rem]">يرجى إضافة طلاب لإنشاء فصول أولاً.</div>
      )}
    </div>
  );
};

export default ScheduleManagement;
