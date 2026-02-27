
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testGemini() {
    console.log("--- Testing Gemini API ---");

    // Read .env.local manually
    const envPath = path.resolve(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VITE_GEMINI_API_KEY=["']?(.*?)["']?(\s|$)/);
    const apiKey = match ? match[1] : null;

    if (!apiKey) {
        console.error("❌ No VITE_GEMINI_API_KEY found in .env.local");
        return;
    }

    console.log("Found API Key:", apiKey.substring(0, 10) + "...");

    const genAI = new GoogleGenAI({ apiKey });

    // List models to see what's available
    try {
        console.log("\nAttempting to generate content with gemini-1.5-flash...");
        const model = genAI.models.get("gemini-1.5-flash");
        const result = await model.generateContent("Hola, responde con 'Conectado'.");
        console.log("Response:", result.text);
        console.log("✅ API Key is working!");
    } catch (error) {
        console.error("❌ Error with gemini-1.5-flash:", error.message);
    }

    try {
        console.log("\nTesting gemini-2.0-flash...");
        const model = genAI.models.get("gemini-2.0-flash");
        const result = await model.generateContent("Test");
        if (result.text) console.log("Response successful with gemini-2.0-flash.");
    } catch (error) {
        console.log("ℹ️ gemini-2.0-flash not available or error:", error.message);
    }
}

testGemini();
