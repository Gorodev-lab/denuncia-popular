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
    const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const denunciante = draft.isAnonymous ? 'CIUDADANO BAJO PROTECCIÓN DE ANONIMATO' : (draft.fullName || 'No especificado').toUpperCase();
    const contacto = draft.isAnonymous ? 'Solicita protección de datos personales' : (draft.email || 'No especificado');
    const domicilio = draft.domicilio || 'No proporcionado';
    const autorizados = draft.personasAutorizadas || 'No declarado';

    const quien = {
      'NO_CONOCIMIENTO': ' [X] No tengo conocimiento  [ ] Gobierno  [ ] Empresa  [ ] Particular',
      'GOBIERNO': ' [ ] No tengo conocimiento  [X] Gobierno  [ ] Empresa  [ ] Particular',
      'EMPRESA': ' [ ] No tengo conocimiento  [ ] Gobierno  [X] Empresa  [ ] Particular',
      'PARTICULAR': ' [ ] No tengo conocimiento  [ ] Gobierno  [ ] Empresa  [X] Particular',
    }[draft.denunciadoTipo || 'NO_CONOCIMIENTO'];

    const evidencia = (draft.evidenceFiles || []).length > 0
      ? (draft.evidenceFiles || []).map(f => `  - IMAGEN (archivo): ${f.name}`).join('\n')
      : '  - Sin archivos adjuntos.';

    const legalBasis = draft.aiAnalysis?.legalBasis || 'artículos 189, 190, 191 y 192 de la LGEEPA';

    return `ASUNTO: Denuncia Popular.
FOLIO: ${folio}

Procuraduría Federal de Protección al Ambiente (PROFEPA)
Oficina de representación en el Estado de ${estado.toUpperCase()}.
Presente.

------------------------------------------------------------

Por el presente procedo a DENUNCIAR hechos, actividades u omisiones que están produciendo o pueden producir desequilibrio ecológico y daños a los recursos naturales, así como infracciones a las disposiciones legales y reglamentarias en materia ambiental, con fundamento en los artículos 189, 190, 191 y 192 de la Ley General del Equilibrio Ecológico y la Protección al Ambiente (LGEEPA). Al respecto expongo:

¿QUÉ SE ESTÁ DENUNCIANDO?
------------------------------------------------------------
${draft.description || 'Sin descripción proporcionada.'}

¿CUÁNDO OCURRIÓ O DESDE CUÁNDO ESTÁ OCURRIENDO?
------------------------------------------------------------
${draft.eventDate ? new Date(draft.eventDate + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : '(fecha no declarada)'}

¿DÓNDE ESTÁ OCURRIENDO?
------------------------------------------------------------
Estado:             ${estado}
Municipio/Alcaldía: ${municipio}
Localidad/Colonia:  ${colonia}
Ubicación/Referencias: ${ubicacionCompleta}
Coordenadas GPS:    Latitud ${draft.location?.lat?.toFixed(6) || 'N/A'}, Longitud ${draft.location?.lng?.toFixed(6) || 'N/A'}

¿QUIÉN O QUIENES ESTÁN REALIZANDO ESTA ACCIÓN?
------------------------------------------------------------
${quien}

PRUEBAS:
------------------------------------------------------------
Fotografías o imágenes: [X]
${evidencia}

DATOS DE IDENTIFICACIÓN DE LA PERSONA DENUNCIANTE:
------------------------------------------------------------
Nombre completo: ${denunciante}
Domicilio: ${domicilio}
Correo electrónico: ${contacto}
Personas autorizadas para oír y recibir notificaciones a: ${autorizados}

S O L I C I T O:
------------------------------------------------------------
PRIMERO.- Se tenga por presentada y radicada la presente Denuncia Popular y se ordene el despliegue de las visitas de inspección o acciones tendientes a corroborar los actos y omisiones expuestos, con base en los artículos 189, 190, 191 y 192 de la LGEEPA.

TERCERO.- Se me permita ejercer el derecho de acceso al expediente que resulte con motivo de esta denuncia, conforme al artículo 33 de la Ley Federal de Procedimiento Administrativo.

CUARTO.- Se garantice la confidencialidad de mis datos personales conforme a los artículos 1 y 6 de la Constitución Política de los Estados Unidos Mexicanos y la Ley General de Transparencia y Acceso a la Información Pública.

QUINTO.- Se emita la resolución correspondiente en los términos de ley.

PROTESTO LO NECESARIO
${municipio}, ${estado}, a la fecha de su presentación.

___________________________________
NOMBRE Y FIRMA
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

      // --- AUTHORITY ---
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.text(`ASUNTO: Denuncia Popular.`, margin, yPos);
      doc.text(`FOLIO: ${folio}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 10;

      doc.setFontSize(11);
      doc.text('Procuraduría Federal de Protección al Ambiente (PROFEPA)', margin, yPos);
      yPos += 5;
      doc.setFontSize(10);
      doc.text(`Oficina de representación en el Estado de ${estado.toUpperCase()}.`, margin, yPos);
      yPos += 5;
      doc.text('Presente:', margin, yPos);
      yPos += 10;

      // --- INTRO ---
      doc.setFont('times', 'normal');
      const intro = `Por el presente procedo a DENUNCIAR hechos, actividades u omisiones que están produciendo o pueden producir desequilibrio ecológico y daños a los recursos naturales, así como infracciones a las disposiciones legales y reglamentarias en materia ambiental, con fundamento en los artículos 189, 190, 191 y 192 de la Ley General del Equilibrio Ecológico y la Protección al Ambiente (LGEEPA). Al respecto expongo:`;
      addWrappedText(intro, 10, 'normal');
      yPos += 5;

      // --- 1. QUÉ SE DENUNCIA ---
      addWrappedText('¿QUÉ SE ESTÁ DENUNCIANDO?', 10, 'bold');
      addWrappedText(draft.description || 'Sin descripción proporcionada.', 10, 'normal');
      yPos += 5;

      // --- 2. CUÁNDO ---
      addWrappedText('¿CUÁNDO OCURRIÓ O DESDE CUÁNDO ESTÁ OCURRIENDO?', 10, 'bold');
      const fechaEvento = draft.eventDate
        ? new Date(draft.eventDate + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
        : '___________________________________';
      addWrappedText(fechaEvento, 10, 'normal');
      yPos += 5;

      // --- 3. DÓNDE ---
      addWrappedText('¿DÓNDE ESTÁ OCURRIENDO?', 10, 'bold');
      addWrappedText(`Estado:              ${estado}`, 10, 'normal', 5);
      addWrappedText(`Municipio/Alcaldía:  ${municipio}`, 10, 'normal', 5);
      addWrappedText(`Localidad/Colonia:   ${colonia}`, 10, 'normal', 5);
      addWrappedText(`Referencia:          ${getUbicacionCompleta(draft)}`, 10, 'normal', 5);
      addWrappedText(`Coordenadas GPS:     Latitud ${draft.location?.lat?.toFixed(6) || 'N/A'}, Longitud ${draft.location?.lng?.toFixed(6) || 'N/A'}`, 10, 'normal', 5);
      yPos += 5;

      // --- 4. QUIÉN ---
      addWrappedText('¿QUIÉN O QUIENES ESTÁN REALIZANDO ESTA ACCIÓN?', 10, 'bold');
      const quienMap = {
        'NO_CONOCIMIENTO': '[X] No tengo conocimiento  [ ] Gobierno  [ ] Empresa  [ ] Particular',
        'GOBIERNO': '[ ] No tengo conocimiento  [X] Gobierno  [ ] Empresa  [ ] Particular',
        'EMPRESA': '[ ] No tengo conocimiento  [ ] Gobierno  [X] Empresa  [ ] Particular',
        'PARTICULAR': '[ ] No tengo conocimiento  [ ] Gobierno  [ ] Empresa  [X] Particular',
      };
      addWrappedText(quienMap[draft.denunciadoTipo || 'NO_CONOCIMIENTO'], 10, 'normal', 5);
      yPos += 5;

      // --- 5. PRUEBAS ---
      addWrappedText('PRUEBAS:', 10, 'bold');
      addWrappedText('Fotografías o imágenes: [X]', 10, 'normal', 5);
      const evidenceFiles = draft.evidenceFiles || [];
      if (evidenceFiles.length > 0) {
        evidenceFiles.forEach(file => {
          addWrappedText(`- IMAGEN (archivo): ${file.name}`, 10, 'normal', 5);
        });
      } else {
        addWrappedText('- Sin archivos adjuntos.', 10, 'normal', 5);
      }
      yPos += 5;

      // --- 6. DENUNCIANTE ---
      addWrappedText('DATOS DE IDENTIFICACIÓN DE LA PERSONA DENUNCIANTE:', 10, 'bold');
      addWrappedText(`Nombre completo: ${denunciante}`, 10, 'normal');
      addWrappedText(`Domicilio: ${draft.domicilio || 'No proporcionado'}`, 10, 'normal');
      addWrappedText(`Correo electrónico: ${draft.email}`, 10, 'normal');
      addWrappedText(`Personas autorizadas: ${draft.personasAutorizadas || 'No declarado'}`, 10, 'normal');
      yPos += 8;

      // --- SOLICITO ---
      addWrappedText('S O L I C I T O:', 11, 'bold');
      yPos += 3;

      const solicitudes = [
        'PRIMERO.- Se tenga por presentada y radicada la presente Denuncia Popular y se ordene el despliegue de las visitas de inspección o acciones tendientes a corroborar los actos y omisiones expuestos, con base en los artículos 189, 190, 191 y 192 de la LGEEPA.',
        'TERCERO.- Se me permita ejercer el derecho de acceso al expediente que resulte con motivo de esta denuncia, conforme al artículo 33 de la Ley Federal de Procedimiento Administrativo.',
        'CUARTO.- Se garantice la confidencialidad de mis datos personales conforme a los artículos 1 y 6 de la Constitución Política de los Estados Unidos Mexicanos y la Ley General de Transparencia y Acceso a la Información Pública.',
        'QUINTO.- Se emita la resolución correspondiente en los términos de ley.',
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
      doc.text('PROTESTO LO NECESARIO', margin + (contentWidth / 2), yPos, { align: 'center' });
      yPos += 5;
      doc.setFont('times', 'normal');
      doc.text(`${municipio}, ${estado}, a la fecha de su presentación.`, margin + (contentWidth / 2), yPos, { align: 'center' });
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

    const hr = new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' } },
      spacing: { after: 120 },
    });

    const bold = (text: string) => new TextRun({ text, bold: true, font: 'Times New Roman', size: 22 });
    const normal = (text: string) => new TextRun({ text, font: 'Times New Roman', size: 22 });
    const para = (children: TextRun[], spacing = 160) =>
      new Paragraph({ children, spacing: { after: spacing } });

    const doc = new Document({
      title: `Denuncia Popular ${folio}`,
      description: 'Denuncia Popular – PROFEPA',
      sections: [{
        children: [
          // Header
          new Paragraph({
            children: [bold('ASUNTO: '), normal('Denuncia Popular.')],
            alignment: AlignmentType.LEFT,
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [bold(`FOLIO: ${folio}`)],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),
          new Paragraph({ children: [bold('Procuraduría Federal de Protección al Ambiente (PROFEPA)')], heading: HeadingLevel.HEADING_2, spacing: { after: 40 } }),
          para([normal(`Oficina de representación en el Estado de ${estado.toUpperCase()}.`)]),
          para([bold('Presente:')]),
          hr,
          // Intro
          para([
            normal(`Por el presente procedo a DENUNCIAR hechos, actividades u omisiones que están produciendo o pueden producir desequilibrio ecológico y daños a los recursos naturales, así como infracciones a las disposiciones legales y reglamentarias en materia ambiental, con fundamento en los artículos 189, 190, 191 y 192 de la Ley General del Equilibrio Ecológico y la Protección al Ambiente (LGEEPA). Al respecto expongo:`),
          ], 200),
          // Sections
          new Paragraph({ children: [bold('¿QUÉ SE ESTÁ DENUNCIANDO?')], heading: HeadingLevel.HEADING_3, spacing: { after: 80 } }),
          para([normal(draft.description || 'Sin descripción proporcionada.')], 160),

          new Paragraph({ children: [bold('¿CUÁNDO OCURRIÓ O DESDE CUÁNDO ESTÁ OCURRIENDO?')], heading: HeadingLevel.HEADING_3, spacing: { after: 80 } }),
          para([normal(fechaEvento)], 160),

          new Paragraph({ children: [bold('¿DÓNDE ESTÁ OCURRIENDO?')], heading: HeadingLevel.HEADING_3, spacing: { after: 80 } }),
          para([bold('Estado:              '), normal(estado)]),
          para([bold('Municipio/Alcaldía:  '), normal(municipio)]),
          para([bold('Localidad/Colonia:   '), normal(colonia)]),
          para([bold('Ubicación/Ref:       '), normal(getUbicacionCompleta(draft))]),
          para([bold('Coordenadas GPS:     '), normal(`Latitud ${draft.location?.lat?.toFixed(6) || 'N/A'}, Longitud ${draft.location?.lng?.toFixed(6) || 'N/A'}`)], 160),

          new Paragraph({ children: [bold('¿QUIÉN O QUIENES ESTÁN REALIZANDO ESTA ACCIÓN?')], heading: HeadingLevel.HEADING_3, spacing: { after: 80 } }),
          para([
            normal(draft.denunciadoTipo === 'NO_CONOCIMIENTO' ? ' [X] No tengo conocimiento' : ' [ ] No tengo conocimiento'),
            normal(draft.denunciadoTipo === 'GOBIERNO' ? '  [X] Gobierno' : '  [ ] Gobierno'),
            normal(draft.denunciadoTipo === 'EMPRESA' ? '  [X] Empresa' : '  [ ] Empresa'),
            normal(draft.denunciadoTipo === 'PARTICULAR' ? '  [X] Particular' : '  [ ] Particular'),
          ], 160),

          new Paragraph({ children: [bold('PRUEBAS:')], heading: HeadingLevel.HEADING_3, spacing: { after: 80 } }),
          para([normal('Fotografías o imágenes: [X]')]),
          ...(draft.evidenceFiles.length > 0
            ? draft.evidenceFiles.map(f => para([normal(`• IMAGEN (archivo): ${f.name}`)]))
            : [para([normal('• Sin archivos adjuntos.')])]),

          new Paragraph({ children: [bold('DATOS DE IDENTIFICACIÓN DE LA PERSONA DENUNCIANTE:')], heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 80 } }),
          para([bold('Nombre completo: '), normal(denunciante)]),
          para([bold('Domicilio: '), normal(draft.domicilio || 'No proporcionado')]),
          para([bold('Correo electrónico: '), normal(draft.email)]),
          para([bold('Personas autorizadas: '), normal(draft.personasAutorizadas || 'No declarado')], 200),

          hr,
          // SOLICITO
          new Paragraph({ children: [bold('S O L I C I T O :')], heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
          para([bold('PRIMERO.- '), normal('Se tenga por presentada y radicada la presente Denuncia Popular y se ordene el despliegue de las visitas de inspección o acciones tendientes a corroborar los actos y omisiones expuestos, con base en los artículos 189, 190, 191 y 192 de la LGEEPA.')]),
          para([bold('TERCERO.- '), normal('Se me permita ejercer el derecho de acceso al expediente que resulte con motivo de esta denuncia, conforme al artículo 33 de la Ley Federal de Procedimiento Administrativo.')]),
          para([bold('CUARTO.- '), normal('Se garantice la confidencialidad de mis datos personales conforme a los artículos 1 y 6 de la Constitución Política de los Estados Unidos Mexicanos y la Ley General de Transparencia y Acceso a la Información Pública.')]),
          para([bold('QUINTO.- '), normal('Se emita la resolución correspondiente en los términos de ley.')], 300),

          hr,
          new Paragraph({ children: [bold('PROTESTO LO NECESARIO')], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
          new Paragraph({ children: [normal(`${municipio}, ${estado}, a la fecha de su presentación.`)], alignment: AlignmentType.CENTER, spacing: { after: 300 } }),

          new Paragraph({ children: [normal('_'.repeat(50))], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
          new Paragraph({ children: [bold('NOMBRE Y FIRMA')], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
          new Paragraph({ children: [normal(denunciante)], alignment: AlignmentType.CENTER }),
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
                ASUNTO: DENUNCIA CIUDADANA POR FALTAS ADMINISTRATIVAS
              </p>
            </div>

            <div className="space-y-6 text-sm md:text-base leading-relaxed text-slate-800 text-justify">
              <p className="font-bold">
                A LA AUTORIDAD {draft.aiAnalysis?.competency || 'COMPETENTE'}
                <br />PRESENTE.
              </p>

              <p>
                Por el presente procedo a <span className="font-bold">DENUNCIAR</span> hechos, actividades u omisiones que están produciendo o pueden producir desequilibrio ecológico y daños a los recursos naturales, así como infracciones a las disposiciones legales y reglamentarias en materia ambiental, con fundamento en los artículos 189, 190, 191 y 192 de la Ley General del Equilibrio Ecológico y la Protección al Ambiente (LGEEPA). Al respecto expongo:
              </p>

              <p>
                <span className="font-bold block uppercase border-b border-slate-300 mb-2">¿Qué se está denunciando?</span>
                {draft.description}
              </p>

              <p>
                <span className="font-bold block uppercase border-b border-slate-300 mb-2">¿Cuándo ocurrió?</span>
                {draft.eventDate ? new Date(draft.eventDate + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : '(fecha no declarada)'}
              </p>

              <div>
                <span className="font-bold block uppercase border-b border-slate-300 mb-2">¿Dónde está ocurriendo?</span>
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded">
                  <div>
                    <span className="font-bold text-slate-900">Estado:</span> {getEstado(draft)}<br />
                    <span className="font-bold text-slate-900">Municipio:</span> {getMunicipio(draft)}<br />
                    <span className="font-bold text-slate-900">Localidad:</span> {draft.location?.colonia || draft.location?.localidad || 'N/A'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Coordenadas:</span> {draft.location ? `${draft.location.lat.toFixed(6)}, ${draft.location.lng.toFixed(6)}` : 'N/A'}<br />
                    <span className="font-bold text-slate-900">Referencia:</span> {getUbicacionCompleta(draft)}
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold block uppercase border-b border-slate-300 mb-2">¿Quién o quienes?</span>
                <div className="flex flex-wrap gap-4 text-xs">
                  {['NO_CONOCIMIENTO', 'GOBIERNO', 'EMPRESA', 'PARTICULAR'].map(tipo => (
                    <div key={tipo} className="flex items-center gap-1">
                      {draft.denunciadoTipo === tipo ? '☒' : '☐'} {tipo.replace('_', ' ').toLowerCase()}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold block uppercase border-b border-slate-300 mb-2">Pruebas</span>
                <p className="text-xs">Fotografías o imágenes: ☒ ({draft.evidenceFiles.length} archivos)</p>
              </div>

              <div>
                <span className="font-bold block uppercase border-b border-slate-300 mb-2">Datos Denunciante</span>
                <div className="text-xs space-y-1">
                  <p><span className="font-bold">Nombre:</span> {draft.isAnonymous ? 'ANÓNIMO' : draft.fullName}</p>
                  <p><span className="font-bold">Domicilio:</span> {draft.domicilio || 'No proporcionado'}</p>
                  <p><span className="font-bold">Correo:</span> {draft.email}</p>
                  <p><span className="font-bold">Autorizados:</span> {draft.personasAutorizadas || 'Ninguno'}</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-400 flex flex-col items-center justify-center">
                <p className="font-bold uppercase mb-4 text-xs">PROTESTO LO NECESARIO</p>
                <div className="font-dancing-script text-2xl mb-2 text-blue-900">
                  {draft.isAnonymous ? 'Firma Digital Anónima' : draft.fullName}
                </div>
                <div className="border-t border-slate-900 w-48"></div>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">NOMBRE y FIRMA</p>
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