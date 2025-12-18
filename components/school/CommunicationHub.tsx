
import React, { useState } from 'react';
import { MessageSquare, Send, User, Bell, Search } from 'lucide-react';
import { MOCK_TEACHERS } from '../../constants';

const CommunicationHub: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'الإدارة', content: 'نرجو من الجميع إنهاء رصد الخطط قبل يوم الخميس الساعة ١٢ ظهراً.', time: 'منذ ساعتين', isOwn: false },
    { id: '2', sender: 'الإدارة', content: 'تم تحديث نظام طباعة الطلاب، يمكنكم الآن معاينة النسخة النهائية.', time: 'أمس', isOwn: false }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if(!newMessage) return;
    setMessages([...messages, { id: Date.now().toString(), sender: 'الإدارة', content: newMessage, time: 'الآن', isOwn: true }]);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">مركز التواصل الداخلي</h2>
          <p className="text-slate-500">أرسل التعاميم والتوجيهات لجميع المعلمين أو تواصل بشكل خاص.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 border border-blue-100">
             <Bell size={20} />
             إرسال تعميم عام
           </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border shadow-sm flex overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-80 border-l bg-slate-50/50 flex flex-col">
          <div className="p-6 border-b bg-white">
             <div className="relative">
                <Search size={16} className="absolute right-4 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ابحث عن معلم..." 
                  className="w-full bg-slate-50 border-none rounded-xl py-2 pr-10 pl-4 text-sm font-bold"
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
             <button className="w-full p-4 rounded-2xl bg-blue-600 text-white flex items-center gap-3 shadow-lg shadow-blue-100 text-right">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black">ج</div>
                <div>
                   <div className="font-bold">الجميع (غرفة عامة)</div>
                   <div className="text-xs opacity-70">٣٢ معلم متصل</div>
                </div>
             </button>
             {MOCK_TEACHERS.map(t => (
               <button key={t.id} className="w-full p-4 rounded-2xl hover:bg-white transition flex items-center gap-3 text-right">
                  <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-bold">{t.name[0]}</div>
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-xs text-slate-400">نشط منذ ٥ د</div>
                  </div>
               </button>
             ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b flex justify-between items-center bg-white">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">ج</div>
                <div>
                   <h3 className="font-black text-slate-800">غرفة تعميمات المعلمين</h3>
                   <p className="text-xs text-emerald-500 font-bold">قناة إرسال رسمية</p>
                </div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.isOwn ? 'items-start' : 'items-end'}`}>
                 <div className={`max-w-md p-5 rounded-[1.5rem] font-bold shadow-sm ${msg.isOwn ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none'}`}>
                    {msg.content}
                 </div>
                 <span className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-widest">{msg.time} - {msg.sender}</span>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white border-t">
             <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="اكتب رسالتك أو تعميمك هنا..."
                  className="flex-1 bg-transparent border-none outline-none p-4 font-bold"
                />
                <button 
                  onClick={handleSend}
                  className="bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-100 hover:scale-105 transition"
                >
                  <Send size={24} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHub;
