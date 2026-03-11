import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || import.meta.env?.VITE_GEMINI_API_KEY || '';
export const ai = new GoogleGenAI({ apiKey });
export const isApiConfigured = () => Boolean(apiKey);
