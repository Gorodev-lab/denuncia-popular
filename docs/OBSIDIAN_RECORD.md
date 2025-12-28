# Project: Denuncia Popular (Prod)

- **Project Name:** denuncia-popular-prod
- **Project ID:** [Insert Real ID after creation]
- **Folder Location:** Esoteria Organization > Products
- **Environment:** Production
- **Owner:** Esoteria Core Admin

## APIs Enabled
- Generative Language API (Gemini)
- Maps JavaScript API
- Geocoding API
- Places API

## IAM & Access
- **Owner:** esoteria-admin@esoteriaai.com
- **Editor:** [Lead Developer Email]
- **Viewer:** [Junior Developer Email]
- **Service Accounts:**
    - `svc-denuncia-prod-gemini` (Backend processing)

## Credentials
- **OAuth Client:** `denuncia-popular-prod-oauth` (Managed in Shared-Infra)
- **API Keys:**
    - `denuncia-popular-prod-maps-key` (Restricted to https://denuncia-popular.vercel.app)

## Billing
- **Status:** Active
- **Budget:** $50/mo
- **Alerts:** 50%, 80%, 100% via Email
