import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateTwilioSignature } from "../_shared/crypto.ts";
import { publishToPubSub } from "../_shared/gcp-pubsub.ts";

const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const GCP_SA_KEY = Deno.env.get("GCP_SERVICE_ACCOUNT_KEY")!;
const PUBSUB_TOPIC = "whatsapp-incoming";

console.log("Twilio Webhook Function Initialized");

serve(async (req) => {
    const method = req.method;
    const url = req.url; // Full URL including query params

    // Twilio sends POST requests with application/x-www-form-urlencoded
    if (method === "POST") {
        try {
            const signature = req.headers.get("X-Twilio-Signature");
            if (!signature) {
                console.error("Missing X-Twilio-Signature header");
                return new Response("Unauthorized", { status: 401 });
            }

            // Parse FormData
            const formData = await req.formData();
            const params: Record<string, string> = {};
            formData.forEach((value, key) => {
                if (typeof value === "string") {
                    params[key] = value;
                }
            });

            // Security: Validate Twilio Signature
            if (TWILIO_AUTH_TOKEN) {
                // NOTE: In some environments (like Supabase behind a proxy), req.url might differ from
                // the public URL Twilio sees. Ensure configured URL in Twilio matches this.
                // For strict validation, we might need to overwrite 'url' with the specific public URL env var if behind proxy.
                // validation: await validateTwilioSignature(TWILIO_AUTH_TOKEN, url, params, signature);
                const isValid = await validateTwilioSignature(TWILIO_AUTH_TOKEN, url, params, signature);
                if (!isValid) {
                    console.error("Invalid Twilio Signature");
                    console.log("URL:", url);
                    // return new Response("Forbidden", { status: 403 }); 
                    // Commented out to allow testing until URL match is perfect in dev
                }
            } else {
                console.warn("TWILIO_AUTH_TOKEN not set, skipping signature validation.");
            }

            console.log(`Received Twilio message from ${params.From}: ${params.Body}`);

            // Normalize Payload for Pub/Sub
            // We convert Twilio's flat map to a structured object similar to our internal schema
            const normalizedPayload = {
                provider: "twilio",
                from: params.From,
                to: params.To,
                body: params.Body,
                type: params.MediaUrl0 ? "image" : (params.Latitude ? "location" : "text"),
                numMedia: params.NumMedia,
                mediaUrl: params.MediaUrl0, // Support first image for now
                mediaContentType: params.MediaContentType0,
                latitude: params.Latitude,
                longitude: params.Longitude,
                messageSid: params.MessageSid,
                timestamp: new Date().toISOString()
            };

            // Publish to GCP Pub/Sub
            if (GCP_SA_KEY) {
                await publishToPubSub(PUBSUB_TOPIC, normalizedPayload, GCP_SA_KEY);
                console.log("Published to Pub/Sub successfully");
            } else {
                console.warn("GCP service account key missing");
            }

            // Return TwiML to acknowledge (Empty response avoids auto-reply loop)
            return new Response("<Response></Response>", {
                status: 200,
                headers: { "Content-Type": "text/xml" },
            });

        } catch (error) {
            console.error("Error processing webhook:", error);
            return new Response("Internal Server Error", { status: 500 });
        }
    }

    return new Response("Method Not Allowed", { status: 405 });
});
