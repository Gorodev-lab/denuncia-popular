import React, { useState } from 'react';
import { DenunciaDraft } from '../../types';
import { ChevronLeft, FileCheck, MapPin, Download, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Props {
  draft: DenunciaDraft;
  onBack: () => void;
  onSubmit: () => void;
}

export const StepReview: React.FC<Props> = ({ draft, onBack, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 2000);
  };

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = 20;

      // --- Header ---
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.text("FOLIO PRELIMINAR: #MX-" + Math.floor(Math.random() * 10000), pageWidth - margin, yPos, { align: "right" });
      yPos += 5;
      doc.setFontSize(12);
      doc.text("ASUNTO: DENUNCIA CIUDADANA POR FALTAS ADMINISTRATIVAS", pageWidth - margin, yPos, { align: "right" });

      yPos += 20;

      // --- Addressee ---
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.text(`A LA AUTORIDAD ${draft.aiAnalysis?.competency || 'COMPETENTE'}`, margin, yPos);
      yPos += 5;
      doc.text("PRESENTE.", margin, yPos);

      yPos += 15;

      // --- Body Paragraph 1 ---
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      const name = draft.isAnonymous ? "CIUDADANO BAJO PROTECCIÓN DE ANONIMATO" : draft.fullName.toUpperCase();
      const email = draft.email;

      const text1 = `El que suscribe, ${name}, señalando como medio para recibir notificaciones el correo electrónico ${email}, comparezco para exponer:`;
      const splitText1 = doc.splitTextToSize(text1, contentWidth);
      doc.text(splitText1, margin, yPos);
      yPos += (splitText1.length * 5) + 5;

      // --- Body Paragraph 2 ---
      const legalBasis = draft.aiAnalysis?.legalBasis || 'la legislación aplicable';
      const text2 = `Que por medio del presente instrumento vengo a denunciar los hechos que considero constitutivos de falta administrativa, fundamentando mi dicho en ${legalBasis}.`;
      const splitText2 = doc.splitTextToSize(text2, contentWidth);
      doc.text(splitText2, margin, yPos);
      yPos += (splitText2.length * 5) + 10;

      // --- Description (Quote) ---
      doc.setFont("times", "italic");
      doc.setTextColor(50, 50, 50); // Dark Gray
      // Draw a light gray background box for the quote
      // doc.setFillColor(245, 245, 245);
      // doc.rect(margin, yPos - 5, contentWidth, 50, 'F'); // Approximate height, hard to calculate exact dynamic height easily without more logic

      const description = `"${draft.description}"`;
      const splitDesc = doc.splitTextToSize(description, contentWidth - 10); // Indent slightly
      doc.text(splitDesc, margin + 5, yPos);
      yPos += (splitDesc.length * 5) + 15;

      doc.setTextColor(0, 0, 0); // Reset color
      doc.setFont("times", "normal");

      // --- Location & Evidence Section ---
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, yPos, contentWidth, 35); // Box

      let boxY = yPos + 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("UBICACIÓN GEO-REFERENCIADA:", margin + 5, boxY);
      doc.text("EVIDENCIA ADJUNTA:", pageWidth / 2 + 5, boxY);

      boxY += 5;
      doc.setFont("helvetica", "normal");
      if (draft.location) {
        doc.text(`Lat: ${draft.location.lat.toFixed(6)}, Lng: ${draft.location.lng.toFixed(6)}`, margin + 5, boxY);
        const addressLines = doc.splitTextToSize(draft.location.address || '', (contentWidth / 2) - 10);
        doc.text(addressLines, margin + 5, boxY + 5);
      } else {
        doc.text("No especificada", margin + 5, boxY);
      }

      const evidenceText = draft.evidenceFiles.length > 0
        ? draft.evidenceFiles.map(f => `• ${f.name}`).join("\n")
        : "Sin archivos adjuntos";
      const splitEvidence = doc.splitTextToSize(evidenceText, (contentWidth / 2) - 10);
      doc.text(splitEvidence, pageWidth / 2 + 5, boxY);

      yPos += 50;

      // --- Signature ---
      yPos = Math.max(yPos, 220); // Push to bottom if space allows, or just below content

      doc.setDrawColor(0, 0, 0);
      doc.line((pageWidth / 2) - 40, yPos, (pageWidth / 2) + 40, yPos); // Signature Line

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      const signName = draft.isAnonymous ? "Firma Digital Anónima" : draft.fullName;
      doc.text(signName, pageWidth / 2, yPos + 5, { align: "center" });

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Hash Digital: ${Math.random().toString(36).substring(7).toUpperCase()}`, pageWidth / 2, yPos + 10, { align: "center" });

      // --- Footer ---
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Generado por Denuncia Popular - Esoteria AI", pageWidth / 2, 280, { align: "center" });

      doc.save("Denuncia_Popular_Oficial.pdf");

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Hubo un error al generar el PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
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

          <div className="hidden lg:block pt-4 space-y-3">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="w-full group relative px-8 py-3 rounded-full font-bold text-white overflow-hidden disabled:opacity-80 transition-all border border-zinc-700 hover:bg-zinc-800"
            >
              <span className="relative flex items-center justify-center gap-3">
                {isGeneratingPdf ? (
                  <>Generando PDF...</>
                ) : (
                  <>
                    <Printer size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                    Descargar PDF para Imprimir
                  </>
                )}
              </span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full group relative px-8 py-4 rounded-full font-bold text-white overflow-hidden disabled:opacity-80 transition-all shadow-lg shadow-green-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 transition-all duration-300 group-hover:scale-105"></div>
              <span className="relative flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Firmando...
                  </>
                ) : (
                  <>
                    <FileCheck size={20} />
                    Firmar y Presentar Digitalmente
                  </>
                )}
              </span>
            </button>

            <button
              onClick={onBack}
              disabled={isSubmitting}
              className="w-full mt-2 text-zinc-500 hover:text-white text-sm font-medium transition-colors uppercase tracking-widest"
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
              <p className="text-xs font-bold text-slate-500">FOLIO PRELIMINAR: #MX-{Math.floor(Math.random() * 10000)}</p>
              <p className="text-sm font-bold text-slate-900 uppercase mt-1">
                ASUNTO: DENUNCIA CIUDADANA POR FALTAS ADMINISTRATIVAS
              </p>
            </div>

            <div className="space-y-6 text-sm md:text-base leading-relaxed text-slate-800">
              <p className="font-bold">
                A LA AUTORIDAD {draft.aiAnalysis?.competency || 'COMPETENTE'}
                <br />PRESENTE.
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
                    {draft.evidenceFiles.length > 0 ? draft.evidenceFiles.map((f, i) => <li key={i}>{f.name}</li>) : <li>Sin adjuntos</li>}
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

        {/* Mobile Buttons */}
        <div className="lg:hidden mt-6 pb-6 space-y-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="w-full group relative px-8 py-3 rounded-full font-bold text-white overflow-hidden disabled:opacity-80 transition-all border border-zinc-700 hover:bg-zinc-800"
          >
            <span className="relative flex items-center justify-center gap-3">
              {isGeneratingPdf ? 'Generando...' : 'Descargar PDF'}
            </span>
          </button>

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