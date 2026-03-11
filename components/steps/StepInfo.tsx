
import React, { useMemo } from 'react';
import { DenunciaDraft } from '../../types';
import { ChevronRight, ChevronLeft, User, Mail, Users, Briefcase, HelpCircle } from 'lucide-react';

// --- CONSTANTS ---
const SUBJECT_TYPES = [
  { id: 'NO_CONOCIMIENTO', label: 'No tengo conocimiento' },
  { id: 'GOBIERNO', label: 'Gobierno' },
  { id: 'EMPRESA', label: 'Empresa' },
  { id: 'PARTICULAR', label: 'Particular' }
] as const;

type SubjectTypeId = typeof SUBJECT_TYPES[number]['id'];

interface Props {
  draft: DenunciaDraft;
  updateDraft: (data: Partial<DenunciaDraft>) => void;
  onNext: () => void;
  onBack?: () => void;
}

// --- HELPERS ---
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isDraftValid = (draft: DenunciaDraft): boolean => {
  if (draft.isAnonymous) return true;
  return draft.fullName.trim().length > 3 && isValidEmail(draft.email);
};

// --- SUB-COMPONENTS ---
const HeaderSection = () => (
  <div className="mb-8 animate-fade-in">
    <h2 className="text-3xl md:text-4xl font-bold mb-2">
      <span className="text-red-600">Identidad del Denunciante</span>
    </h2>
    <p className="text-zinc-400">
      Proporciona tus datos para dar seguimiento legal. Tu privacidad es nuestra prioridad.
    </p>
  </div>
);

interface InputFieldProps {
  label: string;
  icon?: React.ReactNode;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  max?: string;
}

const InputField = ({ label, icon, value, onChange, disabled, placeholder, type = "text", max }: InputFieldProps) => (
  <div className="group">
    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 group-focus-within:text-red-700 transition-colors">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-600 group-focus-within:text-red-700 transition-colors">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        max={max}
        className={`w-full ${icon ? 'pl-12' : 'px-4'} pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-700 focus:ring-1 focus:ring-red-700 focus:border-red-700 outline-none transition-all font-mono disabled:bg-zinc-900/50 [color-scheme:dark]`}
      />
    </div>
  </div>
);

const LegalSection = ({ draft, onChange }: { draft: DenunciaDraft, onChange: (field: keyof DenunciaDraft) => (e: React.ChangeEvent<any>) => void }) => (
  <div className="mt-8 space-y-6">
    <div className="space-y-2">
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Domicilio Legal</label>
      <input
        type="text"
        value={draft.domicilio || ''}
        onChange={onChange('domicilio')}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-red-700 outline-none"
        placeholder="Calle, Número, Colonia, Ciudad..."
      />
    </div>

    <div className="space-y-2">
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Personas Autorizadas para Notificaciones</label>
      <textarea
        value={draft.personasAutorizadas || ''}
        onChange={onChange('personasAutorizadas')}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-red-700 outline-none h-20 resize-none"
        placeholder="Nombres completos de personas autorizadas..."
      />
      <p className="text-[10px] text-zinc-500 italic">Opcional: Nombres de familiares o abogados autorizados.</p>
    </div>
  </div>
);

const AccusedSection = ({ draft, updateDraft }: { draft: DenunciaDraft, updateDraft: (data: Partial<DenunciaDraft>) => void }) => (
  <div className="space-y-3 mt-8 pt-4 border-t border-zinc-800">
    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">¿Quién o quiénes están realizando esta acción?</label>
    <div className="grid grid-cols-2 gap-3">
      {SUBJECT_TYPES.map((tipo) => (
        <button
          key={tipo.id}
          type="button"
          onClick={() => updateDraft({ denunciadoTipo: tipo.id as SubjectTypeId })}
          className={`px-4 py-3 rounded-lg border text-xs font-bold transition-all ${
            draft.denunciadoTipo === tipo.id ? 'bg-red-800 border-red-700 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
        >
          {tipo.label}
        </button>
      ))}
    </div>
  </div>
);

const DemographicSection = ({ draft, onChange }: { draft: DenunciaDraft, onChange: (field: keyof DenunciaDraft) => (e: React.ChangeEvent<any>) => void }) => (
  <div className="pt-8 border-t border-zinc-800 mt-8 animate-fade-in">
    <h3 className="text-xl font-bold mb-6 text-zinc-300 flex items-center gap-2">
      <Users size={20} className="text-red-700" />
      Información Estadística <span className="text-xs font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800 ml-2">OPCIONAL</span>
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        label="Edad"
        type="number"
        value={draft.age || ''}
        onChange={onChange('age')}
        placeholder="EJ. 35"
      />
      
      <div className="group">
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 group-focus-within:text-red-700 transition-colors">Género</label>
        <select
          value={draft.gender || ''}
          onChange={onChange('gender')}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-red-700 focus:border-red-700 outline-none transition-all appearance-none cursor-pointer py-4"
        >
          <option value="">Seleccionar...</option>
          <option value="MALE">Masculino</option>
          <option value="FEMALE">Femenino</option>
          <option value="OTHER">Otro</option>
          <option value="PREFER_NOT_TO_SAY">Prefiero no decir</option>
        </select>
      </div>

      <InputField
        label="Ocupación"
        icon={<Briefcase size={18} />}
        value={draft.occupation || ''}
        onChange={onChange('occupation')}
        placeholder="EJ. ABOGADO"
      />

      <div className="group">
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 group-focus-within:text-red-700 transition-colors">¿Cómo nos conociste?</label>
        <div className="relative">
          <HelpCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-600 group-focus-within:text-red-700 transition-colors" size={18} />
          <select
            value={draft.referralSource || ''}
            onChange={onChange('referralSource')}
            className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:ring-1 focus:ring-red-700 focus:border-red-700 outline-none transition-all appearance-none cursor-pointer"
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
);

export const StepInfo: React.FC<Props> = ({ draft, updateDraft, onNext, onBack }) => {
  const isValid = useMemo(() => isDraftValid(draft), [draft.isAnonymous, draft.fullName, draft.email]);

  const toggleAnonymous = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    updateDraft({ isAnonymous: !draft.isAnonymous });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') toggleAnonymous(e);
  };

  const handleTextChange = (field: keyof DenunciaDraft) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => updateDraft({ [field]: e.target.value });

  const renderAnonymousSwitch = () => (
    <button
      type="button"
      role="switch"
      aria-checked={draft.isAnonymous}
      aria-label="Activar Denuncia Anónima"
      className={`
        w-full text-left relative p-6 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 focus:ring-offset-zinc-950
        ${draft.isAnonymous ? 'bg-red-900/10 border-red-700/30 shadow-[0_0_15px_rgba(236,72,153,0.1)]' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}
      `}
      onClick={toggleAnonymous}
      onKeyDown={handleKeyDown}
    >
      <div className="pr-4">
        <h3 className={`font-bold text-lg transition-colors ${draft.isAnonymous ? 'text-red-600' : 'text-white'}`}>
          Denuncia Anónima
        </h3>
        <p className="text-sm text-zinc-500 mt-1">
          {draft.isAnonymous
            ? "Protección de identidad activada. No se requerirán datos personales."
            : "Sus datos no aparecerán en el documento público, pero son necesarios para notificaciones."}
        </p>
      </div>

      <div className="flex-shrink-0">
        <div className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ease-in-out shadow-inner ${draft.isAnonymous ? 'bg-red-700' : 'bg-zinc-700'}`}>
          <div className={`bg-white w-6 h-6 rounded-full shadow-lg transform transition-transform duration-300 ease-in-out ${draft.isAnonymous ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
      </div>
    </button>
  );

  const renderPersonalData = () => (
    <div className="relative mt-8">
      {draft.isAnonymous && <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-zinc-950/20 transition-all duration-500 rounded-xl" />}
      
      <div className={`space-y-6 transition-all duration-500 ${draft.isAnonymous ? 'opacity-40 grayscale' : 'opacity-100'}`}>
        <InputField
          label="Nombre Completo"
          icon={<User size={20} />}
          value={draft.fullName}
          onChange={handleTextChange('fullName')}
          disabled={draft.isAnonymous}
          placeholder="EJ. JUAN PÉREZ HERNÁNDEZ"
        />
        <InputField
          label="Correo Electrónico"
          icon={<Mail size={20} />}
          value={draft.email}
          onChange={handleTextChange('email')}
          disabled={draft.isAnonymous}
          placeholder="CONTACTO@EJEMPLO.COM"
          type="email"
        />
      </div>
    </div>
  );

  return (
    <div className="p-8 md:p-12 h-full flex flex-col justify-center max-w-3xl mx-auto">
      <HeaderSection />

      <div className="space-y-8">
        {renderAnonymousSwitch()}
        {renderPersonalData()}
      </div>

      {!draft.isAnonymous && <LegalSection draft={draft} onChange={handleTextChange} />}
      
      <AccusedSection draft={draft} updateDraft={updateDraft} />
      
      <div className="pt-8 border-t border-zinc-800 mt-8 animate-fade-in">
        <InputField
          label="Fecha del Incidente *"
          type="date"
          value={draft.eventDate || ''}
          onChange={handleTextChange('eventDate')}
          max={new Date().toISOString().split('T')[0]}
        />
        <p className="text-xs text-zinc-600 mt-2">Fecha en que ocurrió o se detectó el hecho denunciado.</p>
      </div>

      <DemographicSection draft={draft} onChange={handleTextChange} />

      <div className="mt-12 flex justify-between items-center">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-zinc-500 hover:text-white font-medium flex items-center gap-2 px-4 py-2 transition-colors uppercase text-xs tracking-widest"
          >
            <ChevronLeft size={16} /> Volver
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
            className="group relative px-8 py-4 rounded-full font-bold text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 transition-all duration-300 group-hover:scale-105"></div>
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

