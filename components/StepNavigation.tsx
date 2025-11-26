
import React from 'react';
import { Step } from '../types';
import { Check, User, MapPin, Camera, FileText } from 'lucide-react';

interface StepNavigationProps {
  currentStep: Step;
}

// REORDERED: Location is first
const steps = [
  { id: Step.LOCATION, label: 'Ubicación', icon: MapPin },
  { id: Step.INFO, label: 'Datos', icon: User },
  { id: Step.EVIDENCE, label: 'Evidencia', icon: Camera },
  { id: Step.REVIEW, label: 'Revisión', icon: FileText },
];

export const StepNavigation: React.FC<StepNavigationProps> = ({ currentStep }) => {
  if (currentStep === Step.SUCCESS) return null;

  return (
    <nav className="w-full py-8 px-4" aria-label="Wizard Progress">
      <div className="max-w-4xl mx-auto">
        <ol className="flex justify-between items-center relative">
          
          {/* Progress Bar Background */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -z-10 rounded-full" />
          
          {/* Active Progress Bar */}
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-red-600 to-pink-600 -z-10 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((s) => {
            const isActive = s.id === currentStep;
            const isCompleted = s.id < currentStep;
            const Icon = s.icon;

            return (
              <li key={s.id} className="flex flex-col items-center gap-2 group" aria-current={isActive ? 'step' : undefined}>
                <div 
                  className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2
                    ${isActive 
                      ? 'bg-zinc-950 border-pink-500 text-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)] scale-110' 
                      : isCompleted 
                        ? 'bg-gradient-to-r from-red-600 to-pink-600 border-transparent text-white' 
                        : 'bg-zinc-900 border-zinc-700 text-zinc-600'}
                  `}
                >
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                </div>
                <span 
                  className={`
                    text-[10px] md:text-xs uppercase tracking-widest font-bold transition-all duration-300
                    ${isActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 translate-y-0' : 'text-zinc-600 translate-y-1'}
                  `}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
