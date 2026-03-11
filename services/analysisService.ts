import { Type } from "@google/genai";
import { ai, isApiConfigured } from "./aiClient";
import { AIAnalysisResult } from "../types";

export const analyzeComplaint = async (description: string, locationContext?: string): Promise<AIAnalysisResult> => {
    if (!isApiConfigured()) {
        return {
            competency: 'MUNICIPAL',
            legalBasis: 'Simulación: Falta API Key.',
            summary: 'Análisis simulado.'
        };
    }

    const prompt = `
    Analiza la siguiente denuncia ciudadana en México.
    Descripción: "${description}"
    Contexto de ubicación: "${locationContext || 'No especificado'}"
    
    Determina:
    1. La competencia (MUNICIPAL, ESTATAL, FEDERAL).
    2. Un breve fundamento legal sugerido.
    3. Un resumen formal de los hechos.
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        competency: {
                            type: Type.STRING,
                            enum: ['MUNICIPAL', 'ESTATAL', 'FEDERAL', 'UNKNOWN']
                        },
                        legalBasis: { type: Type.STRING },
                        summary: { type: Type.STRING }
                    },
                    required: ['competency', 'legalBasis', 'summary']
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");

        return JSON.parse(text) as AIAnalysisResult;

    } catch (error) {
        console.error("Error analyzing complaint:", error);
        throw error;
    }
};
