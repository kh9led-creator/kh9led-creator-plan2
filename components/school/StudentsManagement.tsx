
import React, { useState } from 'react';
import { MOCK_STUDENTS } from '../../constants';
import { FileUp, Plus, Search, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

const StudentsManagement: React.FC = () => {
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleImport = () => {
    setImporting(true);
    // Simulate smart parsing
    setTimeout(() => {
      const newStudents = [
        ...students,
        { id: 's3', name: 'ياسر القحطاني', grade: 'الأول الابتدائي', section: '1', phoneNumber: '0566666666' },
        { id: 's4', name: 'سلطان الدوسري', grade: 'الأول الابتدائي', section: '1', phoneNumber: '0577777777' },
      ];
      setStudents(newStudents);
      setImporting(false);
      setShowImport(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black">إدارة الطلاب</h2>
          <p className="text-slate-500">يمكنك إضافة الطلاب يدوياً أو استيرادهم من ملف إكسل.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowImport(true)}
            className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 border border-emerald-100 hover:bg-emerald-100 transition"
          >
            <FileUp size={20} />
            استيراد إكسل
          </button>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100">
            <Plus size={20} />
            إضافة طالب
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border shadow-sm">
        <div className="flex items-center gap-4 mb-6 p-2 bg-slate-50 rounded-2xl border border-slate-100">
          <Search className="text-slate-400 mr-2" size={20} />
          <input 
            type="text" 
            placeholder="البحث عن طالب، رقم جوال، أو فصل..." 
            className="bg-transparent border-none outline-none flex-1 font-medium py-2"
          />
        </div>

        <div className="overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="p-5 font-bold">الاسم</th>
                <th className="p-5 font-bold">الصف / الفصل</th>
                <th className="p-5 font-bold">رقم الجوال</th>
                <th className="p-5 font-bold text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                  <td className="p-5">
                    <div className="font-bold">{s.name}</div>
                  </td>
                  <td className="p-5">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold">
                      {s.grade} - {s.section}
                    </span>
                  </td>
                  <td className="p-5 font-mono text-slate-500">{s.phoneNumber}</td>
                  <td className="p-5">
                    <div className="flex justify-end gap-3">
                      <button className="text-slate-400 hover:text-blue-600 transition"><Edit2 size={18} /></button>
                      <button className="text-slate-400 hover:text-rose-600 transition"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FileUp size={40} />
              </div>
              <h3 className="text-2xl font-black">استيراد الطلاب</h3>
              <p className="text-slate-500 mt-2">اختر ملف Excel (.xlsx) يحتوي على أسماء الطلاب وبياناتهم.</p>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center mb-8 hover:border-emerald-300 transition-colors cursor-pointer group">
              <p className="text-slate-400 group-hover:text-emerald-600 font-bold transition">اسحب الملف هنا أو انقر للاختيار</p>
              <input type="file" className="hidden" />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleImport}
                disabled={importing}
                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {importing ? 'جاري الاستيراد...' : 'بدء الاستيراد الذكي'}
                {!importing && <CheckCircle2 size={20} />}
              </button>
              <button 
                onClick={() => setShowImport(false)}
                className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
