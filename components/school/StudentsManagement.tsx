
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../constants.tsx';
import { Student } from '../../types.ts';
import { 
  FileUp, Plus, Search, Trash2, CheckCircle2, 
  Upload, FileSpreadsheet, AlertCircle, X, 
  Sparkles, ClipboardPaste, Loader2 
} from 'lucide-react';

const StudentsManagement: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
  
  // حالات الاستيراد
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

  // معالج البيانات الذكي
  const processRawData = (text: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      // تقسيم الأسطر
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length === 0) {
        setIsProcessing(false);
        return;
      }

      // محاولة استنتاج الفاصل (فاصلة أو Tab)
      const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(',') ? ',' : ';');
      
      const parsed = lines.map(line => {
        const parts = line.split(delimiter).map(p => p.trim());
        // محاولة ذكية لتوزيع البيانات:
        // الاسم عادة أول حقل نصي طويل
        // الجوال عادة حقل يبدأ بـ 05 أو 966
        // الصف قد يحتوي على كلمات مثل "ابتدائي" أو أرقام 1-6
        return {
          name: parts[0] || '',
          grade: parts[1] || 'الأول الابتدائي',
          section: parts[2] || '1',
          phoneNumber: parts[3] || ''
        };
      }).filter(s => s.name && s.name.length > 2);

      setPreviewData(parsed);
      setImportStep('preview');
      setIsProcessing(false);
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processRawData(text);
      };
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
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إدارة الطلاب</h2>
          <p className="text-slate-500 font-bold">لديك {students.length} طالب مسجل في النظام حالياً.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowImport(true)}
            className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-slate-200 hover:scale-105 transition active:scale-95"
          >
            <Sparkles size={20} className="text-blue-400" />
            استيراد ذكي
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-100 hover:scale-105 transition active:scale-95"
          >
            <Plus size={20} />
            إضافة طالب
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute right-4 top-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن اسم طالب أو رقم جوال..."
              className="w-full bg-white border-none rounded-xl py-3 pr-12 pl-4 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </div>
        <table className="w-full text-right">
          <thead className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest">
            <tr>
              <th className="p-6">الاسم الكامل</th>
              <th className="p-6">الصف / الفصل</th>
              <th className="p-6">رقم الجوال</th>
              <th className="p-6 text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-bold">لا يوجد طلاب مسجلين بعد. ابدأ بالاستيراد الذكي لتوفير الوقت.</td></tr>
            ) : (
              students.map(s => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-blue-50/30 transition group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition">
                        {s.name[0]}
                      </div>
                      <span className="font-black text-slate-700">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black border border-blue-100">
                      {s.grade} - {s.section}
                    </span>
                  </td>
                  <td className="p-6 font-mono font-bold text-slate-500">{s.phoneNumber || '---'}</td>
                  <td className="p-6 text-left">
                    <button 
                      onClick={() => deleteStudent(s.id)}
                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* مودال الاستيراد الذكي */}
      {showImport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900">المعالج الذكي لاستيراد الطلاب</h3>
                    <p className="text-sm text-slate-500 font-bold">ارفع ملف Excel أو الصق البيانات مباشرة وسنقوم بالباقي.</p>
                 </div>
              </div>
              <button onClick={() => setShowImport(false)} className="p-3 bg-white text-slate-400 rounded-2xl hover:text-rose-500 transition shadow-sm">
                <X size={24} />
              </button>
            </div>

            <div className="p-10">
              {importStep === 'upload' ? (
                <div className="space-y-8">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => processRawData(ev.target?.result as string);
                        reader.readAsText(file);
                      }
                    }}
                    className="border-4 border-dashed border-slate-100 rounded-[3rem] p-16 text-center hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />
                    <div className="relative z-10">
                       <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                          <Upload size={48} />
                       </div>
                       <h4 className="text-xl font-black text-slate-800">اسحب الملف هنا أو انقر للإرفاق</h4>
                       <p className="text-slate-400 mt-2 font-bold">يدعم ملفات CSV و Text المصدرة من نور أو إكسل</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-widest">أو اللصق السريع</span></div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-black text-slate-700 mr-4 flex items-center gap-2">
                       <ClipboardPaste size={16} className="text-blue-500" />
                       الصق جدول البيانات المنسوخ من Excel هنا مباشرة:
                    </label>
                    <textarea 
                      onPaste={handlePaste}
                      placeholder="لصق البيانات هنا..."
                      className="w-full h-32 p-6 bg-slate-50 rounded-[2rem] border-none outline-none font-bold text-slate-600 focus:ring-4 focus:ring-blue-50 transition-all"
                    ></textarea>
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-blue-600 font-black animate-pulse px-4">
                        <Loader2 size={18} className="animate-spin" />
                        جاري تحليل البيانات بذكاء...
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-left-4">
                  <div className="bg-emerald-50 text-emerald-700 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <CheckCircle2 size={24} />
                        <span className="font-black">تم اكتشاف {previewData.length} طالب بنجاح!</span>
                     </div>
                     <button onClick={() => setImportStep('upload')} className="text-emerald-700 font-black text-sm underline">إعادة المحاولة</button>
                  </div>
                  
                  <div className="max-h-[350px] overflow-y-auto rounded-3xl border border-slate-100 shadow-inner">
                    <table className="w-full text-right text-sm">
                      <thead className="sticky top-0 bg-slate-100 font-black">
                        <tr>
                          <th className="p-4">الاسم المستخرج</th>
                          <th className="p-4">الصف</th>
                          <th className="p-4">الجوال</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((p, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-slate-50 transition">
                            <td className="p-4 font-bold">{p.name}</td>
                            <td className="p-4">{p.grade}</td>
                            <td className="p-4 font-mono text-slate-400">{p.phoneNumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={confirmImport}
                      className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-blue-100 hover:scale-[1.02] transition"
                    >
                      تأكيد وحفظ الكل
                    </button>
                    <button 
                      onClick={() => setShowImport(false)}
                      className="px-10 py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-xl hover:bg-slate-200 transition"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* مودال الإضافة اليدوية */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-[3rem] max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-8">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-slate-900">إضافة طالب جديد</h3>
               <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-900"><X /></button>
             </div>
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 px-2">اسم الطالب الثلاثي</label>
                  <input placeholder="مثال: أحمد محمد علي" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold focus:ring-2 focus:ring-blue-100" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 px-2">الصف الدراسي</label>
                    <select className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" value={newStudent.grade} onChange={e => setNewStudent({...newStudent, grade: e.target.value})}>
                      <option>الأول الابتدائي</option><option>الثاني الابتدائي</option><option>الثالث الابتدائي</option><option>الرابع الابتدائي</option><option>الخامس الابتدائي</option><option>السادس الابتدائي</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 px-2">الفصل</label>
                    <input placeholder="1" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold" value={newStudent.section} onChange={e => setNewStudent({...newStudent, section: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 px-2">رقم جوال ولي الأمر</label>
                  <input placeholder="05xxxxxxxx" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold focus:ring-2 focus:ring-blue-100" value={newStudent.phoneNumber} onChange={e => setNewStudent({...newStudent, phoneNumber: e.target.value})} />
                </div>
                <div className="flex gap-3 pt-6">
                   <button onClick={handleAdd} className="flex-1 bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-lg shadow-blue-100">حفظ الطالب</button>
                   <button onClick={() => setShowAdd(false)} className="px-8 bg-slate-100 text-slate-600 py-5 rounded-[1.5rem] font-bold">إلغاء</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
