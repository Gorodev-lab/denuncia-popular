
import React from 'react';
import { Step, DenunciaDraft } from '../types';
import { StepNavigation } from './StepNavigation';
import { StepInfo } from './steps/StepInfo';
import { StepLocation } from './steps/StepLocation';
import { StepEvidence } from './steps/StepEvidence';
import { StepReview } from './steps/StepReview';
import { HomePage } from './HomePage';
import { CheckCircle2, RefreshCw } from 'lucide-react';

interface WizardProps {
  step: Step;
  setStep: (step: Step) => void;
  draft: DenunciaDraft;
  updateDraft: (data: Partial<DenunciaDraft>) => void;
}

export const Wizard: React.FC<WizardProps> = ({ step, setStep, draft, updateDraft }) => {

  const next = () => setStep(step + 1);
  const back = () => setStep(step - 1);

  const renderContent = () => {
    switch (step) {
      case Step.HOME:
        return <HomePage onStart={() => setStep(Step.LOCATION)} />;
      case Step.LOCATION:
        // First Step: Location (No back action)
        return <StepLocation draft={draft} updateDraft={updateDraft} onNext={next} />;
      case Step.INFO:
        // Second Step: Info (Back to Location)
        return <StepInfo draft={draft} updateDraft={updateDraft} onNext={next} onBack={back} />;
      case Step.EVIDENCE:
        // Third Step: Evidence
        return <StepEvidence draft={draft} updateDraft={updateDraft} onNext={next} onBack={back} />;
      case Step.REVIEW:
        // Fourth Step: Review
        return <StepReview draft={draft} onBack={back} onSubmit={() => setStep(Step.SUCCESS)} />;
      case Step.SUCCESS:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 md:p-16 text-center animate-fade-in min-h-[500px]">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-green-500 blur-3xl opacity-20 rounded-full"></div>
              <div className="relative w-24 h-24 bg-zinc-900/80 border border-green-500/30 text-green-500 rounded-full flex items-center justify-center ring-1 ring-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <CheckCircle2 size={48} />
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
              Denuncia Registrada
            </h2>

            <p className="text-zinc-400 max-w-lg mb-12 text-lg leading-relaxed">
              Se ha generado el folio <strong className="text-white font-mono bg-zinc-800 px-2 py-1 rounded border border-zinc-700">#MX-2025-8492</strong>.
              <br />Hemos enviado una copia del PDF firmado a tu correo.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="group px-8 py-4 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold hover:bg-zinc-800 hover:text-white hover:border-zinc-500 transition-all duration-300 flex items-center gap-2"
            >
              <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              Iniciar Nueva Denuncia
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-black/40 backdrop-blur-sm">
      {step !== Step.HOME && <StepNavigation currentStep={step} />}
      <div className="flex-1 w-full max-w-5xl mx-auto p-4">
        {/* Card Container with Glow Effect */}
        <div className="relative w-full h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-2xl opacity-20 blur-lg"></div>
          <div className="relative w-full h-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
