
import React, { useState, useEffect } from 'react';
import { DenunciaDraft, Step } from './types';
import { Wizard } from './components/Wizard';
import { useDenunciaDraft } from './hooks/useDenunciaDraft';
import { useWizardNavigation } from './hooks/useWizardNavigation';
import { supabase } from './services/supabase';
import { ChatBot } from './components/ChatBot';
import { MessageCircle, X } from 'lucide-react';
import { FeedbackWidget } from './components/FeedbackWidget';

import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  // Initialize step to LOCATION (0) - Map is the Home Page
  const { currentStep, goToStep: setCurrentStep } = useWizardNavigation();

  const { draft, updateDraft: handleUpdateDraft } = useDenunciaDraft();

  // Anonymous Auth for RLS
  useEffect(() => {
    const signIn = async () => {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) console.error('Error signing in anonymously:', error);
    };
    signIn();
  }, []);

  return (
    <div className="min-h-screen bg-background text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white overflow-hidden">

      {/* Navigation Header */}
      <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 h-16">
        <a
          href="https://www.esoteriaai.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-lg font-bold tracking-tight cursor-pointer bg-transparent border-none p-0 hover:opacity-80 transition-opacity"
          aria-label="Visit Esoteria AI"
        >
          <span className="text-white"><span className="text-accent mr-1">&gt;</span>Esoteria AI</span>
          <span className="w-1.5 h-4 bg-pink-500 animate-blink ml-1"></span>
        </a>

        <div className="flex items-center gap-4">
          <span className="hidden md:block text-xs font-mono text-zinc-500">
            DENUNCIA POPULAR v2.0
          </span>
          {/* Language Toggle */}
          <div className="flex items-center text-[10px] font-bold border border-zinc-800 rounded-md overflow-hidden p-0.5 bg-zinc-900">
            <button
              onClick={() => setLanguage('EN')}
              aria-pressed={language === 'EN'}
              className={`px-2 py-1 rounded transition-all duration-300 ${language === 'EN' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ES')}
              aria-pressed={language === 'ES'}
              className={`px-2 py-1 rounded transition-all duration-300 ${language === 'ES' ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              ES
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Direct to Tool */}
      <main className="flex-1 flex flex-col relative z-0 overflow-hidden">
        <div className="flex-1 w-full h-full relative">
          <Wizard
            step={currentStep}
            setStep={setCurrentStep}
            draft={draft}
            updateDraft={handleUpdateDraft}
          />
        </div>
      </main>

      <FeedbackWidget />

      {/* Floating Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`
                w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border border-zinc-700
                ${isChatOpen ? 'bg-zinc-900 text-zinc-400 rotate-90' : 'bg-black text-pink-500 hover:text-white hover:bg-pink-600 hover:border-pink-500'}
            `}
        >
          {isChatOpen ? <X size={20} /> : <MessageCircle size={20} />}
        </button>
      </div>

    </div>
  );
};

export default App;
