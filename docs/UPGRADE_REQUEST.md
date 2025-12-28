# Document 1: Production Upgrade Request (Formalization)

This document is mandatory to legitimize the `denuncia-popular-prod` environment according to section 7.2 of the SOP.

## Upgrade Request: Denuncia Popular

*   **Product Name:** Denuncia Popular
*   **Project ID:** `denuncia-popular-prod` (Proposed)
*   **Requested Upgrade Date:** Immediate (Regularization)

### Technical Specifications

*   **APIs Enabled:**
    *   Google Maps JavaScript API (Interactive maps)
    *   Geocoding API (Address search)
    *   Generative Language API (Gemini 2.0 Flash for legal analysis)
    *   Places API (Autocomplete)

*   **Expected Usage:**
    *   Public Beta Traffic (~500 requests/month estimated).

*   **Estimated Monthly Cost:**
    *   Low (Maps Free tier + marginal cost for Gemini Flash).

### Business Context

*   **Business Justification:**
    *   Civic platform in Public Beta v2.2. Requires stable infrastructure isolated from development to ensure availability to citizens.

*   **Safeguards:**
    *   Budget configured at $50 USD with alerts at 50% and 80%.
    *   API keys restricted by HTTP Referrer.

---

**Requester Signature:** __________________________
**Admin Signature (Esoteria):** __________________________
