import { GoogleGenAI } from '@google/genai';

/**
 * Auto-tag reports using Google's Gemini AI
 * 
 * @param description - User's report description
 * @returns Array of 3 relevant tags
 */
export async function suggestTags(description: string): Promise<string[]> {
    // Default fallback tags
    const DEFAULT_TAGS = ['General', 'Sin categoría', 'Pendiente'];

    try {
        // Get API key from environment
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            console.warn('Gemini API key not found, using default tags');
            return DEFAULT_TAGS;
        }

        // Initialize the AI client
        const genAI = new GoogleGenAI({ apiKey });

        // Craft the prompt
        const prompt = `Analyze this citizen report and suggest exactly 3 relevant tags in Spanish.

Report description: "${description}"

Return ONLY a JSON array of 3 strings (tags). The tags should categorize the issue.
Example categories: Infrastructure, Seguridad, Alumbrado, Limpieza, Baches, Tránsito, Urgente, etc.

Format: ["tag1", "tag2", "tag3"]

JSON array:`;

        // Generate content
        const result = await genAI.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt
        });
        const text = result.text.trim();

        // Parse the JSON response
        try {
            // Extract JSON array from response (handle markdown code blocks)
            const jsonMatch = text.match(/\[.*\]/s);
            if (!jsonMatch) {
                console.warn('No JSON array found in response, using default tags');
                return DEFAULT_TAGS;
            }

            const tags = JSON.parse(jsonMatch[0]);

            // Validate the result
            if (Array.isArray(tags) && tags.length === 3 && tags.every(t => typeof t === 'string')) {
                return tags;
            } else {
                console.warn('Invalid tags format, using default tags');
                return DEFAULT_TAGS;
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            return DEFAULT_TAGS;
        }

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return DEFAULT_TAGS;
    }
}
