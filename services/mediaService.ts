import { ai, isApiConfigured } from "./aiClient";

export const getLocationDetails = async (lat: number, lng: number): Promise<{ thumbnailUrl?: string, description: string }> => {
    if (!isApiConfigured()) return { description: "Ubicación seleccionada." };

    // Parallel execution: Image Generation + Grounded Description

    // 1. Description (Grounded)
    const descPromise = (async () => {
        const prompt = `
            Describe brevemente el área geográfica en las coordenadas ${lat}, ${lng} en México.
            Menciona si es zona urbana, rural, área protegida o si hay cuerpos de agua cerca.
            Usa datos reales de Google Search.
        `;
        try {
            const res = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] }
            });
            return res.text || "Descripción no disponible.";
        } catch (e) { return "Error obteniendo descripción."; }
    })();

    // 2. Image (Gemini 3 Pro Image)
    const imgPromise = (async () => {
        const prompt = `
            Genera una imagen satelital artística y minimalista de un mapa estilo "dark mode" centrado en coordenadas ${lat}, ${lng}. 
            Vista cenital, tonos oscuros, cian y magenta. Alta resolución.
        `;
        try {
            const res = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: prompt,
                config: {
                    imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
                }
            });

            // Extract image
            for (const part of res.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
            return undefined;
        } catch (e) { return undefined; }
    })();

    const [description, thumbnailUrl] = await Promise.all([descPromise, imgPromise]);
    return { description, thumbnailUrl };
};
