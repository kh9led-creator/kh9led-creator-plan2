
import React, { useState, useEffect } from 'react';
import { db } from '../../constants.tsx';
import { Student } from '../../types.ts';
import { FileUp, Plus, Search, Trash2, Edit2, CheckCircle2, User } from 'lucide-react';

const StudentsManagement: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });

  useEffect(() => {
    setStudents(db.getStudents(schoolId));
  }, [schoolId]);

  const handleAdd = () => {
    if (!newStudent.name) return;
    const student = { ...newStudent, id: Date.now().toString(), schoolId };
    db.saveStudent(student);
    setStudents(db.getStudents(schoolId));
    setShowAdd(false);
    setNewStudent({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black">إدارة الطلاب</h2>
          <p className="text-slate-500">لديك {students.length} طالب مسجل في المدرسة.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100"
        >
          <Plus size={20} />
          إضافة طالب
        </button>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border shadow-sm">
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
            {students.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-bold">لا يوجد طلاب مسجلين بعد.</td></tr>
            ) : (
              students.map(s => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                  <td className="p-5 font-bold">{s.name}</td>
                  <td className="p-5"><span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold">{s.grade} - {s.section}</span></td>
                  <td className="p-5 font-mono text-slate-500">{s.phoneNumber}</td>
                  <td className="p-5 text-left">
                    <button className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-[3rem] max-w-md w-full shadow-2xl">
             <h3 className="text-2xl font-black mb-6">إضافة طالب جديد</h3>
             <div className="space-y-4">
                <input placeholder="اسم الطالب" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                <select className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" value={newStudent.grade} onChange={e => setNewStudent({...newStudent, grade: e.target.value})}>
                   <option>الأول الابتدائي</option><option>الثاني الابتدائي</option><option>الثالث الابتدائي</option>
                </select>
                <input placeholder="الفصل (رقم)" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" value={newStudent.section} onChange={e => setNewStudent({...newStudent, section: e.target.value})} />
                <input placeholder="رقم جوال ولي الأمر" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" value={newStudent.phoneNumber} onChange={e => setNewStudent({...newStudent, phoneNumber: e.target.value})} />
                <div className="flex gap-2 pt-4">
                   <button onClick={handleAdd} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold">حفظ الطالب</button>
                   <button onClick={() => setShowAdd(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold">إلغاء</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
