import React, { useState } from 'react';
import { DenunciaDraft } from '../../types';
import { ChevronLeft, FileCheck, MapPin, Printer, FileText, Globe } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Props {
  draft: DenunciaDraft;
  onBack: () => void;
  onSubmit: () => void;
}

import { supabase } from '../../services/supabase';


// Get the official state name from draft.location (provided by Google Maps address_components)
const getEstado = (draft: DenunciaDraft): string =>
  draft.location?.estado || 'No especificado';

// Get municipality/locality from draft.location
const getMunicipio = (draft: DenunciaDraft): string =>
  draft.location?.municipio || draft.location?.localidad || 'No especificado';

// Full reference string: colonia + municipio + estado
const getUbicacionCompleta = (draft: DenunciaDraft): string => {
  const parts = [
    draft.location?.colonia,
    draft.location?.municipio || draft.location?.localidad,
    draft.location?.estado,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : (draft.location?.address || 'No especificado');
};


export const StepReview: React.FC<Props> = ({ draft, onBack, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const folio = `MX-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      const { error } = await supabase.from('denuncias').insert({
        folio,
        is_anonymous: draft.isAnonymous,
        full_name: draft.isAnonymous ? 'ANÓNIMO' : draft.fullName,
        email: draft.email,
        description: draft.description,
        category: draft.category,
        lat: draft.location?.lat,
        lng: draft.location?.lng,
        address: draft.location?.address,
        estado: draft.location?.estado,
        municipio: draft.location?.municipio,
        competency: draft.aiAnalysis?.competency,
        legal_basis: draft.aiAnalysis?.legalBasis,
        summary: draft.aiAnalysis?.summary,
        age: draft.age,
        gender: draft.gender,
        occupation: draft.occupation,
        referral_source: draft.referralSource,
        evidence_urls: draft.evidenceUrls || []
      });

      if (error) {
        if (error.message.includes('Anonymous')) {
          throw new Error('CONFIG_ERROR: El servidor no permite denuncias anónimas. Contacta a un administrador.');
        }
        throw error;
      }

      onSubmit();

    } catch (error) {
      console.error('Error submitting denuncia:', error);
      alert('Hubo un error al enviar la denuncia. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- Document Content Builder ----------
  const buildDocumentText = (folio: string): string => {
    const estado = getEstado(draft);
    const municipio = getMunicipio(draft);
    const ubicacionCompleta = getUbicacionCompleta(draft);
    const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const denunciante = draft.isAnonymous ? 'CIUDADANO BAJO PROTECCIÓN DE ANONIMATO' : (draft.fullName || 'No especificado').toUpperCase();
    const contacto = draft.isAnonymous ? 'Solicita protección de datos personales' : (draft.email || 'No especificado');
    const evidencia = (draft.evidenceFiles || []).length > 0
      ? (draft.evidenceFiles || []).map(f => `  - ${f.name}`).join('\n')
      : '  - Sin archivos adjuntos.';
    const legalBasis = draft.aiAnalysis?.legalBasis || 'los artículos pertinentes de la LGEEPA';
    const competency = draft.aiAnalysis?.competency || 'COMPETENTE';

    return `ASUNTO: Denuncia Popular.
FOLIO: ${folio}

Procuraduría Federal de Protección al Ambiente
(PROFEPA)
Oficina de representación en el Estado de ${estado.toUpperCase()}.
Presente.

${'='.repeat(60)}

${denunciante}, señalando como medio para recibir notificaciones: ${contacto}, comparezco a interponer formal DENUNCIA POPULAR con fundamento en los artículos 189, 190, 191 y 192 de la Ley General del Equilibrio Ecológico y la Protección al Ambiente (LGEEPA), y en la normativa correlativa de la Ley Federal de Procedimiento Administrativo.

AUTORIDAD COMPETENTE: ${competency}
FUNDAMENTO LEGAL: ${legalBasis}

${'='.repeat(60)}

¿QUÉ SE DENUNCIA?
${'='.repeat(60)}
${draft.description || 'Sin descripción proporcionada.'}

¿CUÁNDO OCURRIÓ?
${'='.repeat(60)}
${draft.eventDate ? new Date(draft.eventDate + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : '(fecha no declarada)'}

¿DÓNDE OCURRIÓ?
${'='.repeat(60)}
Estado:             ${estado}
Municipio/Alcaldía: ${municipio}
Localidad/Colonia:  ${draft.location?.colonia || draft.location?.localidad || 'No especificado'}
Dirección completa: ${ubicacionCompleta}
Coordenadas GPS:    Latitud ${draft.location?.lat?.toFixed(6) || 'N/A'}, Longitud ${draft.location?.lng?.toFixed(6) || 'N/A'}

PRUEBAS ADJUNTAS:
${'='.repeat(60)}
${evidencia}

DATOS DE LA PERSONA DENUNCIANTE:
${'='.repeat(60)}
Nombre: ${denunciante}
Contacto: ${contacto}

${'='.repeat(60)}
SOLICITO
${'='.repeat(60)}

PRIMERO.- Se tenga por presentada y radicada la presente Denuncia Popular y se ordene el despliegue de las visitas de inspección o acciones tendientes a corroborar los actos y omisiones expuestos, en cumplimiento de los artículos 189, 190, 191 y 192 de la LGEEPA.

SEGUNDO.- Se me tenga como coadyuvante en el procedimiento administrativo instaurado, de conformidad con el artículo 193 de la citada LGEEPA.

TERCERO.- Se me permita ejercer el derecho de acceso al expediente que resulte con motivo de esta denuncia, conforme al artículo 33 de la Ley Federal de Procedimiento Administrativo.

CUARTO.- Se garantice la confidencialidad de mis datos personales conforme a los artículos 1 y 6 de la Constitución Política de los Estados Unidos Mexicanos y la Ley General de Transparencia y Acceso a la Información Pública.

PROTESTO LO NECESARIO.

A ${fecha}.


___________________________________
FIRMA DEL DENUNCIANTE
${denunciante}
`;
  };


  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = 20;

      const folio = `MX-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
      const estado = getEstado(draft);
      const municipio = getMunicipio(draft);
      const colonia = draft.location?.colonia || draft.location?.localidad || 'No especificado';
      const denunciante = draft.isAnonymous ? 'CIUDADANO BAJO PROTECCIÓN DE ANONIMATO' : (draft.fullName || '').toUpperCase();

      const addWrappedText = (text: string, fontSize: number = 10, fontType: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal', indent: number = 0) => {
        doc.setFont('times', fontType);
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, contentWidth - indent);
        // New page if needed
        if (yPos + lines.length * (fontSize * 0.45) > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(lines, margin + indent, yPos);
        yPos += (lines.length * (fontSize * 0.45)) + 3;
      };

      // --- HEADER ---
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.text(`FOLIO: ${folio}`, pageWidth - margin, yPos, { align: 'right' });
      doc.text('ASUNTO: Denuncia Popular.', margin, yPos);
      yPos += 8;

      doc.setFontSize(12);
      doc.text('Procuraduría Federal de Protección al Ambiente', margin, yPos);
      yPos += 5;
      doc.text('(PROFEPA)', margin, yPos);
      yPos += 5;
      doc.setFontSize(10);
      doc.text(`Oficina de representación en el Estado de ${estado.toUpperCase()}.`, margin, yPos);
      yPos += 5;
      doc.text('Presente:', margin, yPos);
      yPos += 10;

      // --- INTRO ---
      doc.setFont('times', 'normal');
      const intro = `${denunciante}, señalando como medio para recibir notificaciones ` +
        `${draft.isAnonymous ? 'la plataforma Denuncia Popular' : draft.email}, ` +
        `comparezco a interponer formal DENUNCIA POPULAR con fundamento en los artículos 189, 190, 191 y 192 ` +
        `de la Ley General del Equilibrio Ecológico y la Protección al Ambiente (LGEEPA), ` +
        `así como en la normativa correlativa de la Ley Federal de Procedimiento Administrativo. Al respecto expongo:`;
      addWrappedText(intro, 10, 'normal');
      yPos += 5;

      // --- 1. QUÉ SE DENUNCIA ---
      addWrappedText('¿Qué se está denunciando?', 10, 'bold');

      addWrappedText(draft.description || 'Sin descripción proporcionada.', 10, 'normal');
      yPos += 5;

      // --- 2. CUÁNDO ---
      addWrappedText('¿Cuándo ocurrió o desde cuándo está ocurriendo?', 10, 'bold');
      const fechaEvento = draft.eventDate
        ? new Date(draft.eventDate + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
        : '___________________________________';
      addWrappedText(fechaEvento, 10, 'normal');
      yPos += 5;

      // --- 3. DÓNDE ---
      addWrappedText('¿Dónde está ocurriendo?', 10, 'bold');
      addWrappedText(`Estado:              ${estado}`, 10, 'normal', 5);
      addWrappedText(`Municipio/Alcaldía:  ${municipio}`, 10, 'normal', 5);
      addWrappedText(`Localidad/Colonia:   ${colonia}`, 10, 'normal', 5);
      addWrappedText(`Dirección completa:  ${draft.location?.address || 'No especificado'}`, 10, 'normal', 5);
      addWrappedText(`Coordenadas GPS:     Latitud ${draft.location?.lat?.toFixed(6) || 'N/A'}, Longitud ${draft.location?.lng?.toFixed(6) || 'N/A'}`, 10, 'normal', 5);
      yPos += 5;

      // --- 4. PRUEBAS ---
      addWrappedText('PRUEBAS:', 10, 'bold');
      addWrappedText('Se adjuntan a la presente denuncia los siguientes medios de prueba:', 10, 'normal');
      const evidenceFiles = draft.evidenceFiles || [];
      if (evidenceFiles.length > 0) {
        evidenceFiles.forEach(file => {
          const isImage = file.type.startsWith('image/');
          addWrappedText(`- ${file.name}${isImage ? ' (imagen fotográfica, incluida en Anexo)' : ''}`, 10, 'normal', 5);
        });
      } else {
        addWrappedText('- Sin archivos adjuntos.', 10, 'normal', 5);
      }
      yPos += 5;

      // --- 5. DENUNCIANTE ---
      addWrappedText('DATOS DE IDENTIFICACIÓN DE LA PERSONA DENUNCIANTE:', 10, 'bold');
      if (draft.isAnonymous) {
        addWrappedText('Nombre: ANÓNIMO (Solicito protección de datos personales)', 10, 'normal');
      } else {
        addWrappedText(`Nombre completo: ${draft.fullName}`, 10, 'normal');
        addWrappedText(`Correo electrónico: ${draft.email}`, 10, 'normal');
      }
      yPos += 8;

      // --- SOLICITO ---
      addWrappedText('SOLICITO', 12, 'bold');
      yPos += 3;

      const solicitudes = [
        'PRIMERO.- Se tenga por presentada y radicada la presente Denuncia Popular y se ordene el despliegue de las visitas de inspección o acciones tendientes a corroborar los actos y omisiones expuestos, con base en los artículos 189, 190, 191 y 192 de la LGEEPA.',
        'SEGUNDO.- Se me reconozca el carácter de coadyuvante en el procedimiento administrativo, de conformidad con el artículo 193 de la citada LGEEPA.',
        'TERCERO.- Se me permita ejercer el derecho de acceso al expediente que resulte con motivo de esta denuncia, conforme al artículo 33 de la Ley Federal de Procedimiento Administrativo.',
        'CUARTO.- Se garantice la confidencialidad de mis datos personales conforme a los artículos 1 y 6 de la Constitución Política de los Estados Unidos Mexicanos y la Ley General de Transparencia y Acceso a la Información Pública.',
      ];

      doc.setFontSize(9);
      solicitudes.forEach(text => {
        const lines = doc.splitTextToSize(text, contentWidth);
        if (yPos + lines.length * 4 > pageHeight - 60) { doc.addPage(); yPos = 20; }
        doc.setFont('times', 'normal');
        doc.text(lines, margin, yPos);
        yPos += (lines.length * 4) + 4;
      });

      yPos += 8;
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.text('PROTESTO LO NECESARIO.', margin, yPos);
      yPos += 5;
      doc.setFont('times', 'normal');
      doc.text(`A ${fecha}.`, margin, yPos);
      yPos += 22;
      doc.line(margin + 30, yPos, pageWidth - margin - 30, yPos);
      yPos += 5;
      doc.text('NOMBRE Y FIRMA', pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
      doc.setFontSize(8);
      doc.text(denunciante, pageWidth / 2, yPos, { align: 'center' });

      // --- ANNEXES ---
      const imageFiles = evidenceFiles.filter(f => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        doc.addPage();
        yPos = 30;
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.text('ANEXO: EVIDENCIA FOTOGRÁFICA', pageWidth / 2, 17, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('times', 'italic');
        doc.text(`Folio: ${folio}`, pageWidth - margin, 35, { align: 'right' });
        yPos = 45;

        for (const file of imageFiles) {
          try {
            const base64 = await fileToBase64(file);
            if (yPos > pageHeight - 120) { doc.addPage(); yPos = 30; }
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
            doc.setFont('times', 'bold');
            doc.setFontSize(10);
            doc.text(`Evidencia: ${file.name}`, margin, yPos);
            yPos += 8;
            const imgProps = doc.getImageProperties(base64);
            const imgWidth = contentWidth;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            const maxHeight = 100;
            let finalWidth = imgWidth;
            let finalHeight = imgHeight;
            if (imgHeight > maxHeight) {
              finalHeight = maxHeight;
              finalWidth = (imgProps.width * finalHeight) / imgProps.height;
            }
            const xOffset = margin + (contentWidth - finalWidth) / 2;
            doc.addImage(base64, 'JPEG', xOffset, yPos, finalWidth, finalHeight);
            doc.setDrawColor(200, 200, 200);
            doc.rect(xOffset - 1, yPos - 1, finalWidth + 2, finalHeight + 2, 'S');
            yPos += finalHeight + 20;
          } catch (e) {
            console.error(`Error embedding image ${file.name}:`, e);
            addWrappedText(`Error al cargar imagen: ${file.name}`, 10, 'normal');
          }
        }
      }

      doc.save(`Denuncia_Popular_${folio}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Hubo un error al generar el PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadTXT = () => {
    const folio = `MX-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const text = buildDocumentText(folio);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Denuncia_Popular_${folio}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [gdocsMsg, setGdocsMsg] = useState<string | null>(null);

  const handleExportGoogleDocs = async () => {
    const folio = `MX-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const text = buildDocumentText(folio);
    try {
      await navigator.clipboard.writeText(text);
      setGdocsMsg('¡Texto copiado! Pega el contenido (Ctrl+V) en el documento de Google Docs.');
    } catch {
      setGdocsMsg('No se pudo copiar automáticamente. Usa el botón de TXT y luego pégalo en Google Docs.');
    }
    window.open(`https://docs.google.com/document/create?title=Denuncia_Popular_${folio}`, '_blank');
    setTimeout(() => setGdocsMsg(null), 6000);
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
            {/* Google Docs Toast */}
            {gdocsMsg && (
              <div className="p-3 bg-blue-900/50 border border-blue-700 rounded-xl text-xs text-blue-200 animate-in fade-in">
                {gdocsMsg}
              </div>
            )}

            {/* Download PDF */}
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
                    Descargar PDF
                  </>
                )}
              </span>
            </button>

            {/* Download TXT */}
            <button
              onClick={handleDownloadTXT}
              className="w-full group relative px-8 py-3 rounded-full font-bold text-white overflow-hidden transition-all border border-zinc-700 hover:bg-zinc-800"
            >
              <span className="relative flex items-center justify-center gap-3">
                <FileText size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                Descargar .TXT
              </span>
            </button>

            {/* Export to Google Docs */}
            <button
              onClick={handleExportGoogleDocs}
              className="w-full group relative px-8 py-3 rounded-full font-bold text-white overflow-hidden transition-all border border-blue-800/60 hover:bg-blue-900/30"
            >
              <span className="relative flex items-center justify-center gap-3">
                <Globe size={18} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                Exportar a Google Docs
              </span>
            </button>

            {/* Submit */}
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

              <p className="text-justify pt-4">
                Que por medio del presente instrumento vengo a interponer formal DENUNCIA POPULAR respecto de hechos, actos y omisiones que producen o pueden producir desequilibrio ecológico, fundamentando mi dicho en
                <span className="font-bold mx-1">{draft.aiAnalysis?.legalBasis || 'los artículos pertinentes de la LGEEPA'}</span>.
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
                  <div className="mt-2 text-slate-700">
                    <div className="font-semibold">{getMunicipio(draft)}</div>
                    <div className="text-[10px] uppercase text-slate-500">{getEstado(draft)}</div>
                  </div>
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
          {gdocsMsg && (
            <div className="p-3 bg-blue-900/50 border border-blue-700 rounded-xl text-xs text-blue-200">
              {gdocsMsg}
            </div>
          )}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="w-full group relative px-8 py-3 rounded-full font-bold text-white overflow-hidden disabled:opacity-80 transition-all border border-zinc-700 hover:bg-zinc-800"
          >
            <span className="relative flex items-center justify-center gap-3">
              {isGeneratingPdf ? 'Generando...' : <><Printer size={16} /> Descargar PDF</>}
            </span>
          </button>
          <button
            onClick={handleDownloadTXT}
            className="w-full group relative px-8 py-3 rounded-full font-bold text-white overflow-hidden transition-all border border-zinc-700 hover:bg-zinc-800"
          >
            <span className="relative flex items-center justify-center gap-3">
              <FileText size={16} /> Descargar .TXT
            </span>
          </button>
          <button
            onClick={handleExportGoogleDocs}
            className="w-full group relative px-8 py-3 rounded-full font-bold text-white overflow-hidden transition-all border border-blue-800/60 hover:bg-blue-900/30"
          >
            <span className="relative flex items-center justify-center gap-3">
              <Globe size={16} className="text-blue-400" /> Exportar a Google Docs
            </span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full group relative px-8 py-4 rounded-full font-bold text-white overflow-hidden disabled:opacity-80 transition-all shadow-lg shadow-green-900/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 transition-all duration-300 group-hover:scale-105"></div>
            <span className="relative flex items-center justify-center gap-3">
              {isSubmitting ? 'Firmando...' : <><FileCheck size={18} /> Firmar y Presentar</>}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};