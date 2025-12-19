
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
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          {/* Fix: Added 'Users' to imports from 'lucide-react' */}
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-100"><Users size={32} /></div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">إدارة شؤون الطلاب</h2>
            <p className="text-slate-500 font-bold">إجمالي المسجلين في النظام: {students.length} طالب.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={clearAllStudents} className="p-4 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all group" title="حذف جميع الطلاب نهائياً"><Eraser size={24} /></button>
          <button onClick={() => setShowImport(true)} className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition"><Sparkles size={20} className="text-blue-400" /> استيراد ذكي</button>
          <button onClick={handleOpenAdd} className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition"><Plus size={20} /> إضافة طالب جديد</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden w-full">
        <div className="p-8 border-b bg-slate-50/50">
          <div className="relative w-full">
            <Search size={20} className="absolute right-5 top-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن أي طالب بالاسم..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[1.5rem] py-4 pr-14 pl-6 text-base font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-[0.15em]">
              <tr>
                <th className="p-8 border-l border-slate-100">اسم الطالب الكامل</th>
                <th className="p-8 border-l border-slate-100 text-center">الصف الدراسي</th>
                <th className="p-8 border-l border-slate-100 text-center">رقم الفصل</th>
                <th className="p-8 border-l border-slate-100 text-center">رقم الجوال المسجل</th>
                <th className="p-8 text-left">الإجراءات والتحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-black text-xl">لا توجد سجلات مطابقة للبحث حالياً.</td></tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="p-8 border-l border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white text-indigo-600 border border-slate-100 rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all text-lg">{s.name[0]}</div>
                        <span className="font-black text-slate-800 text-lg">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-8 border-l border-slate-50 text-center">
                      <span className="bg-indigo-50 text-indigo-700 px-6 py-2 rounded-full text-sm font-black border border-indigo-100">
                        {s.grade}
                      </span>
                    </td>
                    <td className="p-8 border-l border-slate-50 text-center">
                      <span className="bg-blue-50 text-blue-700 px-6 py-2 rounded-full text-sm font-black border border-blue-100">
                        فصل {s.section}
                      </span>
                    </td>
                    <td className="p-8 border-l border-slate-50 text-center font-mono font-bold text-slate-500 text-lg tracking-wider">{s.phoneNumber || '---'}</td>
                    <td className="p-8 text-left">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleOpenEdit(s)} className="p-4 bg-white text-indigo-600 border border-slate-100 rounded-2xl shadow-sm hover:bg-indigo-600 hover:text-white transition-all active:scale-90" title="تعديل بيانات الطالب"><Edit2 size={20} /></button>
                        <button onClick={() => deleteStudent(s.id)} className="p-4 bg-white text-rose-500 border border-slate-100 rounded-2xl shadow-sm hover:bg-rose-500 hover:text-white transition-all active:scale-90" title="حذف الطالب من النظام"><Trash2 size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-6xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-10 border-b bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Sparkles size={28} /></div>
                 <div>
                    <h3 className="text-3xl font-black text-slate-900">محرك الاستيراد البانورامي</h3>
                    <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">توليد تلقائي للأسماء، الصفوف (كلمتان)، الفصول، وأرقام الجوال.</p>
                 </div>
              </div>
              <button onClick={() => setShowImport(false)} className="p-4 bg-white text-slate-400 rounded-2xl hover:text-rose-500 shadow-sm hover:scale-110 transition-all"><X size={28} /></button>
            </div>

            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              {importStep === 'upload' ? (
                <div className="space-y-10">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-4 border-dashed border-slate-100 rounded-[4rem] p-24 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />
                    <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform"><Upload size={48} /></div>
                    <h4 className="text-2xl font-black text-slate-800">ارفع ملف البيانات أو الصق الجدول هنا</h4>
                    <p className="text-sm text-slate-400 mt-3 font-bold uppercase tracking-[0.2em]">يدعم نصوص نظام نور أو ملفات الإكسيل المنسوخة</p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-100"></div></div>
                    <div className="relative flex justify-center text-[10px]"><span className="px-6 bg-white text-slate-400 font-black uppercase tracking-[0.4em]">أو الصق البيانات النصية مباشرة</span></div>
                  </div>

                  <textarea 
                    onPaste={handlePaste}
                    placeholder="الصق نص الجدول المنسوخ من نظام نور هنا... وسنتولى معالجة الصفوف والأرقام فوراً."
                    className="w-full h-48 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-transparent outline-none font-bold text-base text-slate-600 focus:bg-white focus:border-indigo-100 focus:ring-8 focus:ring-indigo-50/30 transition-all shadow-inner"
                  ></textarea>
                  
                  {isProcessing && (
                    <div className="flex items-center justify-center gap-4 text-indigo-600 font-black text-xl animate-pulse">
                      <Loader2 size={32} className="animate-spin" /> جاري التحليل الذكي للبيانات والصفوف...
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-10 animate-in slide-in-from-left-6">
                  <div className="bg-indigo-50 text-indigo-700 p-8 rounded-[2.5rem] border-2 border-indigo-100 flex items-center gap-5">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><CheckCircle2 size={32} /></div>
                     <span className="font-black text-xl">تم اكتشاف {previewData.length} سجل بنجاح. يرجى مراجعة الجدول الكامل أدناه.</span>
                  </div>
                  
                  <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <table className="w-full text-right text-base border-collapse">
                      <thead className="bg-slate-100 font-black text-slate-600">
                        <tr>
                          <th className="p-6 border-l border-slate-200">اسم الطالب</th>
                          <th className="p-6 border-l border-slate-200 text-center">الصف (كلمتان)</th>
                          <th className="p-6 border-l border-slate-200 text-center">رقم الفصل</th>
                          <th className="p-6 text-center">رقم الجوال</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewData.map((p, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-6 font-black text-slate-800 border-l border-slate-100">{p.name || '---'}</td>
                            <td className="p-6 font-bold text-indigo-600 border-l border-slate-100 text-center">{p.grade}</td>
                            <td className="p-6 font-black text-blue-600 text-center border-l border-slate-100 bg-blue-50/20">{p.section}</td>
                            <td className="p-6 font-mono font-bold text-slate-400 text-center">{p.phoneNumber || '---'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-4 sticky bottom-0 bg-white pt-6 pb-2">
                    <button onClick={confirmImport} className="flex-1 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">اعتماد وحفظ القائمة بالكامل</button>
                    <button onClick={() => setImportStep('upload')} className="px-12 py-6 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-2xl hover:bg-slate-200 transition-all">تعديل الاستيراد</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-12 rounded-[3.5rem] max-w-lg w-full shadow-2xl animate-in slide-in-from-bottom-10">
             <div className="flex justify-between items-center mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Edit2 size={24} /></div>
                  <h3 className="text-2xl font-black text-slate-900">{editingStudent ? 'تعديل بيانات الطالب' : 'إضافة سجل جديد'}</h3>
               </div>
               <button onClick={() => setShowForm(false)} className="p-3 text-slate-400 hover:text-slate-900 transition-colors"><X size={28} /></button>
             </div>
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 mr-2 flex items-center gap-2"><User size={14}/> الاسم الكامل للطالب</label>
                  <input 
                    placeholder="أدخل الاسم الرباعي..." 
                    className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent outline-none font-bold text-lg focus:bg-white focus:border-indigo-100 transition-all" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2 flex items-center gap-2"><GraduationCap size={14}/> الصف الدراسي</label>
                    <select 
                      className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent outline-none font-bold text-base focus:bg-white focus:border-indigo-100 transition-all" 
                      value={formData.grade} 
                      onChange={e => setFormData({...formData, grade: e.target.value})}
                    >
                      <option>الأول الابتدائي</option><option>الثاني الابتدائي</option><option>الثالث الابتدائي</option><option>الرابع الابتدائي</option><option>الخامس الابتدائي</option><option>السادس الابتدائي</option>
                      <option>الأول المتوسط</option><option>الثاني المتوسط</option><option>الثالث المتوسط</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2 flex items-center gap-2"><Layout size={14}/> رقم الفصل</label>
                    <input 
                      placeholder="رقم (1)" 
                      className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent outline-none font-bold text-base focus:bg-white focus:border-indigo-100 transition-all" 
                      value={formData.section} 
                      onChange={e => setFormData({...formData, section: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 mr-2 flex items-center gap-2"><Phone size={14}/> رقم الجوال للتواصل</label>
                  <input 
                    placeholder="05xxxxxxxx" 
                    className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent outline-none font-bold text-lg focus:bg-white focus:border-indigo-100 transition-all" 
                    value={formData.phoneNumber} 
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                  />
                </div>
                <button 
                  onClick={handleSave} 
                  className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 mt-6"
                >
                  {editingStudent ? 'تحديث السجل الحالي' : 'حفظ بيانات الطالب'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
