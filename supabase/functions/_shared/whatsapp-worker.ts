import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { calculateSHA256 } from "./crypto.ts";
import { callGeminiTriage } from "./gemini.ts";

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
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Worker Logic for Twilio Messages
 */
export async function processWhatsAppMessage(message: NormalizedMessage): Promise<WorkerResult> {
    console.log(`Processing message type: ${message.type} from ${message.from}`);
    const phoneNumber = message.from;

    // Fetch or create session
    let { data: sessionData, error: sessionError } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

    if (!sessionData) {
        const { data: newSession, error: createError } = await supabase
            .from('whatsapp_sessions')
            .insert({ phone_number: phoneNumber })
            .select()
            .single();
        sessionData = newSession;
        if (createError || !sessionData) {
            console.error("Failed to create session:", createError);
            return { action: "ignore" };
        }
    }

    const history: { role: 'user' | 'model', content: string }[] = sessionData.context_history || [];
    let extractedData = sessionData.extracted_data || {};

    let userText = message.body || "";

    // Parse incoming message type
    if (message.type === "image" && message.mediaUrl) {
        console.log("Processing Image with SHIELD Protocol...");
        const authHeaders = new Headers();
        authHeaders.set("Authorization", "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`));
        const imageResponse = await fetch(message.mediaUrl, { headers: authHeaders });
        const imageBuffer = await imageResponse.arrayBuffer();
        const shieldHash = await calculateSHA256(imageBuffer);

        extractedData.evidence = { type: 'image', hash: shieldHash, url: message.mediaUrl };
        userText = "[El usuario ha enviado una imagen como evidencia con HASH SHA-256: " + shieldHash + "]";
    } else if (message.type === "location" && message.latitude && message.longitude) {
        console.log(`Location received: ${message.latitude}, ${message.longitude}`);
        extractedData.location = { lat: message.latitude, lng: message.longitude };
        userText = `[El usuario ha enviado su ubicación GPS: Lat ${message.latitude}, Lng ${message.longitude}]`;
    }

    if (!userText.trim()) return { action: "ignore" };

    // Update history
    history.push({ role: 'user', content: userText });

    // Call Gemini
    console.log("Calling Gemini LORE Engine...");
    let aiResponse = await callGeminiTriage(history);

    // Check if report is ready
    let reportReady = false;
    if (aiResponse.includes("[REPORT_READY]")) {
        reportReady = true;
        aiResponse = aiResponse.replace("[REPORT_READY]", "").trim();
        // Here we could trigger the PDF generation webhook or logic
        aiResponse += "\n\n📄 Tu reporte ha sido formalizado. Recibirás tu PDF de constancia con Audit ID en breve.";
    }

    history.push({ role: 'model', content: aiResponse });

    // Save session state
    await supabase
        .from('whatsapp_sessions')
        .update({
            context_history: history,
            extracted_data: extractedData,
            status: reportReady ? 'generating_report' : 'collecting_facts'
        })
        .eq('id', sessionData.id);

    // Send reply to user
    await sendTwilioReply(phoneNumber, aiResponse);

    return {
        action: "reply",
        data: {
            extractedData,
            reportReady
        }
    };
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
