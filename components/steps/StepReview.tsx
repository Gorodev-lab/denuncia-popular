import React, { useState } from 'react';
import { DenunciaDraft } from '../../types';
import { ChevronLeft, FileCheck, MapPin, Printer, FileText, Globe } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

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

  // ---------- Document Content Builder (for Google Docs / plain text) ----------
  const buildDocumentText = (folio: string): string => {
    const estado = getEstado(draft);
    const municipio = getMunicipio(draft);
    const colonia = draft.location?.colonia || draft.location?.localidad || 'No especificado';
    const ubicacionCompleta = getUbicacionCompleta(draft);
    const denunciante = draft.isAnonymous ? 'CIUDADANO BAJO PROTECCIÓN DE ANONIMATO' : (draft.fullName || 'No especificado').toUpperCase();

    const quien = {
      'NO_CONOCIMIENTO': ' [X] No tengo conocimiento\n [ ] Gobierno\n [ ] Empresa\n [ ] Particular',
      'GOBIERNO': ' [ ] No tengo conocimiento\n [X] Gobierno\n [ ] Empresa\n [ ] Particular',
      'EMPRESA': ' [ ] No tengo conocimiento\n [ ] Gobierno\n [X] Empresa\n [ ] Particular',
      'PARTICULAR': ' [ ] No tengo conocimiento\n [ ] Gobierno\n [ ] Empresa\n [X] Particular',
    }[draft.denunciadoTipo || 'NO_CONOCIMIENTO'];

    const evidencia = (draft.evidenceFiles || []).length > 0
      ? (draft.evidenceFiles || []).map((f, i) => `${i + 1}. IMAGEN (archivo): ${f.name}`).join('\n')
      : '  - Sin archivos adjuntos.';

    const eventDateStr = draft.eventDate
      ? new Date(draft.eventDate + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';

    let identifSection = `Nombre completo: ${denunciante}\n`;
    if (draft.domicilio) identifSection += `Domicilio: ${draft.domicilio}\n`;
    if (draft.email) identifSection += `Correo electrónico: ${draft.email}\n`;
    if (draft.personasAutorizadas) identifSection += `\nPersonas autorizadas para oír y recibir notificaciones a:\n${draft.personasAutorizadas}\n`;

    const solicitudDatos = draft.isAnonymous
      ? ''
      : `\nQUINTO.- Se mantenga la confidencialidad y reserva de mis datos personales y los de mis autorizados, de conformidad a lo dispuesto en los artículos 1 y 6 de la CPEUM, 113, fracción V, 116 de la Ley General de Transparencia y Acceso a la Información Pública, 4, fracción III, 5, 13, fracción IV, 18, 19, 20 y 21 de la Ley Federal de Transparencia y Acceso a la Información Pública Gubernamental.`;

    return `DENUNCIA POPULAR
FOLIO: ${folio}

${draft.description || 'Sin descripción proporcionada.'}

¿Cuándo ocurrió o desde cuándo está ocurriendo?
____________________________________________________________
${eventDateStr}

¿Dónde está ocurriendo?
____________________________________________________________
Estado:             ${estado}
Municipio/Alcaldía: ${municipio}
Localidad/Colonia:  ${colonia}
Ubicación/Referencias: ${ubicacionCompleta}
Coordenadas GPS:    ${draft.location?.lat?.toFixed(6) || 'N/A'}, ${draft.location?.lng?.toFixed(6) || 'N/A'}

¿Quién o quienes están realizando esta acción?
*tachar casilla de respuesta*
${quien}

PRUEBAS:
[X] - Fotografías o imágenes:
${evidencia}

DATOS DE IDENTIFICACIÓN DE LA PERSONA DENUNCIANTE
${identifSection}

SOLICITO
PRIMERO.- Se admita y realicen las acciones necesarias a fin de corroborar la existencia de los actos, hechos y omisiones denunciados, en cumplimiento a lo dispuesto en los artículos 189, 190, 191 y 192 de la Ley General del Equilibrio Ecológico y la Protección al Ambiente.

TERCERO.- Se me reconozca el carácter de coadyuvante, de conformidad con el artículo 193 de la Ley General del Equilibrio Ecológico y la Protección al Ambiente.

CUARTO.- Se me permita acceder al o los expedientes que con motivo de esta denuncia se integren, de conformidad con lo dispuesto en el artículo 33 de la Ley Federal del Procedimiento Administrativo.${solicitudDatos}

PROTESTO LO NECESARIO
${municipio}, ${estado}, a la fecha de su presentación.

______________________________________________
NOMBRE y FIRMA
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

      // --- Header ---
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.text("ASUNTO: Denuncia Popular.", pageWidth - margin, yPos, { align: "right" });
      yPos += 10;

      doc.setFontSize(12);
      doc.text("Procuraduría Federal de Protección al Ambiente", margin, yPos);
      yPos += 5;
      doc.text("(PROFEPA)", margin, yPos);
      yPos += 10;
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text("Oficina de representación en el Estado de ______________________________________.", margin, yPos);
      yPos += 10;
      doc.setFont("times", "bold");
      doc.text("Presente:", margin, yPos);
      yPos += 10;

      // --- Intro ---
      doc.setFont("times", "normal");
      const intro = "Por el presente procedo a DENUNCIAR hechos, actividades u omisiones que están produciendo o pueden producir desequilibrio ecológico o daños al ambiente o a los recursos naturales, o contravienen las disposiciones legales nacionales:";
      addWrappedText(intro, 10, "normal");
      yPos += 5;

      // --- 1. ¿Qué se está denunciando? ---
      doc.setFont("times", "bold");
      doc.text("¿Qué se está denunciando?", margin, yPos);
      yPos += 5;
      doc.setFont("times", "italic");
      doc.setFontSize(9);
      doc.text("(ser lo más específicas posible)", margin, yPos);
      yPos += 5;

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      const description = draft.description || "Sin descripción proporcionada.";
      addWrappedText(description, 10, "normal");
      yPos += 5;

      // --- 2. ¿Cuándo ocurrió? ---
      doc.setFont("times", "bold");
      doc.text("¿Cuándo ocurrió o desde cuándo está ocurriendo?", margin, yPos);
      yPos += 7;
      doc.setFont("times", "normal");

      const fechaEvento = draft.eventDate
        ? new Date(draft.eventDate + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
        : "(Fecha no proporcionada)";
      doc.text("Fecha aproximada: " + fechaEvento, margin, yPos);
      yPos += 10;

      // --- 3. ¿Dónde está ocurriendo? ---
      doc.setFont("times", "bold");
      doc.text("¿Dónde está ocurriendo?", margin, yPos);
      yPos += 7;

      doc.setFont("times", "normal");
      doc.text(`- Estado: ${estado}`, margin + 5, yPos);
      yPos += 7;
      doc.text(`- Municipio/Localidad: ${municipio}`, margin + 5, yPos);
      yPos += 7;
      doc.text(`- Coordenadas: Norte ${draft.location?.lat?.toFixed(6) || 'N/A'}, Oeste ${draft.location?.lng?.toFixed(6) || 'N/A'}`, margin + 5, yPos);
      yPos += 7;
      doc.text(`- Referencias: ${getUbicacionCompleta(draft)}`, margin + 5, yPos);
      yPos += 10;

      // --- 4. ¿Quién? ---
      doc.setFont("times", "bold");
      doc.text("¿Quién o quienes están realizando esta acción?", margin, yPos);
      yPos += 7;
      doc.setFont("times", "normal");
      doc.text("● Posiblemente sea: " + (draft.isAnonymous ? "No tengo conocimiento exacto / Por investigar" : "Ver descripción"), margin + 5, yPos);
      yPos += 10;

      // --- 5. Pruebas ---
      doc.setFont("times", "bold");
      doc.text("PRUEBAS:", margin, yPos);
      yPos += 5;
      doc.setFont("times", "normal");
      doc.text("Adjunto a la presente denuncia las siguientes pruebas:", margin, yPos);
      yPos += 7;

      const evidenceFiles = draft.evidenceFiles || [];
      if (evidenceFiles.length > 0) {
        evidenceFiles.forEach(file => {
          const isImage = file.type.startsWith('image/');
          doc.text(`- ${file.name} ${isImage ? '(Imagen adjunta en anexo)' : ''}`, margin + 5, yPos);
          yPos += 5;
        });
      } else {
        doc.text("- Sin archivos adjuntos.", margin + 5, yPos);
        yPos += 5;
      }
      yPos += 5;

      // --- 6. Datos del Denunciante ---
      doc.setFont("times", "bold");
      doc.text("DATOS DE IDENTIFICACIÓN DE LA PERSONA DENUNCIANTE", margin, yPos);
      yPos += 7;
      doc.setFont("times", "normal");
      if (draft.isAnonymous) {
        doc.text("Nombre: ANÓNIMO", margin, yPos);
      } else {
        doc.text(`Nombre completo: ${draft.fullName || 'No proporcionado'}`, margin, yPos);
        yPos += 5;
        doc.text(`Correo electrónico: ${draft.email || 'No proporcionado'}`, margin, yPos);
        if (draft.domicilio) {
          yPos += 5;
          doc.text(`Domicilio: ${draft.domicilio}`, margin, yPos);
        }
        if (draft.personasAutorizadas) {
          yPos += 5;
          addWrappedText(`Autorizados para oir y recibir notificaciones: ${draft.personasAutorizadas}`, 10, "normal");
          yPos -= 5;
        }
      }
      yPos += 10;

      // --- Legal / Solicito ---
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont("times", "bold");
      doc.text("SOLICITO", margin, yPos, { align: "center" });
      yPos += 10;

      doc.setFont("times", "normal");
      doc.setFontSize(9);

      const solicitudes = [
        'PRIMERO.- Se admita y realicen las acciones necesarias a fin de corroborar la existencia de los actos, hechos y omisiones denunciados, en cumplimiento a lo dispuesto en los artículos 189, 190, 191 y 192 de la Ley General del Equilibrio Ecológico y la Protección al Ambiente.',
        'TERCERO.- Se me reconozca el carácter de coadyuvante, de conformidad con el artículo 193 de la Ley General del Equilibrio Ecológico y la Protección al Ambiente.',
        'CUARTO.- Se me permita acceder al o los expedientes que con motivo de esta denuncia se integren, de conformidad con lo dispuesto en el artículo 33 de la Ley Federal del Procedimiento Administrativo.',
        // QUINTO solo aplica si la denuncia NO es anónima (si es anónima, no se dan datos personales que proteger)
        ...(!draft.isAnonymous ? ['QUINTO.- Se mantenga la confidencialidad y reserva de mis datos personales y los de mis autorizados, de conformidad a lo dispuesto en los artículos 1 y 6 de la CPEUM, 113, fracción V, 116 de la Ley General de Transparencia y Acceso a la Información Pública, 4, fracción III, 5, 13, fracción IV, 18, 19, 20 y 21 de la Ley Federal de Transparencia y Acceso a la Información Pública Gubernamental.'] : []),
      ];

      solicitudes.forEach(text => {
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, yPos);
        yPos += (lines.length * 4) + 3;
      });

      yPos += 10;
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.text("PROTESTO LO NECESARIO", margin, yPos);
      yPos += 5;
      doc.setFont("times", "normal");
      doc.text(`A la fecha de su presentación: ${fecha}`, margin, yPos);

      yPos += 20;
      doc.line(margin + 40, yPos, pageWidth - margin - 40, yPos); // Signature line
      yPos += 5;
      doc.text("NOMBRE Y FIRMA", pageWidth / 2, yPos, { align: "center" });
      yPos += 5;
      doc.setFontSize(8);
      doc.text(draft.isAnonymous ? "Firma Digital Anónima" : (draft.fullName || 'No proporcionado'), pageWidth / 2, yPos, { align: "center" });

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

  const handleDownloadDOCX = async () => {
    const folio = `MX-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const estado = getEstado(draft);
    const municipio = getMunicipio(draft);
    const colonia = draft.location?.colonia || draft.location?.localidad || 'No especificado';
    const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const fechaEvento = draft.eventDate
      ? new Date(draft.eventDate + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
      : '___________________________________';
    const denunciante = draft.isAnonymous
      ? 'CIUDADANO BAJO PROTECCIÓN DE ANONIMATO'
      : (draft.fullName || '').toUpperCase();
    const contacto = draft.isAnonymous
      ? 'Solicita protección de datos personales'
      : (draft.email || 'No especificado');
    const legalBasis = draft.aiAnalysis?.legalBasis || 'los artículos pertinentes de la LGEEPA';
    const competency = draft.aiAnalysis?.competency || 'COMPETENTE';

    const createHr = () => new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' } },
      spacing: { after: 120 },
    });

    const bold = (text: string) => new TextRun({ text, bold: true, font: 'Times New Roman', size: 22 });
    const normal = (text: string) => new TextRun({ text, font: 'Times New Roman', size: 22 });
    const para = (children: TextRun[], spacing = 160) =>
      new Paragraph({ children: children.length > 0 ? children : [new TextRun("")], spacing: { after: spacing } });

    const doc = new Document({
      title: `Denuncia Popular ${folio}`,
      description: 'Denuncia Popular – PROFEPA',
      sections: [{
        children: [
          // Header
          new Paragraph({
            children: [bold('DENUNCIA POPULAR')],
            alignment: AlignmentType.LEFT,
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [bold(`FOLIO: ${folio}`)],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),

          para([normal(draft.description || 'Sin descripción proporcionada.')], 300),

          new Paragraph({ children: [bold('¿Cuándo ocurrió o desde cuándo está ocurriendo?')], heading: HeadingLevel.HEADING_3, spacing: { after: 80 } }),
          createHr(),
          para([normal(fechaEvento)], 160),

          new Paragraph({ children: [bold('¿Dónde está ocurriendo?')], heading: HeadingLevel.HEADING_3, spacing: { after: 80 } }),
          createHr(),
          para([bold('Estado:              '), normal(estado)]),
          para([bold('Municipio/Alcaldía:  '), normal(municipio)]),
          para([bold('Localidad/Colonia:   '), normal(colonia)]),
          para([bold('Ubicación/Ref:       '), normal(getUbicacionCompleta(draft))]),
          para([bold('Coordenadas GPS:     '), normal(`${draft.location?.lat?.toFixed(6) || 'N/A'}, ${draft.location?.lng?.toFixed(6) || 'N/A'}`)], 160),

          new Paragraph({ children: [bold('¿Quién o quienes están realizando esta acción?')], heading: HeadingLevel.HEADING_3, spacing: { after: 80 } }),
          createHr(),
          para([normal('*tachar casilla de respuesta*')], 80),
          para([
            normal(draft.denunciadoTipo === 'NO_CONOCIMIENTO' ? ' [X] No tengo conocimiento' : ' [ ] No tengo conocimiento'),
          ]),
          para([normal('Posiblemente sea:')]),
          para([normal(draft.denunciadoTipo === 'GOBIERNO' ? '  [X] Gobierno' : '  [ ] Gobierno')]),
          para([normal(draft.denunciadoTipo === 'EMPRESA' ? '  [X] Empresa' : '  [ ] Empresa')]),
          para([normal(draft.denunciadoTipo === 'PARTICULAR' ? '  [X] Particular' : '  [ ] Particular')], 160),

          new Paragraph({ children: [bold('PRUEBAS:')], heading: HeadingLevel.HEADING_3, spacing: { after: 80 } }),
          createHr(),
          para([normal('[X] - Fotografías o imágenes:')]),
          ...(draft.evidenceFiles.length > 0
            ? draft.evidenceFiles.map((f, idx) => para([normal(`${idx + 1}. IMAGEN (archivo): ${f.name}`)]))
            : [para([normal('• Sin archivos adjuntos.')])]),

          new Paragraph({ children: [bold('DATOS DE IDENTIFICACIÓN DE LA PERSONA DENUNCIANTE')], heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 80 } }),
          createHr(),
          para([bold('Nombre completo: '), normal(draft.isAnonymous ? 'ANÓNIMO' : denunciante)]),
          ...(draft.domicilio ? [para([bold('Domicilio: '), normal(draft.domicilio)])] : []),
          ...(draft.email ? [para([bold('Correo electrónico: '), normal(draft.email)])] : []),
          ...(draft.personasAutorizadas ? [
            para([bold('Personas autorizadas para oír y recibir notificaciones a:')]),
            para([normal(draft.personasAutorizadas)], 160)
          ] : []),
          para([normal("")], 200),

          // SOLICITO
          new Paragraph({ children: [bold('SOLICITO')], heading: HeadingLevel.HEADING_2, alignment: AlignmentType.LEFT, spacing: { after: 80 } }),
          createHr(),
          para([bold('PRIMERO.- '), normal('Se admita y realicen las acciones necesarias a fin de corroborar la existencia de los actos, hechos y omisiones denunciados, en cumplimiento a lo dispuesto en los artículos 189, 190, 191 y 192 de la Ley General del Equilibrio Ecológico y la Protección al Ambiente.')]),
          para([bold('TERCERO.- '), normal('Se me reconozca el carácter de coadyuvante, de conformidad con el artículo 193 de la Ley General del Equilibrio Ecológico y la Protección al Ambiente.')]),
          para([bold('CUARTO.- '), normal('Se me permita acceder al o los expedientes que con motivo de esta denuncia se integren, de conformidad con lo dispuesto en el artículo 33 de la Ley Federal del Procedimiento Administrativo.')]),
          // QUINTO: solo si la denuncia es nominal (no anónima) — si es anónima no se comparten datos que proteger
          ...(draft.isAnonymous ? [] : [para([bold('QUINTO.- '), normal('Se mantenga la confidencialidad y reserva de mis datos personales y los de mis autorizados, de conformidad a lo dispuesto en los artículos 1 y 6 de la CPEUM, 113, fracción V, 116 de la Ley General de Transparencia y Acceso a la Información Pública, 4, fracción III, 5, 13, fracción IV, 18, 19, 20 y 21 de la Ley Federal de Transparencia y Acceso a la Información Pública Gubernamental.')], 300)]),

          new Paragraph({ children: [bold('PROTESTO LO NECESARIO')], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
          new Paragraph({ children: [normal(`${municipio}, ${estado}, a la fecha de su presentación.`)], alignment: AlignmentType.CENTER, spacing: { after: 300 } }),

          new Paragraph({ children: [normal('_'.repeat(50))], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
          new Paragraph({ children: [bold('NOMBRE y FIRMA')], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Denuncia_Popular_${folio}.docx`;
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
              onClick={handleDownloadDOCX}
              className="w-full group relative px-8 py-3 rounded-full font-bold text-white overflow-hidden transition-all border border-zinc-700 hover:bg-zinc-800"
            >
              <span className="relative flex items-center justify-center gap-3">
                <FileText size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                Descargar .DOCX
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
                ASUNTO: DENUNCIA POPULAR
              </p>
            </div>

            <div className="space-y-6 text-sm md:text-base leading-relaxed text-slate-800">
              <p className="font-bold">
                A LA AUTORIDAD {draft.aiAnalysis?.competency || 'COMPETENTE'}
                <br />PRESENTE.
              </p>

              <p className="text-justify">
                El que suscribe, <span className="font-bold bg-yellow-100 px-1">{draft.isAnonymous ? 'CIUDADANO BAJO PROTECCIÓN DE ANONIMATO' : (draft.fullName || 'No proporcionado').toUpperCase()}</span>,
                señalando como medio para recibir notificaciones el correo electrónico <u>{draft.email || 'No proporcionado'}</u>, comparezco para exponer:
              </p>

              <p className="text-justify pt-4">
                Que por medio del presente instrumento vengo a denunciar hechos constitutivos de posibles faltas administrativas, fundamentando mi dicho en
                <span className="font-bold mx-1">{draft.aiAnalysis?.legalBasis || 'la legislación aplicable'}</span>.
              </p>

              <div className="bg-slate-100 p-6 border-l-4 border-slate-400 italic my-6 text-slate-700">
                " {draft.description || 'Sin descripción'} "
              </div>

              <div className="text-sm mb-6 border-l-4 border-blue-400 pl-4 bg-blue-50 py-2">
                <span className="font-bold block w-full text-slate-900">FECHA DE LOS HECHOS:</span>
                {draft.eventDate ? new Date(draft.eventDate + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : '(Fecha no proporcionada)'}
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
            onClick={handleDownloadDOCX}
            className="w-full group relative px-8 py-3 rounded-full font-bold text-white overflow-hidden transition-all border border-zinc-700 hover:bg-zinc-800"
          >
            <span className="relative flex items-center justify-center gap-3">
              <FileText size={16} /> Descargar .DOCX
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