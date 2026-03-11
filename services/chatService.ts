import { Type } from "@google/genai";
import { ai, isApiConfigured } from "./aiClient";

export interface ChatGuideResponse {
    message: string;
    draftNarrative: string;
    missingElements: string[];
    competency: 'MUNICIPAL' | 'ESTATAL' | 'FEDERAL' | 'UNKNOWN';
    legalBasis: string;
}

export const interactWithComplaintGuide = async (
    history: { role: 'user' | 'model'; text: string }[],
    locationContext?: string
): Promise<ChatGuideResponse> => {
    if (!isApiConfigured()) {
        return {
            message: "Modo Demo: Describe los hechos.",
            draftNarrative: history[history.length - 1]?.text || '',
            missingElements: [],
            competency: 'MUNICIPAL',
            legalBasis: 'N/A'
        };
    }

    const systemInstruction = `
    Eres un asistente legal experto en "Denuncia Popular" en México (PROFEPA/Autoridades Locales).
    Tu objetivo es entrevistar al ciudadano para construir la NARRACIÓN DE HECHOS de una denuncia administrativa formal.

    INSTRUCCIONES CRÍTICAS PARA 'draftNarrative':
    - El texto debe contener ÚNICAMENTE la narración objetiva y cronológica de los HECHOS observados.
    - Redactar en ESPAÑOL LEGAL FORMAL en TERCERA PERSONA ("Se constató que...", "Se observó que...", "En la fecha indicada se detectó...").
    - NO incluir frases de fórmula legal como: "en ejercicio de su derecho a la Denuncia Popular", "solicitando la confidencialidad y reserva de sus datos personales", "reconocimiento del principio de coadyuvancia", "acceso al expediente", etc. Esas cláusulas SE INCLUYEN AUTOMÁTICAMENTE en otra sección del documento.
    - NO incluir encabezados, salutaciones ni cierres. Solo los hechos.
    - Ser lo más específico y detallado posible (hora, descripción de vehículos, número de personas, materiales, etc.).

    PROCESO (Chain of Thought):
    1. Analiza el historial y el último mensaje del usuario.
    2. Verifica si están presentes estos ELEMENTOS CLAVE:
       - **Tiempo**: ¿Cuándo ocurrió? (Fecha/Hora aproximada)
       - **Hechos**: Descripción detallada de lo observado.
       - **Lugar**: Detalles específicos de la ubicación (más allá de coordenadas).
       - **Responsables**: ¿Quién lo hace? (Nombre, empresa, placas, descripción física/vehicular).
    3. Si falta algún elemento, formula una pregunta de seguimiento específica.
    4. Actualiza 'draftNarrative' con SOLO la narración objetiva acumulada.
    5. Determina la 'competency' y 'legalBasis' aplicable (ej. LGEEPA, etc.).

    FORMATO DE RESPUESTA:
    Devuelve ÚNICAMENTE un JSON con esta estructura:
    {
      "message": "Tu respuesta conversacional al usuario (ej. preguntando la fecha o descripción faltante).",
      "draftNarrative": "Narración formal y objetiva de los hechos, sin fórmulas legales.",
      "missingElements": ["Tiempo", "Responsables"],
      "competency": "FEDERAL",
      "legalBasis": "Art. 190 LGEEPA"
    }
    `;

    const contents = history.map(msg => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.text }]
    }));

    // Inject location context into the last user message if provided
    if (locationContext && contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts[0].text += `\n[System Context: User Location is ${locationContext}]`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 1024 }, // Enable CoT for better reasoning
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        message: { type: Type.STRING },
                        draftNarrative: { type: Type.STRING },
                        missingElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                        competency: { type: Type.STRING, enum: ['MUNICIPAL', 'ESTATAL', 'FEDERAL', 'UNKNOWN'] },
                        legalBasis: { type: Type.STRING }
                    },
                    required: ['message', 'draftNarrative', 'competency', 'legalBasis']
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");

        return JSON.parse(text) as ChatGuideResponse;

    } catch (error) {
        console.error("Guide Error:", error);
        throw error;
    }
};
