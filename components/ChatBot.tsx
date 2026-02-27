
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

// Initialize Gemini Client specifically for the ChatBot
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Bienvenido al Entorno de Gobernanza de Esoteria. Iniciando análisis de hechos para estructuración de denuncia. ¿En qué puedo ayudarle hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [auditId, setAuditId] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate Governance Audit ID
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    setAuditId(`ESO-${randomStr}`);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Use gemini-2.5-flash for fast general responses or gemini-3-pro-preview if configured
      const modelId = 'gemini-1.5-flash';

      const response = await ai.models.generateContent({
        model: modelId,
        contents: [
          { role: 'user', parts: [{ text: "System: Act as a Legal Aid Assistant for Mexican Citizens. Your goal is to help users describe their complaints clearly and objectively. Do not give legal advice, but guide them to provide necessary details like Time, Location, and Description. Be concise, professional, and helpful." }] },
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: input }] }
        ]
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "Lo siento, no pude procesar eso."
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Error de conexión." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-8 w-[350px] h-[500px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="p-4 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-900/20">
            <Bot size={18} className="text-white" />
          </div>
          <span className="font-bold text-zinc-200 text-xs tracking-widest uppercase">Esoteria Intelligence Interface</span>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-zinc-800' : 'bg-pink-900/20'}`}>
              {msg.role === 'user' ? <User size={14} className="text-zinc-400" /> : <Sparkles size={14} className="text-pink-500" />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user'
              ? 'bg-zinc-800 text-white rounded-tr-none'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 ml-10">
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce delay-100"></span>
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce delay-200"></span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-900/50 border-t border-zinc-800">
        <div className="relative mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Analizar hechos..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-full pl-4 pr-10 py-3 text-xs text-white focus:ring-1 focus:ring-pink-500 outline-none"
          />
          <button
            onClick={handleSend}
            className="absolute right-1 top-1 bottom-1 w-8 bg-zinc-800 hover:bg-pink-600 text-zinc-400 hover:text-white rounded-full flex items-center justify-center transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">LORE Engine Active</span>
          </div>
          <div className="text-[9px] font-mono text-zinc-600 bg-zinc-950/50 px-2 py-0.5 rounded border border-zinc-900/50">
            Audit ID: <span className="text-zinc-400">{auditId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
