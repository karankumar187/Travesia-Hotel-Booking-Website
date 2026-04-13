import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext1';
import { MessageSquare, X, Send } from 'lucide-react';

const AIConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am Travesia AI. How can I help you plan your trip today? Try asking "Find me a cheap room in Paris" or "Show me luxury suites."' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { axios } = useAppContext();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/api/ai/recommend", { message: userMessage });
      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply || "API Error." }]);
      }
    } catch(err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Network error fetching recommendation." }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition transform hover:scale-110 z-50 ${isOpen ? 'hidden' : 'block'} cursor-pointer`}
      >
        <MessageSquare size={24} />
      </button>

      <div className={`fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col transition-all transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        <div className="bg-blue-600 px-4 py-4 rounded-t-2xl flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} />
            <h3 className="font-semibold">Travesia AI</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:text-blue-200 transition cursor-pointer text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border text-gray-800 shadow-sm rounded-bl-none'}`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed inline-block">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-white border text-gray-800 shadow-sm px-4 py-2 rounded-2xl rounded-bl-none flex gap-1">
                 <span className="animate-bounce inline-block">.</span>
                 <span className="animate-bounce inline-block" style={{ animationDelay: '0.2s' }}>.</span>
                 <span className="animate-bounce inline-block" style={{ animationDelay: '0.4s' }}>.</span>
               </div>
             </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-3 bg-white border-t rounded-b-2xl flex gap-2 w-full box-border">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g. cozy room in NYC..."
            className="flex-1 px-4 py-2 border rounded-full text-sm outline-none focus:border-blue-500 w-full"
          />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer">
            <Send size={18} className="translate-x-[1px]" />
          </button>
        </form>
      </div>
    </>
  );
};
export default AIConcierge;
