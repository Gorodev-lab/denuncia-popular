# White Paper: Denuncia Popular v2.0
**Democratizing Access to Administrative Justice through Artificial Intelligence**

**Version:** 2.0
**Date:** November 2025
**Author:** Esoteria AI

---

## 1. Executive Summary

**Denuncia Popular v2.0** is a technological platform designed to empower citizens by facilitating the creation, management, and submission of formal complaints regarding administrative misconduct. Using advanced technologies such as **Generative Artificial Intelligence (Google Gemini)** and **Precision Geolocation (Google Maps)**, the platform eliminates the technical and legal barriers that traditionally prevent citizens from exercising their rights.

The system transforms an informal citizen report into a legally robust, substantiated document ready to be processed by competent authorities, all within an intuitive and accessible interface.

---

## 2. Problem Statement

In Mexico and much of Latin America, citizen participation in reporting irregularities (potholes, service failures, corruption, insecurity) is low due to three critical factors:

1.  **Legal Complexity:** The average citizen is unaware of the technical-legal language necessary to draft a formal complaint that will not be dismissed for "lack of elements."
2.  **Bureaucracy and Lack of Knowledge:** Often, it is unknown which specific authority (municipal, state, or federal) is responsible for each problem.
3.  **Fear and Mistrust:** Fear of retaliation and mistrust in the handling of personal data discourage nominal reporting.

As a result, thousands of incidents go unreported, perpetuating impunity and the deterioration of the urban environment.

---

## 3. The Solution: Denuncia Popular

Our solution acts as a **digital bridge** between the citizen and the authority. It is not just a complaint box; it is an **automated legal assistant**.

### Solution Pillars:
*   **Universal Accessibility:** A "Wizard" style interface that guides the user step-by-step without requiring prior knowledge.
*   **Legal Intelligence:** An AI engine that interviews the user, structures the facts, identifies jurisdiction (who is responsible), and legally substantiates the complaint.
*   **Geographic Precision:** Integration with Google Maps to locate incidents with exactitude, allowing manual descriptions ("in front of store X") for better local reference.
*   **Security and Anonymity:** Robust options to protect the complainant's identity through encryption and anonymous reporting modes.

---

## 4. Technical Architecture

The platform is built on a modern, scalable, and secure architecture, prioritizing Client-Side performance for a fluid experience.

### 4.1 Technology Stack
*   **Frontend:** React 19 + Vite (Performance and modularity).
*   **Language:** TypeScript (Type safety and maintainability).
*   **Styles:** Tailwind CSS (Responsive design and premium "Dark Mode" aesthetic).
*   **Maps:** Google Maps JavaScript API + Places API + Geocoding API.
*   **Artificial Intelligence:** Google Gemini 1.5 Flash (Large Language Models for legal analysis).
*   **Backend & Database:** Supabase (PostgreSQL) for data persistence and authentication.
*   **Document Generation:** jsPDF for dynamic creation of PDF files in the browser.

### 4.2 Data Flow Diagram
1.  **Input:** The user enters location and facts (voice or text).
2.  **Processing:**
    *   *Google Maps* validates and normalizes the location.
    *   *Gemini AI* analyzes the text, extracts entities, determines legal jurisdiction, and drafts the legal narrative.
3.  **Storage:** Structured data and evidence (photos/videos) are saved in Supabase.
4.  **Output:** A PDF is generated with a unique folio, digital signature (hash), and formal structure for download or submission.

---

## 5. Key Features

### 5.1 Intelligent Hybrid Geolocation
We migrated from OpenStreetMap to **Google Maps** to offer:
*   **Autocomplete:** Predictive address search.
*   **Reverse Geocoding:** Precise conversion of coordinates to postal addresses.
*   **Manual Editing:** A unique feature that allows the user to refine the automatic address with local references (e.g., "Between street 5 and 6"), crucial for areas with irregular nomenclature.

### 5.2 AI Legal Assistant (Chain of Thought)
The integrated chat is not a standard chatbot. It uses **Chain of Thought (CoT)** techniques to:
1.  **Interview:** Ask pertinent missing questions (When did it happen? Were there witnesses?).
2.  **Substantiate:** Search in real-time (Grounding) for laws and regulations applicable to the specific case.
3.  **Draft:** Generate a formal, objective text free of emotions, suitable for an administrative procedure.

### 5.3 Immutable Document Generation
The system generates a PDF file that meets the requirements of a formal written petition:
*   Header with competent authority.
*   Preamble with identification (or anonymity legend).
*   Narrative of facts ordered chronologically.
*   Legal substantiation.
*   Related attached evidence.
*   Digital signature and Verification Hash for integrity.

---

## 6. Roadmap

### Phase 1: Consolidation (Current)
*   Stabilization of the migration to Google Maps.
*   Optimization of prompts for the Gemini legal model.
*   Deployment on Vercel.

### Phase 2: Expansion (Q1 2026)
*   **Native Mobile App:** React Native for offline access and push notifications.
*   **Authority Dashboard:** Panel for governments to receive and manage complaints directly.
*   **Blockchain Integration:** Registration of folios on a blockchain to ensure that complaints cannot be "deleted" or altered by corrupt officials.

### Phase 3: Ecosystem (Q3 2026)
*   **Public API:** Allow other apps to integrate the complaint engine.
*   **Predictive Analysis:** Use aggregated data to generate heat maps of urban problems and predict red spots.

---

## 7. Conclusion

**Denuncia Popular v2.0** is not just a technological tool; it is an instrument of social change. By reducing the friction to report and elevating the technical quality of reports, we democratize access to administrative justice. We transform passive complaint into effective legal action, fostering a more participatory citizenry and more responsible governments.

---
*© 2025 Esoteria AI. All rights reserved.*
