import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from '../types';

const apiKey = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export interface GroundingSource {
    title: string;
    uri: string;
}

export interface GroundedResponse {
    text: string;
    sources: GroundingSource[];
}

// Fast analysis using Flash Lite
export const analyzeComplaint = async (description: string, locationContext?: string): Promise<AIAnalysisResult> => {
  if (!apiKey) {
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

// Refined Geocoding Function
export const getAddressFromCoordinates = async (lat: number, lng: number): Promise<{ address: string; uri?: string }> => {
  if (!apiKey) return { address: "Ubicación aproximada (Sin API Key)" };

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
            // responseMimeType and responseSchema are NOT supported with googleMaps tool
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

// New: Grounded Legal Search
export const getGroundedLegalInfo = async (query: string): Promise<GroundedResponse> => {
    if (!apiKey) return { text: "Modo Demo: Sin conexión a búsqueda.", sources: [] };

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
                tools: [{ googleSearch: {} }], // Enable Search Grounding
                // JSON mode is NOT supported with Search tool, so we parse manually if needed or return text
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
        const uniqueSources = sources.filter((v,i,a)=>a.findIndex(v2=>(v2.uri===v.uri))===i);

        return { text, sources: uniqueSources };

    } catch (error) {
        console.error("Grounding Error:", error);
        return { text: "Error al consultar fuentes oficiales.", sources: [] };
    }
};

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
    if (!apiKey) {
        return {
            message: "Modo Demo: Describe los hechos.",
            draftNarrative: history[history.length-1]?.text || '',
            missingElements: [],
            competency: 'MUNICIPAL',
            legalBasis: 'N/A'
        };
    }

    const systemInstruction = `
    Act as an expert legal assistant for 'Denuncia Popular' in Mexico (PROFEPA/Local Authorities).
    Your goal is to interview the citizen to build a formal administrative complaint document.

    INSTRUCTIONS (Chain of Thought):
    1. Analyze the conversation history and the user's latest input.
    2. Check for the presence of these KEY ELEMENTS:
       - **Time**: When did it happen? (Date/Time)
       - **Mode**: Detailed description of the events.
       - **Place**: Specific location details/references (beyond just coordinates).
       - **Responsibility**: Who is the alleged offender? (Name, Company, Plate Number, Description).
    3. **Reasoning**: Think about what is missing. If something is missing, formulate a follow-up question.
    4. **Drafting**: Update the 'draftNarrative'. This text must be written in **FORMAL, THIRD-PERSON LEGAL SPANISH** (e.g., "El que suscribe hace constar que...", "Se observó que en el domicilio..."). This narrative will be put directly into the PDF.
    5. **Legal Analysis**: Based on the facts, determine the 'competency' and suggest a 'legalBasis' (e.g., LGEEPA, Reglamento de Tránsito, etc.).

    OUTPUT FORMAT:
    Return ONLY a JSON object with this structure:
    {
      "message": "Your conversational response to the user (e.g. asking for the missing date).",
      "draftNarrative": "The full formal legal description of facts accumulated so far.",
      "missingElements": ["Time", "Responsibility"],
      "competency": "FEDERAL",
      "legalBasis": "Art. 190 LGEEPA"
    }
    `;

    const contents = history.map(msg => ({
        role: msg.role,
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

// --- PDF Helper ---
export const parseAddressComponents = async (fullAddress: string): Promise<{ estado: string, municipio: string, localidad: string }> => {
    if (!apiKey) return { estado: "Desconocido", municipio: "Desconocido", localidad: "Desconocido" };

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

// --- Image Generation ---
export const getLocationDetails = async (lat: number, lng: number): Promise<{ thumbnailUrl?: string, description: string }> => {
    if (!apiKey) return { description: "Ubicación seleccionada." };

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
            // Note: In a real implementation, you would use generateImages or generateContent for images.
            // Assuming text-to-image capability via generateContent for this demo or specialized model.
            // Since the user asked for gemini-3-pro-image-preview specifically:
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
