import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Validates the X-Hub-Signature-256 header from WhatsApp.
 * Uses crypto.subtle for secure HMAC verification.
 */
export async function verifySignature(
    secret: string,
    signature: string,
    payload: string,
): Promise<boolean> {
    if (!signature) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"],
    );

    const signatureBuffer = hexStringToUint8Array(signature.replace("sha256=", ""));
    const payloadBuffer = encoder.encode(payload);

    return await crypto.subtle.verify(
        "HMAC",
        key,
        signatureBuffer,
        payloadBuffer,
    );
}

/**
 * Calculates the SHA-256 hash of a file or buffer.
 * Used for the SHIELD protocol (evidence immutability).
 */
export async function calculateSHA256(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return uint8ArrayToHexString(new Uint8Array(hashBuffer));
}

// --- Helpers ---

function hexStringToUint8Array(hexString: string): Uint8Array {
    if (hexString.length % 2 !== 0) {
        throw new Error("Invalid hex string");
    }
    const arrayBuffer = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        const byteValue = parseInt(hexString.substring(i, i + 2), 16);
        arrayBuffer[i / 2] = byteValue;
    }
    return arrayBuffer;
}

function uint8ArrayToHexString(uint8Array: Uint8Array): string {
    return Array.from(uint8Array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Validates the X-Twilio-Signature header.
 * Algo: HMAC-SHA1(AuthToken, URL + SortedParams)
 */
export async function validateTwilioSignature(
    authToken: string,
    url: string,
    params: Record<string, string>,
    signature: string
): Promise<boolean> {
    // 1. Sort params
    const sortedKeys = Object.keys(params).sort();

    // 2. Construct data string
    let data = url;
    for (const key of sortedKeys) {
        data += `${key}${params[key]}`;
    }

    // 3. Sign
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(authToken),
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(data)
    );

    // 4. Base64 encode
    const calculatedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    return calculatedSignature === signature;
}
