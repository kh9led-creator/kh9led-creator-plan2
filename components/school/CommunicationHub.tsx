
import React, { useState, useMemo, useEffect } from 'react';
import { MessageSquare, Send, User, Bell, Search, Users, Loader2 } from 'lucide-react';
import { Teacher } from '../../types.ts';
import { db } from '../../constants.tsx';

const CommunicationHub: React.FC<{ schoolId: string }> = ({ schoolId }) => {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'الإدارة', content: 'نرجو من الجميع إنهاء رصد الخطط قبل يوم الخميس الساعة ١٢ ظهراً.', time: 'منذ ساعتين', isOwn: false },
    { id: '2', sender: 'الإدارة', content: 'تم تفعيل ميزة رصد الغياب اليومي، نرجو الالتزام.', time: 'أمس', isOwn: false }
  ]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // @google/genai: جلب المعلمين بشكل غير متزامن لتجنب الشاشة البيضاء
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      const data = await db.getTeachers(schoolId);
      setTeachers(data);
      setLoading(false);
    };
    fetchTeachers();
  }, [schoolId]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [teachers, searchTerm]);

  const handleSend = () => {
    if(!newMessage.trim()) return;
    setMessages([...messages, { 
      id: Date.now().toString(), 
      sender: 'الإدارة', 
      content: newMessage, 
      time: 'الآن', 
      isOwn: true 
    }]);
    setNewMessage('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">مركز التواصل الداخلي</h2>
          <p className="text-slate-500 font-bold text-sm mt-1">تواصل مباشر وتعاميم رسمية لمدرستك.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-transform active:scale-95">
          <Bell size={18} /> إرسال تعميم عاجل
        </button>
      </div>

      <div className="card-neo h-[550px] flex overflow-hidden border border-slate-100">
        {/* Sidebar */}
        <div className="w-1/3 border-l bg-slate-50/30 flex flex-col hidden md:flex">
          <div className="p-4 border-b bg-white">
            <div className="relative">
              <Search size={16} className="absolute right-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="ابحث عن معلم..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pr-10 pl-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            <button className="w-full p-4 rounded-xl bg-indigo-600 text-white flex items-center gap-3 shadow-lg shadow-indigo-100 transition-all">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center font-black">
                <Users size={18} />
              </div>
              <div className="text-right">
                <div className="font-black text-sm">غرفة التعميمات العامة</div>
                <div className="text-[10px] opacity-70">المعلمون: {loading ? '...' : teachers.length}</div>
              </div>
            </button>
            <div className="h-px bg-slate-100 my-2 mx-2"></div>
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-300" /></div>
            ) : filteredTeachers.map(t => (
              <button key={t.id} className="w-full p-3.5 rounded-xl hover:bg-white transition flex items-center gap-3 text-right group">
                <div className="w-9 h-9 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center font-bold text-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{t.name[0]}</div>
                <div>
                  <div className="font-bold text-slate-700 text-sm">{t.name}</div>
                  <div className="text-[10px] text-slate-400">آخر ظهور: اليوم</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-5 border-b flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black"><Users size={20} /></div>
                <div>
                   <h3 className="font-black text-slate-800 text-base">غرفة التعميمات العامة</h3>
                   <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      قناة رسمية نشطة
                   </div>
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/10">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.isOwn ? 'items-start' : 'items-end'}`}>
                 <div className={`max-w-[85%] p-4 rounded-2xl font-bold shadow-sm text-sm leading-relaxed ${msg.isOwn ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none text-slate-700'}`}>
                    {msg.content}
                 </div>
                 <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-slate-400 font-black">{msg.sender}</span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400 font-bold">{msg.time}</span>
                 </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t shrink-0">
             <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="اكتب رسالتك أو التعميم هنا..."
                  className="flex-1 bg-transparent border-none outline-none p-3 font-bold text-sm"
                />
                <button 
                  onClick={handleSend}
                  className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                >
                  <Send size={20} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHub;
