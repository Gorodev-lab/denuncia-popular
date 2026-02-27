export async function callGeminiTriage(
    messages: { role: 'user' | 'model', content: string }[]
): Promise<string> {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

    const formattedContents = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
    }));

    const systemPrompt = "Act as a Legal Aid Assistant for Mexican Citizens. Your goal is to help users describe their environmental complaints cleanly and objectively. You must ask concise, structured questions for: Location (ask to send via clip), Evidence (ask for photos), and Description of Facts. If the user has provided all information, your last line of the response should exactly be: [REPORT_READY]";

    formattedContents.unshift({
        role: 'user',
        parts: [{ text: `System: ${systemPrompt}` }]
    });

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedContents })
    });

    if (!response.ok) {
        throw new Error(`Gemini Error: ${await response.text()}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, hubo un error procesando tu mensaje.";
}
