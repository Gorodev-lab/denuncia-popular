import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { processWhatsAppMessage } from "../_shared/whatsapp-worker.ts";

console.log("Pub/Sub Subscriber Function Initialized");

/**
 * Pub/Sub Subscriber Function
 * This function is triggered by a Google Cloud Pub/Sub Push Subscription.
 * It expects a JSON payload structured by GCP Pub/Sub:
 * {
 *   "message": {
 *     "attributes": { ... },
 *     "data": "SGVsbG8gV29ybGQ=" // Base64 encoded
 *     "messageId": "..."
 *   },
 *   "subscription": "..."
 * }
 */
serve(async (req) => {
    try {
        const method = req.method;
        if (method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        const body = await req.json();
        const pubSubMessage = body.message;

        if (!pubSubMessage || !pubSubMessage.data) {
            console.error("Invalid Pub/Sub message format", body);
            // Return 400 to indicate bad request, but in Pub/Sub context, 
            // strict 200/204 is often safer to avoid retry loops for bad data.
            // We'll return 200 to ack and drop bad data.
            return new Response("Bad Request: Missing message.data", { status: 200 });
        }

        // 1. Decode Base64 Data
        const decodedData = atob(pubSubMessage.data);
        const payload = JSON.parse(decodedData);

        console.log(`Received task for messageSid: ${payload.messageSid}`);

        // 2. Process with Worker Logic
        const result = await processWhatsAppMessage(payload);

        console.log("Worker execution result:", result);

        // 3. Acknowledge Receipt
        // Returning 200 OK tells Pub/Sub "Message handled, delete it from queue".
        return new Response("Success", { status: 200 });

    } catch (error) {
        console.error("Error processing Pub/Sub message:", error);

        // DECISION: Should we retry?
        // If it's a transient error (e.g., Gemini API timeout), we might want to return 500 to trigger Pub/Sub retry.
        // If it's a logic error, we should return 200 to avoid clogging the queue.
        // For this MVP, we log and return 200 to be safe (Fail Open).
        return new Response("Internal Server Error (Handled)", { status: 200 });
    }
});
