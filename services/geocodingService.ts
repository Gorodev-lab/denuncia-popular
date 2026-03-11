import { Type } from "@google/genai";
import { ai, isApiConfigured } from "./aiClient";

// Refined Geocoding Function
export const getAddressFromCoordinates = async (lat: number, lng: number): Promise<{ address: string; uri?: string }> => {
    if (!isApiConfigured()) return { address: "Ubicación aproximada (Sin API Key)" };

    const prompt = `
    Find the precise postal address for the coordinates: latitude=${lat}, longitude=${lng}.
    Return only the full address string.
  `;

    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{ googleMaps: {} }],
                }
            });

            const text = response.text;
            let address = text ? text.trim() : "Dirección no encontrada";

            // Extract Google Maps URI from grounding metadata
            let uri: string | undefined;
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

            if (chunks) {
                for (const chunk of chunks) {
                    // @ts-ignore
                    if (chunk.maps?.desktopUri) {
                        // @ts-ignore
                        uri = chunk.maps.desktopUri;
                        break;
                    }
                    // @ts-ignore
                    if (chunk.maps?.uri) {
                        // @ts-ignore
                        uri = chunk.maps.uri;
                        break;
                    }
                }
            }

            return { address, uri };

        } catch (error: any) {
            // Retry only on server errors (5xx)
            if (error.status >= 500 && error.status < 600) {
                attempt++;
                console.warn(`Attempt ${attempt} failed with 500 error. Retrying...`);
                if (attempt >= maxAttempts) {
                    console.error("Max retries reached for Geocoding.");
                    return { address: "Error temporal del servicio de mapas. Intente más tarde." };
                }
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            } else {
                console.error("Error fetching address:", error);
                return { address: "Error al consultar la API de mapas" };
            }
        }
    }
    return { address: "Error desconocido" };
};

// --- PDF Helper ---
export const parseAddressComponents = async (fullAddress: string): Promise<{ estado: string, municipio: string, localidad: string }> => {
    if (!isApiConfigured()) return { estado: "Desconocido", municipio: "Desconocido", localidad: "Desconocido" };

    const prompt = `
        Parse the following Mexican address into its administrative components:
        Address: "${fullAddress}"
        
        Return JSON with keys: 'estado', 'municipio', 'localidad'.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        estado: { type: Type.STRING },
                        municipio: { type: Type.STRING },
                        localidad: { type: Type.STRING }
                    }
                }
            }
        });

        const text = response.text;
        return text ? JSON.parse(text) : { estado: "", municipio: "", localidad: "" };
    } catch (e) {
        return { estado: "", municipio: "", localidad: "" };
    }
}
