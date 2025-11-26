import React, { useState, useEffect, useRef } from 'react';
import { DenunciaDraft } from '../../types';
import { ChevronRight, ChevronLeft, Upload, Send, Bot, User as UserIcon, FileText, Sparkles, AlertCircle, BookOpen, ExternalLink } from 'lucide-react';
import { interactWithComplaintGuide, ChatGuideResponse, getGroundedLegalInfo, GroundingSource } from '../../services/geminiService';

interface Props {
  draft: DenunciaDraft;
  updateDraft: (data: Partial<DenunciaDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    sources?: GroundingSource[]; // Support for citations
}

export const StepEvidence: React.FC<Props> = ({ draft, updateDraft, onNext, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [guideState, setGuideState] = useState<Partial<ChatGuideResponse>>({});
  const [searchMode, setSearchMode] = useState(false); // Toggle between Draft vs Search
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0) {
        setMessages([{
            id: 'init',
            role: 'model',
            text: `Hola. Soy tu asistente legal. Veo que estás reportando un incidente en ${draft.location?.address || 'esta ubicación'}. Para redactar tu denuncia correctamente, necesito que me cuentes: ¿Qué fue lo que sucedió, cuándo y quiénes están involucrados?`
        }]);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        if (searchMode) {
            // SEARCH GROUNDING MODE
            const response = await getGroundedLegalInfo(input);
            const aiMsg: Message = { 
                id: (Date.now() + 1).toString(), 
                role: 'model', 
                text: response.text,
                sources: response.sources
            };
            setMessages(prev => [...prev, aiMsg]);
            setSearchMode(false); // Reset to normal draft mode after search
        } else {
            // DRAFTING MODE
            const history = messages.filter(m => !m.sources).map(m => ({ role: m.role, text: m.text })); // Filter out search results from draft context if needed
            const locationCtx = draft.location ? `${draft.location.address} (${draft.location.lat}, ${draft.location.lng})` : undefined;
            
            const response = await interactWithComplaintGuide([...history, { role: 'user', text: userMsg.text }], locationCtx);
            
            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: response.message };
            setMessages(prev => [...prev, aiMsg]);
            setGuideState(response);

            // Update the main draft
            updateDraft({
                description: response.draftNarrative,
                aiAnalysis: {
                    competency: response.competency,
                    legalBasis: response.legalBasis,
                    summary: "Generado por Asistente IA"
                }
            });
        }

    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Tuve un problema conectando con el servidor legal. Por favor intenta de nuevo." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      updateDraft({ evidenceFiles: [...draft.evidenceFiles, ...newFiles] });
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-zinc-950">
      
      {/* Left Panel: Chat Interface */}
      <div className="lg:w-1/2 flex flex-col border-r border-zinc-800 h-[500px] lg:h-auto">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${searchMode ? 'bg-blue-600' : 'bg-gradient-to-tr from-pink-600 to-purple-600'}`}>
                    {searchMode ? <BookOpen size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm">{searchMode ? 'Búsqueda Legal' : 'Asistente Legal IA'}</h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{searchMode ? 'Consultando leyes (Google Search)' : 'Entrevista Guiada (CoT)'}</p>
                </div>
            </div>
            
            <button 
                onClick={() => setSearchMode(!searchMode)}
                className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-full border transition-all ${searchMode ? 'bg-white text-zinc-900 border-white' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                title="Alternar entre redactar denuncia y buscar leyes"
            >
                {searchMode ? 'Volver a Redacción' : 'Consultar Normatividad'}
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950" ref={scrollRef}>
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-zinc-800 text-zinc-400' : (msg.sources ? 'bg-blue-900/20 text-blue-400' : 'bg-pink-900/20 text-pink-500')}`}>
                        {msg.role === 'user' ? <UserIcon size={14} /> : (msg.sources ? <BookOpen size={14} /> : <Sparkles size={14} />)}
                    </div>
                    <div className="max-w-[85%] flex flex-col gap-2">
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-zinc-800 text-zinc-200 rounded-tr-none' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'}`}>
                            {msg.text}
                        </div>
                        
                        {/* Grounding Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="ml-2 flex flex-wrap gap-2">
                                {msg.sources.map((source, idx) => (
                                    <a 
                                        key={idx} 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center gap-1 text-[10px] bg-blue-900/10 border border-blue-800/50 text-blue-400 px-2 py-1 rounded-md hover:bg-blue-900/30 transition-colors"
                                    >
                                        <ExternalLink size={10} />
                                        <span className="truncate max-w-[150px]">{source.title}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${searchMode ? 'bg-blue-900/20 text-blue-500' : 'bg-pink-900/20 text-pink-500'}`}>
                        {searchMode ? <BookOpen size={14} className="animate-pulse" /> : <Sparkles size={14} className="animate-pulse" />}
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl rounded-tl-none text-xs text-zinc-500 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${searchMode ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                        <span className={`w-1.5 h-1.5 rounded-full animate-bounce delay-100 ${searchMode ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                        <span className={`w-1.5 h-1.5 rounded-full animate-bounce delay-200 ${searchMode ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                        {searchMode ? 'Buscando leyes en gob.mx...' : 'Analizando hechos...'}
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 bg-zinc-900 border-t border-zinc-800">
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={searchMode ? "Ej: ¿Cuál es la multa por talar árboles?" : "Escribe aquí lo sucedido..."}
                    disabled={isLoading}
                    className={`w-full bg-zinc-950 border rounded-full pl-4 pr-12 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-600 ${searchMode ? 'border-blue-900/50 focus:ring-1 focus:ring-blue-500' : 'border-zinc-800 focus:ring-1 focus:ring-pink-500'}`}
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className={`absolute right-1 top-1 bottom-1 w-10 rounded-full flex items-center justify-center transition-colors ${searchMode ? 'bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white' : 'bg-zinc-800 hover:bg-pink-600 text-zinc-400 hover:text-white'}`}
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
      </div>

      {/* Right Panel: Live Draft & Evidence */}
      <div className="lg:w-1/2 flex flex-col h-full bg-zinc-900/20">
         <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Live Draft Card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                <div className="bg-zinc-900 p-3 border-b border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-pink-500" />
                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Borrador Legal en Vivo</span>
                    </div>
                    {guideState.competency && (
                        <span className="text-[10px] font-bold bg-pink-900/30 text-pink-400 px-2 py-0.5 rounded border border-pink-500/20">
                            {guideState.competency}
                        </span>
                    )}
                </div>
                <textarea 
                    value={draft.description}
                    onChange={(e) => updateDraft({ description: e.target.value })}
                    className="w-full h-[300px] bg-zinc-950 p-4 text-sm text-zinc-300 font-serif leading-relaxed focus:outline-none resize-none"
                    placeholder="El borrador se generará automáticamente aquí mientras conversas..."
                />
                {guideState.missingElements && guideState.missingElements.length > 0 && (
                    <div className="bg-red-900/10 border-t border-red-900/20 p-3">
                        <p className="text-[10px] text-red-400 font-bold uppercase mb-1 flex items-center gap-1">
                            <AlertCircle size={10} /> Faltan Datos:
                        </p>
                        <div className="flex gap-2">
                            {guideState.missingElements.map(el => (
                                <span key={el} className="text-[10px] bg-red-900/20 text-red-300 px-1.5 py-0.5 rounded">{el}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Evidence Upload */}
            <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Adjuntar Evidencia</label>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    <div className="relative flex-shrink-0 w-24 h-24 bg-zinc-900 border border-zinc-800 border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-pink-500 hover:border-pink-500/50 transition-colors cursor-pointer">
                        <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <Upload size={20} />
                        <span className="text-[10px] font-bold mt-1">Subir</span>
                    </div>
                    {draft.evidenceFiles.map((file, idx) => (
                        <div key={idx} className="flex-shrink-0 w-24 h-24 bg-zinc-800 rounded-xl border border-zinc-700 flex flex-col items-center justify-center p-2 relative group">
                            <FileText size={20} className="text-zinc-400 mb-1" />
                            <span className="text-[9px] text-zinc-300 text-center break-all line-clamp-2">{file.name}</span>
                        </div>
                    ))}
                </div>
            </div>

         </div>

         <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center">
            <button onClick={onBack} className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <ChevronLeft size={14} /> Atrás
            </button>
            <button 
                onClick={onNext}
                disabled={!draft.description || draft.description.length < 20}
                className="group relative px-6 py-3 rounded-full font-bold text-white overflow-hidden text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
                 <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 transition-all duration-300 group-hover:scale-105"></div>
                 <span className="relative flex items-center gap-2">
                    Finalizar <ChevronRight size={14} />
                 </span>
            </button>
         </div>
      </div>

    </div>
  );
};
