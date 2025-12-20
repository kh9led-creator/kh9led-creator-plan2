
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '../../constants.tsx';
import { Student } from '../../types.ts';
import * as XLSX from 'xlsx';
import { 
  Plus, Search, Trash2, CheckCircle2, 
  X, Sparkles, Loader2, User, 
  FileSpreadsheet, Upload, 
  Edit2, Users, AlertCircle, 
  FileUp, Info
} from 'lucide-react';

const StudentsManagement: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', grade: 'الأول الابتدائي', section: '1', phoneNumber: '' });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempImportData, setTempImportData] = useState<Student[] | null>(null);
  const [importSummary, setImportSummary] = useState<{count: number, samples: string[]} | null>(null);
  const [importError, setImportError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const loadData = async () => {
    setLoading(true);
    const data = await db.getStudents(schoolId);
    setStudents(data);
    setLoading(false);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    setImportError('');
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
      
      const extracted: Student[] = [];
      const timestamp = Date.now().toString(36);

      rows.slice(1).forEach((row, index) => {
        const name = String(row[0] || '').trim();
        if (name && name.length > 3) {
          extracted.push({
            id: `s-${timestamp}-${index}`,
            name,
            phoneNumber: String(row[1] || ''),
            grade: String(row[2] || 'غير محدد'),
            section: String(row[3] || '1'),
            schoolId
          });
        }
      });

      if (extracted.length > 0) {
        setImportSummary({ count: extracted.length, samples: extracted.slice(0, 3).map(s => s.name) });
        setTempImportData(extracted);
      } else {
        setImportError('لم يتم العثور على بيانات صالحة.');
      }
    } catch (err) { setImportError('خطأ في معالجة الملف.'); }
    setIsProcessing(false);
  };

  const confirmAndSave = async () => {
    if (!tempImportData) return;
    setIsProcessing(true);
    await db.saveBulkStudents(tempImportData);
    await loadData();
    setShowImport(false);
    setTempImportData(null);
    setIsProcessing(false);
    alert('تم الحفظ بنجاح بنظام مشفر وآمن.');
  };

  const handleSaveManual = async () => {
    if (!formData.name) return alert('الاسم مطلوب');
    const student: Student = {
      id: editingStudent ? editingStudent.id : `m-${Date.now()}`,
      ...formData,
      schoolId
    };
    await db.saveStudent(student);
    await loadData();
    setShowForm(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Users size={28} /></div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">إدارة الطلاب</h2>
            <p className="text-slate-400 font-bold text-sm">قاعدة بيانات آمنة | الإجمالي: {students.length}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowImport(true)} className="bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition shadow-md text-sm">
            <FileSpreadsheet size={18} /> استيراد Excel
          </button>
          <button onClick={() => { setEditingStudent(null); setShowForm(true); }} className="bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-md text-sm">
            <Plus size={18} /> إضافة يدوي
          </button>
        </div>
      </div>

      <div className="card-neo overflow-hidden min-h-[400px] flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
             <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <span className="font-black text-slate-600">جاري الاتصال بقاعدة البيانات...</span>
             </div>
          </div>
        )}
        
        <div className="p-6 border-b bg-slate-50/20">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute right-4 top-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو الصف..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" 
            />
          </div>
        </div>
        
        <div className="table-container flex-1">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-5">اسم الطالب</th>
                <th className="p-5 text-center">الصف</th>
                <th className="p-5 text-center">الفصل</th>
                <th className="p-5 text-left">التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 && !loading ? (
                <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-bold italic">لا توجد سجلات حالياً.</td></tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-5 font-bold text-slate-700">{s.name}</td>
                    <td className="p-5 text-center"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">{s.grade}</span></td>
                    <td className="p-5 text-center text-slate-500 font-bold">{s.section}</td>
                    <td className="p-5 text-left">
                       <button onClick={() => { setEditingStudent(s); setFormData({name:s.name, grade:s.grade, section:s.section, phoneNumber:s.phoneNumber}); setShowForm(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[3rem] max-w-xl w-full shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900">استيراد آمن للبيانات</h3>
                <button onClick={() => setShowImport(false)} className="p-2 text-slate-400"><X size={24} /></button>
             </div>

             {!importSummary ? (
               <div className="border-4 border-dashed rounded-[2.5rem] h-64 flex flex-col items-center justify-center bg-slate-50">
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && processExcelFile(e.target.files[0])} />
                  <Upload size={48} className="text-slate-300 mb-4" />
                  <button onClick={() => fileInputRef.current?.click()} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black">اختيار ملف Excel</button>
               </div>
             ) : (
               <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
                  <h4 className="text-xl font-black text-emerald-900 mb-2">اكتشاف {importSummary.count} سجل</h4>
                  <p className="text-sm font-bold text-emerald-600 mb-6">سيتم تشفير البيانات وحفظها فور التأكيد.</p>
                  <div className="flex gap-4">
                     <button onClick={() => setImportSummary(null)} className="flex-1 py-4 bg-white rounded-2xl font-black">إلغاء</button>
                     <button onClick={confirmAndSave} disabled={isProcessing} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2">
                        {isProcessing ? <Loader2 className="animate-spin" /> : 'تأكيد وحفظ مشفر'}
                     </button>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
