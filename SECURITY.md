# Security Policy: Denuncia Popular

## 1. Credential Management (API Keys)

Following the Esoteria AI SOP, all API keys must have strict restrictions before being deployed.

### 1.1 Google Maps API Key (`VITE_GOOGLE_MAPS_API_KEY`)
This key is exposed in the client (browser), so it **MUST** be restricted by **HTTP Referrer**.

*   **Prod Environment:**
    *   Name: `denuncia-popular-prod-maps-key`
    *   Restriction: `https://denuncia-popular.vercel.app/*`
*   **Dev Environment:**
    *   Name: `denuncia-popular-dev-maps-key`
    *   Restriction: `https://denuncia-popular-*.vercel.app/*` (Allows deploy previews)
*   **Local Environment:**
    *   Name: `denuncia-popular-sandbox-maps-key`
    *   Restriction: `http://localhost:5173/*`

### 1.2 Gemini API Key (`VITE_GEMINI_API_KEY`)
This key allows consumption of AI tokens.

*   **Ideal Restriction:** Exclusive use from Backend (Service Account).
*   **Current Restriction (Frontend):** If used from the client (via `@google/genai`), usage must be monitored in the GCP console and strict quotas established to prevent abuse.
*   **Required Action:** Migrate the Gemini call to a Supabase Edge Function to hide the key (See Roadmap Phase 2).

## 2. Environment Variables

*   Never commit `.env` or `.env.local` files.
*   Use `.env.local.example` as a template for new developers.
*   In Vercel, separate `Production` and `Preview` keys to ensure test data does not contaminate the production environment.

## 3. Incident Reporting

If an exposed key is detected in the repository:
1.  **Revoke** the key immediately in GCP Console.
2.  **Rotate** the key by generating a new one.
3.  **Update** Vercel with the new key.
4.  Notify `security@esoteriaai.com`.
