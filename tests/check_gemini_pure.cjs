
const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env.local
if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

async function test() {
    console.log("--- Gemini Connectivity Test ---");
    console.log("API Key detected:", apiKey ? apiKey.substring(0, 6) + "..." : "NONE");

    if (!apiKey) {
        console.error("❌ No API Key found in .env.local");
        return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = 'gemini-1.5-flash';

    try {
        console.log(`Testing model: ${modelId}...`);
        const result = await ai.models.generateContent({
            model: modelId,
            contents: [{ role: 'user', parts: [{ text: 'Hola, di "Conectado"' }] }]
        });
        console.log("✅ Success! Response:", result.text);
    } catch (error) {
        console.error("❌ API Call Failed:");
        console.error("Message:", error.message);
        if (error.status) console.error("Status:", error.status);
    }
}

test();
