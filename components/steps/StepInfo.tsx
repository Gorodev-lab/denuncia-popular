
import React from 'react';
import { DenunciaDraft } from '../../types';
import { ChevronRight, ChevronLeft, User, Mail, Users, Briefcase, HelpCircle } from 'lucide-react';

interface Props {
  draft: DenunciaDraft;
  updateDraft: (data: Partial<DenunciaDraft>) => void;
  onNext: () => void;
  onBack?: () => void; // Added Back Handler
}

export const StepInfo: React.FC<Props> = ({ draft, updateDraft, onNext, onBack }) => {
  const isValid = draft.isAnonymous || (draft.fullName.length > 3 && draft.email.includes('@'));

  // Handler specifically for the toggle to prevent propagation issues
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Critical to prevent form submit or other weirdness
    updateDraft({ isAnonymous: !draft.isAnonymous });
  };

  // Accessibility handler for keyboard toggle
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      updateDraft({ isAnonymous: !draft.isAnonymous });
    }
  }

  return (
    <div className="p-8 md:p-12 h-full flex flex-col justify-center max-w-3xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-purple-500">
            Identidad del Denunciante
          </span>
        </h2>
        <p className="text-zinc-400">
          Proporciona tus datos para dar seguimiento legal. Tu privacidad es nuestra prioridad.
        </p>
      </div>

      <div className="space-y-8">
        {/* Anonymous Switch Card - Completely Interactive */}
        <button
          type="button"
          role="switch"
          aria-checked={draft.isAnonymous}
          aria-label="Activar Denuncia Anónima"
          className={`
            w-full text-left relative p-6 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-zinc-950
            ${draft.isAnonymous
              ? 'bg-pink-900/10 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.1)]'
              : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}
          `}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
        >
          <div className="pr-4">
            <h3 className={`font-bold text-lg transition-colors ${draft.isAnonymous ? 'text-pink-400' : 'text-white'}`}>
              Denuncia Anónima
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              {draft.isAnonymous
                ? "Protección de identidad activada. No se requerirán datos personales."
                : "Sus datos no aparecerán en el documento público, pero son necesarios para notificaciones."}
            </p>
          </div>

          {/* Custom Switch Component */}
          <div className="flex-shrink-0">
            <div
              className={`
                    w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ease-in-out shadow-inner
                    ${draft.isAnonymous ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-zinc-700'}
                `}
            >
              <div
                className={`
                    bg-white w-6 h-6 rounded-full shadow-lg transform transition-transform duration-300 ease-in-out
                    ${draft.isAnonymous ? 'translate-x-6' : 'translate-x-0'}
                  `}
              />
            </div>
          </div>
        </button>

        {/* Form Fields Container */}
        <div className="relative">
          {/* Overlay to prevent interaction when anonymous */}
          {draft.isAnonymous && (
            <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-zinc-950/20 transition-all duration-500 rounded-xl" />
          )}

          <div className={`space-y-6 transition-all duration-500 ${draft.isAnonymous ? 'opacity-40 grayscale' : 'opacity-100'}`}>
            <div className="group">
              <label htmlFor="fullName" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 group-focus-within:text-pink-500 transition-colors">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-600 group-focus-within:text-pink-500 transition-colors" size={20} />
                <input
                  id="fullName"
                  type="text"
                  value={draft.fullName}
                  onChange={(e) => updateDraft({ fullName: e.target.value })}
                  placeholder="EJ. JUAN PÉREZ HERNÁNDEZ"
                  disabled={draft.isAnonymous}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all font-mono disabled:bg-zinc-900/50"
                />
              </div>
            </div>

            <div className="group">
              <label htmlFor="email" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 group-focus-within:text-pink-500 transition-colors">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-600 group-focus-within:text-pink-500 transition-colors" size={20} />
                <input
                  id="email"
                  type="email"
                  value={draft.email}
                  onChange={(e) => updateDraft({ email: e.target.value })}
                  placeholder="CONTACTO@EJEMPLO.COM"
                  disabled={draft.isAnonymous}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all font-mono disabled:bg-zinc-900/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Research Section - Always Active */}
      <div className="pt-8 border-t border-zinc-800 animate-fade-in">
        <h3 className="text-xl font-bold mb-6 text-zinc-300 flex items-center gap-2">
          <Users size={20} className="text-pink-500" />
          Información Estadística <span className="text-xs font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800 ml-2">OPCIONAL</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age */}
          <div className="group">
            <label htmlFor="age" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 group-focus-within:text-pink-500 transition-colors">Edad</label>
            <input
              id="age"
              type="number"
              value={draft.age || ''}
              onChange={(e) => updateDraft({ age: e.target.value })}
              placeholder="EJ. 35"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all font-mono"
            />
          </div>

          {/* Gender */}
          <div className="group">
            <label htmlFor="gender" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 group-focus-within:text-pink-500 transition-colors">Género</label>
            <select
              id="gender"
              value={draft.gender || ''}
              onChange={(e) => updateDraft({ gender: e.target.value as any })}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Seleccionar...</option>
              <option value="MALE">Masculino</option>
              <option value="FEMALE">Femenino</option>
              <option value="OTHER">Otro</option>
              <option value="PREFER_NOT_TO_SAY">Prefiero no decir</option>
            </select>
          </div>

          {/* Occupation */}
          <div className="group">
            <label htmlFor="occupation" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 group-focus-within:text-pink-500 transition-colors">Ocupación</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-600 group-focus-within:text-pink-500 transition-colors" size={18} />
              <input
                id="occupation"
                type="text"
                value={draft.occupation || ''}
                onChange={(e) => updateDraft({ occupation: e.target.value })}
                placeholder="EJ. ABOGADO"
                className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all font-mono"
              />
            </div>
          </div>

          {/* Referral */}
          <div className="group">
            <label htmlFor="referral" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 group-focus-within:text-pink-500 transition-colors">¿Cómo nos conociste?</label>
            <div className="relative">
              <HelpCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-600 group-focus-within:text-pink-500 transition-colors" size={18} />
              <select
                id="referral"
                value={draft.referralSource || ''}
                onChange={(e) => updateDraft({ referralSource: e.target.value as any })}
                className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Seleccionar...</option>
                <option value="SOCIAL_MEDIA">Redes Sociales</option>
                <option value="FRIEND">Amigo / Familiar</option>
                <option value="AD">Publicidad</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-between items-center">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-zinc-500 hover:text-white font-medium flex items-center gap-2 px-4 py-2 transition-colors uppercase text-xs tracking-widest"
          >
            <ChevronLeft size={16} />
            Volver
          </button>
        ) : <div />}

        <div className="flex flex-col items-end">
          {!isValid && (
            <span className="text-[10px] text-red-500 mb-2 font-bold uppercase tracking-widest animate-pulse">
              Completa los campos obligatorios
            </span>
          )}
          <button
            onClick={onNext}
            disabled={!isValid}
            className="
                group relative px-8 py-4 rounded-full font-bold text-white overflow-hidden
                disabled:opacity-50 disabled:cursor-not-allowed transition-all
            "
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 transition-all duration-300 group-hover:scale-105"></div>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
              Siguiente Paso
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
