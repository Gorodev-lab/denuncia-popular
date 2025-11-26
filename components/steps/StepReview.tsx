import React, { useState } from 'react';
import { DenunciaDraft } from '../../types';
import { ChevronLeft, FileCheck, MapPin } from 'lucide-react';

interface Props {
  draft: DenunciaDraft;
  onBack: () => void;
  onSubmit: () => void;
}

export const StepReview: React.FC<Props> = ({ draft, onBack, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 2000);
  };

  return (
    <div className="p-6 md:p-8 h-full flex flex-col max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        
        {/* Sidebar / Context */}
        <div className="lg:w-1/3 flex flex-col justify-center space-y-6">
          <div>
             <h2 className="text-3xl font-bold mb-2 text-white">
               Revisión Final
             </h2>
             <p className="text-zinc-400">
               Verifica los datos antes de generar el documento legal inmutable.
             </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl space-y-4">
             <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-3">
               <span className="text-zinc-500">Tipo</span>
               <span className="text-white font-medium">{draft.isAnonymous ? 'Denuncia Anónima' : 'Nominal'}</span>
             </div>
             <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-3">
               <span className="text-zinc-500">Competencia</span>
               <span className="text-purple-400 font-bold">{draft.aiAnalysis?.competency || 'PENDIENTE'}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-zinc-500">Archivos</span>
               <span className="text-white font-medium">{draft.evidenceFiles.length} adjuntos</span>
             </div>
          </div>

          <div className="hidden lg:block pt-4">
             <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full group relative px-8 py-4 rounded-full font-bold text-white overflow-hidden disabled:opacity-80 transition-all shadow-lg shadow-green-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 transition-all duration-300 group-hover:scale-105"></div>
              <span className="relative flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Firmando...
                  </>
                ) : (
                  <>
                    <FileCheck size={20} />
                    Firmar y Presentar
                  </>
                )}
              </span>
            </button>
            <button
              onClick={onBack}
              disabled={isSubmitting}
              className="w-full mt-4 text-zinc-500 hover:text-white text-sm font-medium transition-colors uppercase tracking-widest"
            >
              Volver a editar
            </button>
          </div>
        </div>

        {/* Document Preview */}
        <div className="lg:w-2/3 bg-zinc-200 text-slate-900 shadow-2xl rounded-sm overflow-hidden relative min-h-[600px] flex flex-col">
           {/* Document Header Visual */}
           <div className="h-2 bg-slate-900 w-full"></div>
           
           <div className="p-8 md:p-12 flex-1 font-serif">
             <div className="text-right mb-8 border-b-2 border-slate-900 pb-4">
               <p className="text-xs font-bold text-slate-500">FOLIO PRELIMINAR: #MX-{Math.floor(Math.random()*10000)}</p>
               <p className="text-sm font-bold text-slate-900 uppercase mt-1">
                 ASUNTO: DENUNCIA CIUDADANA POR FALTAS ADMINISTRATIVAS
               </p>
             </div>

             <div className="space-y-6 text-sm md:text-base leading-relaxed text-slate-800">
               <p className="font-bold">
                 A LA AUTORIDAD {draft.aiAnalysis?.competency || 'COMPETENTE'}
                 <br/>PRESENTE.
               </p>

               <p className="text-justify">
                 El que suscribe, <span className="font-bold bg-yellow-100 px-1">{draft.isAnonymous ? 'CIUDADANO BAJO PROTECCIÓN DE ANONIMATO' : draft.fullName.toUpperCase()}</span>, 
                 señalando como medio para recibir notificaciones el correo electrónico <u>{draft.email}</u>, comparezco para exponer:
               </p>

               <p className="text-justify">
                 Que por medio del presente instrumento vengo a denunciar los hechos que considero constitutivos de falta administrativa, fundamentando mi dicho en 
                 <span className="font-bold mx-1">{draft.aiAnalysis?.legalBasis || 'la legislación aplicable'}</span>.
               </p>

               <div className="bg-slate-100 p-6 border-l-4 border-slate-400 italic my-6 text-slate-700">
                 " {draft.description} "
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6 text-xs text-slate-600 border border-slate-300 p-4">
                 <div>
                   <span className="block font-bold text-slate-900">UBICACIÓN GEO-REFERENCIADA:</span>
                   <div className="flex items-center gap-1 mt-1">
                     <MapPin size={12} />
                     {draft.location ? `${draft.location.lat.toFixed(6)}, ${draft.location.lng.toFixed(6)}` : 'N/A'}
                   </div>
                   <div className="mt-1">{draft.location?.address}</div>
                 </div>
                 <div>
                   <span className="block font-bold text-slate-900">EVIDENCIA ADJUNTA:</span>
                   <ul className="list-disc list-inside mt-1">
                     {draft.evidenceFiles.length > 0 ? draft.evidenceFiles.map((f,i) => <li key={i}>{f.name}</li>) : <li>Sin adjuntos</li>}
                   </ul>
                 </div>
               </div>

               <div className="mt-12 pt-8 border-t border-dashed border-slate-400 flex flex-col items-center justify-center opacity-80">
                  <div className="font-dancing-script text-2xl mb-2 text-blue-900">
                     {draft.isAnonymous ? 'Firma Digital Anónima' : draft.fullName}
                  </div>
                  <div className="border-t border-slate-900 w-48"></div>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase">Firma del Denunciante / Hash: {Math.random().toString(36).substring(7)}</p>
               </div>
             </div>
           </div>
           
           {/* Watermark */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-45deg]">
             <span className="text-9xl font-black uppercase">Borrador</span>
           </div>
        </div>

        {/* Mobile Submit Button (Visible only on small screens) */}
        <div className="lg:hidden mt-6 pb-6">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full group relative px-8 py-4 rounded-full font-bold text-white overflow-hidden disabled:opacity-80 transition-all shadow-lg shadow-green-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 transition-all duration-300 group-hover:scale-105"></div>
              <span className="relative flex items-center justify-center gap-3">
                  {isSubmitting ? 'Firmando...' : 'Firmar y Presentar'}
              </span>
            </button>
        </div>
      </div>
    </div>
  );
};