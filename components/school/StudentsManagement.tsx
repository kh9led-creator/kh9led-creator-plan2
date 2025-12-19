
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../constants.tsx';
import { Student } from '../../types.ts';
import { 
  FileUp, Plus, Search, Trash2, CheckCircle2, 
  Upload, FileSpreadsheet, AlertCircle, X, 
  Sparkles, ClipboardPaste, Loader2, User, RefreshCw,
  Eraser, Phone, GraduationCap, Layout
} from 'lucide-react';

const StudentsManagement: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
  
  const [importStep, setImportStep] = useState<'upload' | 'preview'>('upload');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const deleteStudent = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      const all = JSON.parse(localStorage.getItem('madrasati_students') || '[]');
      const filtered = all.filter((s: any) => s.id !== id);
      localStorage.setItem('madrasati_students', JSON.stringify(filtered));
      setStudents(db.getStudents(schoolId));
    }
  };

  const clearAllStudents = () => {
    if (confirm('⚠️ تحذير: سيتم حذف جميع الطلاب لهذه المدرسة. هل تريد الاستمرار؟')) {
      const all = JSON.parse(localStorage.getItem('madrasati_students') || '[]');
      const filtered = all.filter((s: any) => s.schoolId !== schoolId);
      localStorage.setItem('madrasati_students', JSON.stringify(filtered));
      setStudents([]);
    }
  };

  // معالج البيانات الذكي المحدث بناءً على طلب المستخدم
  const processRawData = (text: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      
      const parsed = lines.map(line => {
        // تحديد الفواصل (تبويب Excel، فاصلة، أو مسافات متعددة)
        const delimiter = line.includes('\t') ? '\t' : (line.includes(',') ? ',' : (line.includes('  ') ? '  ' : ' '));
        const parts = line.split(delimiter).map(p => p.trim()).filter(p => p !== '');
        
        let name = '';
        let phoneNumber = '';
        let gradeRaw = '';
        let sectionDetected = '';

        parts.forEach((part, index) => {
          if (!part) return;

          // 1. كشف الجوال (يبدأ بـ 05 أو 966 أو يحتوي على 9-10 أرقام)
          const cleanPhone = part.replace(/[\s\+\-]/g, '');
          if (/^(05|966|5)\d{8,10}$/.test(cleanPhone)) {
            phoneNumber = cleanPhone;
          } 
          // 2. كشف رقم الفصل (أرقام مجردة فقط 1-2 أرقام وغالباً ليست في العمود الأول)
          else if (/^\d{1,2}$/.test(part) && index > 0) {
            sectionDetected = part;
          }
          // 3. كشف الصف (يحتوي على كلمات تدل على المرحلة)
          else if (part.includes('ابتدائي') || part.includes('متوسط') || part.includes('ثانوي') || part.includes('الصف')) {
            gradeRaw = part;
          }
          // 4. كشف الاسم (نص طويل بدون أرقام وغالباً في العمود الأول أو الثاني)
          else if (part.split(' ').length >= 2 && !/\d/.test(part)) {
            if (!name || index < 2) name = part;
          }
        });

        // تنسيق مسمى الصف: استيراد أول كلمتين فقط
        let formattedGrade = 'غير محدد';
        let section = sectionDetected || '1';

        if (gradeRaw) {
          // إزالة كلمة "الصف" إذا وجدت في البداية
          let cleanGrade = gradeRaw.replace(/^الصف\s+/g, '').trim();
          
          // إذا كان التنسيق يحتوي على واصلة (مثل: الأول ابتدائي -1)
          if (cleanGrade.includes('-')) {
            const [gPart, sPart] = cleanGrade.split('-');
            formattedGrade = gPart.trim().split(/\s+/).slice(0, 2).join(' ');
            if (!sectionDetected) section = sPart.trim().replace(/\D/g, ''); // أخذ الأرقام فقط من جزء الفصل
          } else {
            // أخذ أول كلمتين فقط من مسمى الصف
            formattedGrade = cleanGrade.split(/\s+/).slice(0, 2).join(' ');
          }
        }

        // محاولة نهائية لاستنتاج الاسم إذا لم يكتشف
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">إدارة الطلاب</h2>
          <p className="text-slate-500 font-bold">إجمالي المسجلين: {students.length} طالب.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={clearAllStudents} className="p-4 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 hover:bg-rose-500 hover:text-white transition group" title="حذف الكل"><Eraser size={22} /></button>
          <button onClick={() => setShowImport(true)} className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition"><Sparkles size={20} className="text-blue-400" /> استيراد ذكي</button>
          <button onClick={() => setShowAdd(true)} className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition"><Plus size={20} /> إضافة طالب</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50">
          <div className="relative max-w-md">
            <Search size={18} className="absolute right-4 top-3.5 text-slate-400" />
            <input type="text" placeholder="بحث باسم الطالب..." className="w-full bg-white border border-slate-100 rounded-xl py-3 pr-12 pl-4 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest">
              <tr>
                <th className="p-6">اسم الطالب</th>
                <th className="p-6">الصف والفصل</th>
                <th className="p-6">رقم الجوال</th>
                <th className="p-6 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-bold">قائمة الطلاب فارغة.</td></tr>
              ) : (
                students.map(s => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50 transition group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition">{s.name[0]}</div>
                        <span className="font-black text-slate-700">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black border border-indigo-100">
                        {s.grade} - فصل {s.section}
                      </span>
                    </td>
                    <td className="p-6 font-mono font-bold text-slate-500">{s.phoneNumber || '---'}</td>
                    <td className="p-6 text-left">
                      <button onClick={() => deleteStudent(s.id)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Sparkles size={24} /></div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900">المعالج الذكي للاستيراد</h3>
                    <p className="text-sm text-slate-500 font-bold">استخراج الاسم، أول كلمتين من الصف، الجوال، ورقم الفصل.</p>
                 </div>
              </div>
              <button onClick={() => setShowImport(false)} className="p-3 bg-white text-slate-400 rounded-2xl hover:text-rose-500 transition shadow-sm"><X size={24} /></button>
            </div>

            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              {importStep === 'upload' ? (
                <div className="space-y-8">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-4 border-dashed border-slate-100 rounded-[3rem] p-16 text-center hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />
                    <Upload size={48} className="mx-auto mb-6 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    <h4 className="text-xl font-black text-slate-800">ارفع ملف البيانات أو الصق هنا</h4>
                    <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">يدعم ملفات CSV أو نصوص مباشرة من Excel/Noor</p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <div className="relative flex justify-center text-[10px]"><span className="px-4 bg-white text-slate-400 font-black uppercase tracking-[0.2em]">أو الصق البيانات أدناه</span></div>
                  </div>

                  <textarea 
                    onPaste={handlePaste}
                    placeholder="الصق نص الجدول المنسوخ من نظام نور هنا... (سيتم استخراج الأسماء، الصفوف، الفصول، والجوالات)"
                    className="w-full h-40 p-6 bg-slate-50 rounded-[2rem] border-none outline-none font-bold text-sm text-slate-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                  ></textarea>
                  
                  {isProcessing && (
                    <div className="flex items-center justify-center gap-3 text-indigo-600 font-black animate-pulse">
                      <Loader2 size={24} className="animate-spin" /> جاري تحليل البيانات وتنسيق الصفوف...
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-left-4">
                  <div className="bg-indigo-50 text-indigo-700 p-6 rounded-3xl border border-indigo-100 flex items-center gap-4">
                     <CheckCircle2 size={24} />
                     <span className="font-black">تم اكتشاف {previewData.length} طالب. يرجى مراجعة الأعمدة أدناه قبل الاعتماد.</span>
                  </div>
                  
                  <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-inner">
                    <table className="w-full text-right text-sm">
                      <thead className="sticky top-0 bg-slate-100 font-black">
                        <tr>
                          <th className="p-4 border-l">اسم الطالب</th>
                          <th className="p-4 border-l">الصف (أول كلمتين)</th>
                          <th className="p-4 border-l text-center">رقم الفصل</th>
                          <th className="p-4 text-center">رقم الجوال</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((p, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-slate-50 transition">
                            <td className="p-4 font-black text-slate-800 border-l">{p.name || '---'}</td>
                            <td className="p-4 font-bold text-indigo-600 border-l">{p.grade}</td>
                            <td className="p-4 font-black text-blue-600 text-center border-l bg-blue-50/30">{p.section}</td>
                            <td className="p-4 font-mono font-bold text-slate-500 text-center">{p.phoneNumber || '---'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-4 sticky bottom-0 bg-white pt-4">
                    <button onClick={confirmImport} className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xl shadow-xl hover:bg-indigo-700 transition">اعتماد وحفظ القائمة</button>
                    <button onClick={() => setImportStep('upload')} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black text-xl hover:bg-slate-200 transition">تعديل البيانات</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[3rem] max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-8">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-slate-900">إضافة طالب يدوياً</h3>
               <button onClick={() => setShowAdd(false)} className="p-2 text-slate-400 hover:text-slate-900"><X size={24} /></button>
             </div>
             <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 mr-2 flex items-center gap-1"><User size={12}/> اسم الطالب</label>
                  <input placeholder="الاسم الكامل..." className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2 flex items-center gap-1"><GraduationCap size={12}/> الصف</label>
                    <select className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-sm" value={newStudent.grade} onChange={e => setNewStudent({...newStudent, grade: e.target.value})}>
                      <option>الأول الابتدائي</option><option>الثاني الابتدائي</option><option>الثالث الابتدائي</option><option>الرابع الابتدائي</option><option>الخامس الابتدائي</option><option>السادس الابتدائي</option>
                      <option>الأول المتوسط</option><option>الثاني المتوسط</option><option>الثالث المتوسط</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2 flex items-center gap-1"><Layout size={12}/> الفصل</label>
                    <input placeholder="1" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-sm" value={newStudent.section} onChange={e => setNewStudent({...newStudent, section: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 mr-2 flex items-center gap-1"><Phone size={12}/> رقم الجوال</label>
                  <input placeholder="05xxxxxxxx" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-100" value={newStudent.phoneNumber} onChange={e => setNewStudent({...newStudent, phoneNumber: e.target.value})} />
                </div>
                <button onClick={handleAdd} className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-indigo-700 transition active:scale-95 mt-4">حفظ بيانات الطالب</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
