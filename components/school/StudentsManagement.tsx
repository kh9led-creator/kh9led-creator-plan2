
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../../constants.tsx';
import { Student } from '../../types.ts';
import { 
  FileUp, Plus, Search, Trash2, CheckCircle2, 
  Upload, FileSpreadsheet, AlertCircle, X, 
  Sparkles, ClipboardPaste, Loader2, User, RefreshCw,
  Eraser, Phone, GraduationCap, Layout, Edit2, ChevronLeft,
  Users
} from 'lucide-react';

const StudentsManagement: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
  
  const [importStep, setImportStep] = useState<'upload' | 'preview'>('upload');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStudents(db.getStudents(schoolId));
  }, [schoolId]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
    setShowForm(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ 
      name: student.name, 
      grade: student.grade, 
      section: student.section, 
      phoneNumber: student.phoneNumber 
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    const studentData = { 
      ...formData, 
      id: editingStudent ? editingStudent.id : Date.now().toString(), 
      schoolId 
    };
    db.saveStudent(studentData);
    setStudents(db.getStudents(schoolId));
    setShowForm(false);
    db.syncClassesFromStudents(schoolId);
  };

  const deleteStudent = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      const all = JSON.parse(localStorage.getItem('madrasati_students') || '[]');
      const filtered = all.filter((s: any) => s.id !== id);
      localStorage.setItem('madrasati_students', JSON.stringify(filtered));
      setStudents(db.getStudents(schoolId));
      db.syncClassesFromStudents(schoolId);
    }
  };

  const clearAllStudents = () => {
    if (confirm('⚠️ تحذير: سيتم حذف جميع الطلاب لهذه المدرسة. هل تريد الاستمرار؟')) {
      const all = JSON.parse(localStorage.getItem('madrasati_students') || '[]');
      const filtered = all.filter((s: any) => s.schoolId !== schoolId);
      localStorage.setItem('madrasati_students', JSON.stringify(filtered));
      setStudents([]);
      db.syncClassesFromStudents(schoolId);
    }
  };

  const processRawData = (text: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      const parsed = lines.map(line => {
        const delimiter = line.includes('\t') ? '\t' : (line.includes(',') ? ',' : (line.includes('  ') ? '  ' : ' '));
        const parts = line.split(delimiter).map(p => p.trim()).filter(p => p !== '');
        
        let name = '';
        let phoneNumber = '';
        let gradeRaw = '';
        let sectionDetected = '';

        parts.forEach((part, index) => {
          if (!part) return;
          const cleanPhone = part.replace(/[\s\+\-]/g, '');
          if (/^(05|966|5)\d{8,10}$/.test(cleanPhone)) {
            phoneNumber = cleanPhone;
          } 
          else if (/^\d{1,2}$/.test(part) && index > 0) {
            sectionDetected = part;
          }
          else if (part.includes('ابتدائي') || part.includes('متوسط') || part.includes('ثانوي') || part.includes('الصف')) {
            gradeRaw = part;
          }
          else if (part.split(' ').length >= 2 && !/\d/.test(part)) {
            if (!name || index < 2) name = part;
          }
        });

        let formattedGrade = 'غير محدد';
        let section = sectionDetected || '1';

        if (gradeRaw) {
          let cleanGrade = gradeRaw.replace(/^الصف\s+/g, '').trim();
          if (cleanGrade.includes('-')) {
            const [gPart, sPart] = cleanGrade.split('-');
            formattedGrade = gPart.trim().split(/\s+/).slice(0, 2).join(' ');
            if (!sectionDetected) section = sPart.trim().replace(/\D/g, '');
          } else {
            formattedGrade = cleanGrade.split(/\s+/).slice(0, 2).join(' ');
          }
        }

        if (!name && parts[0] && !/\d/.test(parts[0])) name = parts[0];
        return { name, grade: formattedGrade, section: section || '1', phoneNumber };
      }).filter(s => s.name.length > 3);

      setPreviewData(parsed);
      setImportStep('preview');
      setIsProcessing(false);
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => processRawData(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('Text');
    if (text) processRawData(text);
  };

  const confirmImport = () => {
    previewData.forEach(s => {
      db.saveStudent({ ...s, id: Math.random().toString(36).substr(2, 9), schoolId });
    });
    setStudents(db.getStudents(schoolId));
    setShowImport(false);
    setImportStep('upload');
    setPreviewData([]);
    db.syncClassesFromStudents(schoolId);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-100"><Users size={36} /></div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">إدارة شؤون الطلاب</h2>
            <p className="text-slate-500 font-bold text-lg mt-1">تتبع الحسابات والصفوف والبيانات الشخصية لـ {students.length} طالب.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <button onClick={clearAllStudents} className="p-5 bg-rose-50 text-rose-500 rounded-[1.5rem] border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95" title="تفريغ كافة البيانات"><Eraser size={28} /></button>
          <button onClick={() => setShowImport(true)} className="flex-1 md:flex-none bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 shadow-2xl hover:bg-black transition-all active:scale-95 text-lg"><Sparkles size={24} className="text-blue-400" /> استيراد ذكي</button>
          <button onClick={handleOpenAdd} className="flex-1 md:flex-none bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 text-lg"><Plus size={24} /> إضافة طالب</button>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden w-full">
        <div className="p-10 border-b bg-slate-50/30">
          <div className="relative w-full max-w-4xl mx-auto">
            <Search size={24} className="absolute right-6 top-5.5 text-slate-300" />
            <input 
              type="text" 
              placeholder="ابحث عن طالب، صف، أو رقم جوال..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[2rem] py-5 pr-16 pl-8 text-lg font-bold shadow-sm outline-none focus:ring-8 focus:ring-indigo-50 focus:border-indigo-200 transition-all placeholder:text-slate-300" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="p-10 border-l border-slate-50">اسم الطالب</th>
                <th className="p-10 border-l border-slate-50 text-center">المرحلة والصف</th>
                <th className="p-10 border-l border-slate-50 text-center">رقم الفصل</th>
                <th className="p-10 border-l border-slate-50 text-center">جوال التواصل</th>
                <th className="p-10 text-left">التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={5} className="p-40 text-center text-slate-300 font-black text-2xl uppercase tracking-widest">لا توجد سجلات مطابقة.</td></tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-indigo-50/40 transition-all group">
                    <td className="p-10 border-l border-slate-50">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white text-indigo-600 border border-slate-100 rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all text-xl">{s.name[0]}</div>
                        <span className="font-black text-slate-800 text-xl tracking-tight">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-10 border-l border-slate-50 text-center">
                      <span className="bg-indigo-50 text-indigo-700 px-8 py-3 rounded-full text-sm font-black border border-indigo-100/50">
                        {s.grade}
                      </span>
                    </td>
                    <td className="p-10 border-l border-slate-50 text-center">
                      <span className="bg-blue-50 text-blue-700 px-8 py-3 rounded-full text-sm font-black border border-blue-100/50">
                        فصل {s.section}
                      </span>
                    </td>
                    <td className="p-10 border-l border-slate-50 text-center font-mono font-bold text-slate-500 text-lg tracking-widest">{s.phoneNumber || '---'}</td>
                    <td className="p-10 text-left">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleOpenEdit(s)} className="p-5 bg-white text-indigo-600 border border-slate-100 rounded-2xl shadow-sm hover:bg-indigo-600 hover:text-white transition-all active:scale-90" title="تعديل"><Edit2 size={24} /></button>
                        <button onClick={() => deleteStudent(s.id)} className="p-5 bg-white text-rose-500 border border-slate-100 rounded-2xl shadow-sm hover:bg-rose-500 hover:text-white transition-all active:scale-90" title="حذف"><Trash2 size={24} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsManagement;
