import { calculateSHA256 } from "./crypto.ts";

// --- Interfaces ---

interface NormalizedMessage {
    provider: "twilio";
    from: string; // e.g., "whatsapp:+1234567890"
    to: string;
    body?: string;
    type: "text" | "image" | "location";
    mediaUrl?: string; // URL to download media
    mediaContentType?: string;
    latitude?: string;
    longitude?: string;
    messageSid: string;
    timestamp: string;
}

interface WorkerResult {
    action: "reply" | "store" | "ignore";
    replyPayload?: any;
    data?: any;
}

// --- Configuration ---
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!; // Format: whatsapp:+14155238886

/**
 * Worker Logic for Twilio Messages
 */
export async function processWhatsAppMessage(message: NormalizedMessage): Promise<WorkerResult> {
    console.log(`Processing message type: ${message.type} from ${message.from}`);

    // 1. Handle TEXT Messages (Triaging)
    if (message.type === "text") {
        const userText = message.body || "";

        // Simple Keyword Triaging for MVP (Replacing Gemini for speed in this step, but logic place holds)
        // const triageResult = await callGeminiTriage(userText); 
        const isReport = userText.toLowerCase().includes("denuncia") || userText.toLowerCase().includes("reporte");

        if (isReport) {
            // Request Location via Text (Twilio doesn't support interactive location request easily on all numbers)
            const replyText = "Para procesar tu denuncia, por favor envía tu ubicación actual usando el clip 📎 -> Ubicación.";
            await sendTwilioReply(message.from, replyText);
            return { action: "reply", replyPayload: replyText };
        } else {
            const replyText = "Hola. Soy tu asistente legal personal. Escribe 'Denuncia' para comenzar.";
            await sendTwilioReply(message.from, replyText);
            return { action: "reply", replyPayload: replyText };
        }
    }

    // 2. Handle IMAGE Messages (SHIELD Protocol)
    if (message.type === "image" && message.mediaUrl) {
        console.log("Processing Image with SHIELD Protocol...");

        // Download Image from Twilio URL
        // Twilio Media URLs are public (with auth token sometimes if protected, but generally accessible short term)
        // Usually requires Basic Auth if "Enforce HTTP Auth on Media URLs" is enabled in Console.
        const authHeaders = new Headers();
        authHeaders.set("Authorization", "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`));

        const imageResponse = await fetch(message.mediaUrl, { headers: authHeaders });
        const imageBuffer = await imageResponse.arrayBuffer();

        // Calculate SHA-256
        const shieldHash = await calculateSHA256(imageBuffer);
        console.log(`[SHIELD] Calculated SHA-256: ${shieldHash}`);

        await sendTwilioReply(message.from, "Imagen recibida y asegurada. 🛡️ Procesando...");

        return {
            action: "store",
            data: {
                type: "evidence",
                file_hash: shieldHash,
                media_url: message.mediaUrl, // Store original URL or upload to Supabase Storage
            }
        };
    }

    // 3. Handle LOCATION Messages
    if (message.type === "location" && message.latitude && message.longitude) {
        console.log(`Location received: ${message.latitude}, ${message.longitude}`);

        const replyText = `Ubicación recibida (${message.latitude}, ${message.longitude}). Generando reporte... 📄`;
        await sendTwilioReply(message.from, replyText);

        return {
            action: "store",
            data: {
                type: "location_update",
                lat: parseFloat(message.latitude),
                lng: parseFloat(message.longitude),
            }
        };
    }

    return { action: "ignore" };
}

// --- Helpers ---

async function sendTwilioReply(to: string, body: string) {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        console.error("Missing Twilio Credentials");
        return;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append("From", TWILIO_PHONE_NUMBER);
    formData.append("To", to);
    formData.append("Body", body);

    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        });

        if (!response.ok) {
            console.error("Failed to send Twilio message:", await response.text());
        } else {
            console.log("Reply sent successfully");
        }
    } catch (error) {
        console.error("Error sending Twilio reply:", error);
    }
}
