import { ai, isApiConfigured } from "./aiClient";

export interface GroundingSource {
    title: string;
    uri: string;
}

export interface GroundedResponse {
    text: string;
    sources: GroundingSource[];
}

export const getGroundedLegalInfo = async (query: string): Promise<GroundedResponse> => {
    if (!isApiConfigured()) return { text: "Modo Demo: Sin conexión a búsqueda.", sources: [] };

    const prompt = `
        Busca información oficial y actualizada en sitios de gobierno de México (gob.mx, profepa.gob.mx, semarnat.gob.mx, diputados.gob.mx) sobre:
        "${query}"
        
        Proporciona una respuesta breve, explicando la normativa o procedimiento aplicable.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        const text = response.text || "No se encontró información.";

        // Extract Sources (Citations)
        const sources: GroundingSource[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

        if (chunks) {
            chunks.forEach((chunk: any) => {
                if (chunk.web) {
                    sources.push({
                        title: chunk.web.title || "Fuente Web",
                        uri: chunk.web.uri || "#"
                    });
                }
            });
        }

        // Deduplicate sources
        const uniqueSources = sources.filter((v, i, a) => a.findIndex(v2 => (v2.uri === v.uri)) === i);

        return { text, sources: uniqueSources };

    } catch (error) {
        console.error("Grounding Error:", error);
        return { text: "Error al consultar fuentes oficiales.", sources: [] };
    }
};
