
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle2, Loader2, X, AlertCircle } from 'lucide-react';
import { db } from '../../constants';

interface Props {
  schoolId: string;
  onSuccess: () => void;
}

const BulkStudentImport: React.FC<Props> = ({ schoolId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) throw new Error('الملف فارغ أو غير متوافق');

      // معالجة البيانات لتطابق قاعدة البيانات
      const processed = rows.map((row, i) => ({
        id: `std-${Date.now()}-${i}`,
        name: row['الاسم'] || row['اسم الطالب'] || row['Name'],
        grade: row['الصف'] || row['Grade'],
        section: row['الفصل'] || row['Section'],
        schoolId: schoolId
      })).filter(s => s.name);

      setPreview(processed);
    } catch (err: any) {
      setError(err.message || 'خطأ في قراءة ملف الإكسل');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!preview) return;
    setLoading(true);
    const result = await db.importStudents({ students: preview, schoolId });
    if (result.success) {
      onSuccess();
      setPreview(null);
    } else {
      setError(result.error || 'فشل في حفظ البيانات');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 font-['Tajawal']" dir="rtl">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
          <FileSpreadsheet size={28} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">استيراد جماعي للطلاب</h3>
          <p className="text-slate-400 font-bold text-xs mt-1">ارفع ملف الإكسل المستخرج من نظام نور.</p>
        </div>
      </div>

      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center hover:bg-slate-50 hover:border-emerald-200 transition-all cursor-pointer group"
        >
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
          {loading ? <Loader2 className="animate-spin text-emerald-600 mx-auto" size={48} /> : (
            <>
              <Upload className="mx-auto text-slate-300 group-hover:text-emerald-500 transition-colors mb-4" size={48} />
              <p className="text-slate-500 font-black">اضغط لرفع ملف الإكسل</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
           <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-emerald-900 font-black">تم تحليل الملف بنجاح!</p>
                <p className="text-emerald-600 font-bold text-sm">وجدنا {preview.length} طالباً جاهزين للاستيراد.</p>
              </div>
              <button onClick={() => setPreview(null)} className="text-emerald-400 hover:text-emerald-600"><X size={20} /></button>
           </div>
           
           <button 
             onClick={handleUpload}
             disabled={loading}
             className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition flex items-center justify-center gap-3"
           >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <><CheckCircle2 size={24} /> تأكيد الاستيراد والحفظ</>}
           </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl flex items-center gap-3 text-xs font-black">
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </div>
  );
};

export default BulkStudentImport;
