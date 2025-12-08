# White Paper: Denuncia Popular v2.2
**Democratizing Access to Administrative Justice through Artificial Intelligence**

**Version:** 2.2  
**Date:** December 2025  
**Author:** Esoteria AI  
**Status:** In Production (Public Beta)

---

## 1. Executive Summary

**Denuncia Popular** is a civic platform designed to transform citizen frustration into effective legal action. Using **Generative Artificial Intelligence** and **High-Precision Geolocation**, the platform converts informal reports of poor public services (potholes, streetlights, leaks) into formally structured administrative complaints, legally grounded and ready for submission to the competent authority.

Version 2.2 introduces significant improvements in **map experience**, **data security**, and **infrastructure as code**, consolidating a robust, secure, and scalable platform.

---

## 2. Problem Statement

The gap between citizens and public administration is perpetuated by three fundamental barriers:

1.  **Technical-Legal Barrier:** The average citizen lacks the legal knowledge to draft a complaint that meets form and substance requirements (Constitutional Art. 8 and local administrative laws).
2.  **Jurisdictional Ambiguity:** It is difficult for citizens to distinguish whether a problem is under municipal, state, or federal jurisdiction.
3.  **Process Friction:** Official mechanisms are often bureaucratic and difficult to use.

---

## 3. Solution and Value Proposition

**Denuncia Popular** acts as an **Intelligent Legal Assistant** that:

*   **Interviews** the user to gather essential facts.
*   **Locates** the incident precisely using multiple map layers.
*   **Substantiates** the petition by analyzing current regulations via AI.
*   **Generates** an immutable PDF document, ready to print or send digitally.
*   **Notifies** the user via email with the receipt attached.

---

## 4. Current Technical Architecture (v2.2)

### 4.1 Frontend: React 19 + Vite + TypeScript
*   **Stack:** React 19, Vite 6, TypeScript 5.8
*   **UI/UX:** Glassmorphic design with dark palette (zinc), fluid animations, and micro-interactions.
*   **Responsive:** Optimized for mobile and desktop.

### 4.2 Database and Backend: Supabase (PostgreSQL)
*   **BaaS:** Supabase as Backend-as-a-Service.
*   **Security (RLS):** Strict Row Level Security Policies:
    *   `SELECT`: Public (for the complaints map).
    *   `INSERT`: Authenticated users only.
    *   `UPDATE/DELETE`: Record owner only.
*   **Infrastructure as Code:** Schema and policies versioned in `supabase/schema.sql` and `supabase/policies.sql`.

### 4.3 Map Services: OpenStreetMap + Leaflet
*   **Decision (v2.2):** Return to OpenStreetMap (Leaflet/React-Leaflet) with multiple layers.
*   **Justification:**
    *   **Cost:** No usage fees, ideal for non-profit civic projects.
    *   **Flexibility:** Interchangeable layers without single-vendor dependency.
*   **Available Layers:**
    | Layer | Provider | Use Case |
    |-------|----------|----------|
    | Street | OpenStreetMap | Standard urban navigation |
    | Topography | OpenTopoMap | Reports in rural/mountainous areas |
    | Satellite | Esri World Imagery | Visual location verification |
    | Relief | Esri World Shaded Relief | Geographic context |

### 4.4 Map Interaction (New Features v2.2)
*   **Draggable Marker:** Users can drag the red pin to fine-tune location with precision.
*   **Search Autocomplete:** Real-time suggestions appear while typing (500ms debounce).
*   **Repositioned Controls:**
    *   Zoom: Bottom-left corner.
    *   Layers: Bottom-right corner.
*   **Ripple Effect:** Visual animation on map click.

### 4.5 Artificial Intelligence: Google Gemini 2.0 Flash
*   **Model:** `gemini-2.0-flash-exp` (via `@google/genai` SDK).
*   **Use Cases:**
    *   **Legal ChatBot:** Conversational assistant with "Legal Aid Assistant for Mexican Citizens" persona.
    *   **Auto-tagging:** Automatic tag generation to classify complaints.
    *   **Drafting:** Cleaning and formalizing complaint text.

### 4.6 Notifications: EmailJS
*   **Service:** EmailJS (serverless).
*   **Functionality:** Automatic email with generated PDF sent to user after successful registration.

### 4.7 Document Generation: jsPDF
*   **Client-Side Generation:** PDF is created in the user's browser, ensuring privacy and reducing server load.

---

## 5. Security and Best Practices (v2.2)

| Aspect | Implementation |
|--------|----------------|
| Secrets | Environment variables (`.env.local`), never hardcoded. |
| RLS | Strict PostgreSQL policies (see `supabase/policies.sql`). |
| Validation | User input validated on frontend and backend. |
| CORS | Configured in Supabase for authorized domains. |
| Evidence | Stored in private buckets with signed URLs. |

---

## 6. Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────▶│    Map      │────▶│   Gemini    │
│  (Browser)  │     │  (Leaflet)  │     │    (AI)     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   jsPDF     │◀────│  Supabase   │◀────│  Nominatim  │
│   (PDF)     │     │  (DB/RLS)   │     │ (Geocoding) │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│   EmailJS   │
│   (Email)   │
└─────────────┘
```

---

## 7. Roadmap

| Phase | Period | Objectives |
|-------|--------|------------|
| Public Beta | Q4 2025 | ✅ Stabilization, map layers, draggable marker, autocomplete. |
| Mobile | Q1 2026 | Native app (React Native), push notifications. |
| WhatsApp | Q2 2026 | Conversational bot for WhatsApp complaints. |
| NGO Dashboard | Q3 2026 | Admin panel for NGOs and local governments. |

---

## Annex A: WhatsApp Integration Strategy

*(No changes from v2.1)*

### Objective
Enable the creation of complaints directly from WhatsApp, leveraging it as the most used communication platform in Mexico.

### Phases
1.  **Triage Bot (MVP):** Receives location and photo, returns Magic Link.
2.  **Conversational Complaint (Full AI):** Complete process within chat with audio support (STT).

---

## Annex B: Infrastructure as Code

Version 2.2 introduces the `supabase/` directory with:

*   **`schema.sql`:** Complete definition of `feedback` and `denuncias` tables, including triggers.
*   **`policies.sql`:** RLS policies ready to apply in Supabase SQL Editor.

This enables:
*   **Versioning:** Database changes trackable in Git.
*   **Reproducibility:** Any developer can recreate the environment.
*   **Auditing:** History of security policy changes.

---

## Annex C: Security Verification

RLS verification script available at `tests/verify_rls.js`:

```bash
node tests/verify_rls.js
```

**Expected Output (Correct Policies):**
```
✅ Anonymous Read: Success
✅ Anonymous Write: Blocked (correct)
```

---

**Contact:** [https://denuncia-popular.vercel.app](https://denuncia-popular.vercel.app)  
**Repository:** [https://github.com/Gorodev-lab/denuncia-popular](https://github.com/Gorodev-lab/denuncia-popular)
