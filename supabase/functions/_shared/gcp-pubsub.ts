/**
 * Publishes a message to a Google Cloud Pub/Sub topic using the REST API.
 * Requires a Service Account JSON key stored in Supabase Secrets.
 */
export async function publishToPubSub(
    topicName: string,
    data: Record<string, any>,
    serviceAccountKey: string, // JSON string of the service account key
) {
    try {
        const credentials = JSON.parse(serviceAccountKey);
        const clientEmail = credentials.client_email;
        const privateKey = credentials.private_key;
        const projectId = credentials.project_id;

        // Create JWT for authentication
        const scope = "https://www.googleapis.com/auth/pubsub";
        const token = await createJwt(clientEmail, privateKey, scope);

        const url = `https://pubsub.googleapis.com/v1/projects/${projectId}/topics/${topicName}:publish`;

        const messageData = btoa(JSON.stringify(data));

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: [
                    {
                        data: messageData,
                        attributes: {
                            source: "whatsapp-webhook",
                            timestamp: new Date().toISOString(),
                        },
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Pub/Sub Error ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to publish to Pub/Sub:", error);
        throw error;
    }
}


// --- JWT Helper for Service Account Authentication (Simplified for Deno) ---
// Note: In a real production setup, consider using a library like 'jose' or 'djwt'
// if available in Supabase Edge Runtime, but this native implementation is dependency-free.

async function createJwt(clientEmail: string, privateKey: string, scope: string): Promise<string> {
    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const claim = {
        iss: clientEmail,
        scope: scope,
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now,
    };

    const encodedHeader = btoaUrl(JSON.stringify(header));
    const encodedClaim = btoaUrl(JSON.stringify(claim));

    const data = `${encodedHeader}.${encodedClaim}`;

    const key = await importPrivateKey(privateKey);
    const signature = await crypto.subtle.sign(
        { name: "RSASSA-PKCS1-v1_5" },
        key,
        new TextEncoder().encode(data)
    );

    const encodedSignature = btoaUrl(String.fromCharCode(...new Uint8Array(signature)));

    const jwt = `${data}.${encodedSignature}`;

    // Exchange JWT for Access Token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
}

function btoaUrl(str: string): string {
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
    // Configures PEM to binary
    const binaryDerString = atob(
        pem.replace(/-----BEGIN PRIVATE KEY-----/, "")
            .replace(/-----END PRIVATE KEY-----/, "")
            .replace(/\n/g, "")
            .replace(/\s/g, "")
    );

    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    return await crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"],
    );
}
