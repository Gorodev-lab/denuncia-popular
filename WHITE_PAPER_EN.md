# White Paper: Denuncia Popular v2.1
**Democratizing Access to Administrative Justice through Artificial Intelligence**

**Version:** 2.1  
**Date:** November 2025  
**Author:** Esoteria AI  
**Status:** In Production (Beta)

---

## 1. Executive Summary

**Denuncia Popular** is a civic platform designed to transform citizen frustration into effective legal action. Using **Generative Artificial Intelligence** and **High-Precision Geolocation**, the platform converts informal reports of poor public services (potholes, streetlights, leaks) into formally structured administrative complaints, legally grounded and ready for submission to the competent authority.

Version 2.1 consolidates a robust architecture focused on user privacy, data accuracy, and technical scalability.

---

## 2. Problem Statement

The gap between citizens and public administration is perpetuated by three fundamental barriers:

1.  **Technical-Legal Barrier:** The average citizen lacks the legal knowledge to draft a complaint that meets form and substance requirements (Constitutional Art. 8 and local administrative laws). Informal reports on social media lack legal validity.
2.  **Jurisdictional Ambiguity:** It is difficult for citizens to distinguish whether a problem is under municipal, state, or federal jurisdiction, or which specific agency is responsible.
3.  **Process Friction:** Official mechanisms are often bureaucratic, require physical presence, or use obsolete and difficult-to-use digital platforms.

---

## 3. Solution and Value Proposition

**Denuncia Popular** acts as an **Intelligent Legal Assistant** that:

*   **Interviews** the user to gather essential facts (time, manner, place).
*   **Locates** the incident precisely using industry-leading mapping services.
*   **Substantiates** the petition by analyzing current regulations via AI.
*   **Generates** an immutable PDF document, ready to print or send digitally.

---

## 4. Technical Architecture and Decision Justification

The architecture of Denuncia Popular has been designed prioritizing **resilience**, **security**, and **user experience (UX)**. Below, we justify each critical technological decision.

### 4.1 Frontend: React 19 + Vite
*   **Decision:** Migration to React 19 and use of Vite as bundler.
*   **Justification:**
    *   **Performance:** React 19 introduces significant improvements in DOM handling and concurrency. Vite offers near-instant load times (HMR) during development and optimized builds for production.
    *   **Ecosystem:** The immense community and available libraries ensure long-term maintainability.
    *   **Fluid UX:** The SPA (Single Page Application) model eliminates page reloads, crucial for maintaining user context during the complaint "Wizard".

### 4.2 Database and Backend: Supabase (PostgreSQL)
*   **Decision:** Use of Supabase as Backend-as-a-Service (BaaS).
*   **Justification:**
    *   **Security (RLS):** PostgreSQL's *Row Level Security Policies* allow defining granular access rules directly in the database. This ensures that even if the frontend is compromised, data remains secure.
    *   **Anonymous Authentication:** Supabase Auth allows secure anonymous sessions, vital for protecting the identity of whistleblowers who fear retaliation.
    *   **Scalability:** Being based on PostgreSQL, it offers enterprise robustness and native geospatial query capabilities (PostGIS).

### 4.3 Map Services: Google Maps Platform
*   **Decision:** Migration from OpenStreetMap (Leaflet) to Google Maps API.
*   **Justification:**
    *   **Data Quality:** In Latin America, Google's database of addresses and POIs (Points of Interest) is superior to OSM. This is critical to avoid complaints being dismissed for "imprecise location".
    *   **Reverse Geocoding:** Google's API offers a much more precise and readable coordinate-to-address conversion for authorities.
    *   **Familiarity:** The Google Maps interface is the de facto standard; its use reduces the learning curve for the end user.

### 4.4 Artificial Intelligence: Google Gemini 1.5 Flash
*   **Decision:** Implementation of Gemini 1.5 Flash via the `@google/genai` SDK.
*   **Justification:**
    *   **Context Window:** The large context window allows injecting complete laws and regulations into the system prompt, improving the accuracy of legal substantiation (lightweight RAG).
    *   **Reasoning:** Gemini demonstrates superior capabilities in logical reasoning tasks and formal drafting in Spanish compared to smaller models.
    *   **Latency and Cost:** The Flash version offers the ideal balance between response speed (critical for real-time chat) and operating cost.

### 4.5 Storage: Supabase Storage
*   **Decision:** Storage of evidence (photos/videos) in private buckets.
*   **Justification:** Native integration with the database and unified security policies. Allows generating temporary signed URLs to protect evidence.

---

## 5. Data Flow and Security

1.  **Capture:** The user enters data on the client (browser). No sensitive data is sent to the server until final confirmation.
2.  **AI Processing:** Texts are sent to Gemini for cleaning and structuring. *Note: Personal data is anonymized before sending to the LLM whenever possible.*
3.  **Persistence:** Data is saved in Supabase with RLS enabled.
4.  **Local Generation:** The final PDF is generated in the browser (Client-side) using `jsPDF`. This ensures the final document is created on the user's device, reducing server load and increasing privacy.

---

## 6. Roadmap

*   **Q4 2025:** Beta stabilization, full Google Maps integration, and legal prompt optimization.
*   **Q1 2026:** Launch of Native Mobile App (React Native) and Dashboard for NGOs.
*   **Q2 2026:** WhatsApp Integration (See Annex A).

---

## Annex A: WhatsApp Integration Strategy

### Objective
Enable the creation of complaints directly from WhatsApp, leveraging it as the most used communication platform in Mexico, reducing the friction of downloading an app or visiting a website.

### Technical Strategy

Implementation will be done using the **WhatsApp Business API** (via Meta or a BSP like Twilio), connected to our Supabase backend and the Gemini AI brain.

#### Phase 1: Triage "Bot" (MVP)
*   **Functionality:** A simple bot that receives location and a photo, and returns a "Magic Link" to complete the complaint on the web.
*   **Flow:**
    1.  User sends current location via WhatsApp.
    2.  User sends photo of evidence.
    3.  Bot responds: *"Thanks! We've saved your evidence. To legally formalize your complaint, complete your details here: [link-with-token]"*.
    4.  The link opens the Web App with the location and photo pre-loaded (using session ID).

#### Phase 2: Full Conversational Complaint (Full AI)
*   **Functionality:** The entire process happens within the chat.
*   **Architecture:**
    *   **Audio Input:** User sends voice notes narrating the problem.
    *   **STT (Speech-to-Text):** We use the **Whisper** model (or Gemini Multimodal) to transcribe audio to text.
    *   **Processing:** An AI agent extracts variables (What, Who, When) from the transcribed text.
    *   **Confirmation:** The bot summarizes the complaint and asks for confirmation: *"Understood. Complaint for pothole on 5th Street. Is this correct?"*.
    *   **Delivery:** The bot generates the PDF and sends it back to the user within the same chat.

### Infrastructure Requirements for WhatsApp
1.  **Webhook Server:** A server (Node.js/Edge Function) to receive WhatsApp message events.
2.  **State Management:** A Supabase table `whatsapp_sessions` to maintain conversation state (e.g., `WAITING_FOR_LOCATION`, `WAITING_FOR_PHOTO`).
3.  **Business Verification:** Meta requires business verification to access the full API without strict limits.

### Strategy Justification
WhatsApp removes the highest barrier to entry: the unfamiliar user interface. By using a familiar conversational interface, we democratize access for segments of the population with lower digital literacy.
