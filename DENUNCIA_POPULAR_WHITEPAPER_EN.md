# White Paper: Denuncia Popular v3.0
## Intelligence Infrastructure and Governance for Environmental Justice

---

## 1. Executive Summary
**Denuncia Popular** is a cutting-edge platform designed to bridge the gap between environmental incidents and effective legal action. Running on the **Esoteria Workbench** infrastructure, version 3.0 transcends simple data collection to become a **Structured Intelligence** engine. By integrating advanced language models, precision geolocation, and a governance-oriented architecture, we transform citizen participation into actionable and auditable legal assets.

---

## 2. The Problem: Environmental Information Chaos
Environmental justice in Mexico is often hampered by:
- **Unstructured Data:** Vague citizen accounts that lack legal weight.
- **Geospatial Inconsistency:** Imprecise locations that complicate jurisdiction.
- **Security Risks:** Exposure of sensitive data and a lack of auditing in the reporting process.

---

## 3. Technical Architecture and Innovation Pillars

### A. Interface Layer and User Experience (UX)
Built with **React 19** and **Tailwind CSS 4**, the application offers a fluid and responsive experience, adhering strictly to **Clean Code** and **SOLID** design principles:
- **Mobile-First Design:** Implementation of bottom sheets and touch gestures for native usability on mobile devices.
- **Structured Multi-step Wizard:** Guides the user through logical fact-gathering, minimizing informant fatigue. The UI is highly modularized into single-responsibility subcomponents (SRP) to guarantee extreme scalability and maintainability.

### B. Advanced Geospatial Intelligence
The integration with the **Google Maps API** has been elevated to an analytical level:
- **Marker Clustering:** Smooth visualization of thousands of reports using high-performance clustering algorithms.
- **Hotspot Analysis:** Advanced SQL engines that automatically identify high-density areas of environmental crimes for efficient resource allocation.
- **Manual Location Entry:** Allows for precise local descriptions ("in front of x place") while maintaining exact GPS coordinates.

### C. Artificial Intelligence Microservices Architecture (GenAI)
Utilizing **Google Gemini**, the intelligence core has transcended from a monolithic block to an agile ecosystem of **specialized microservices**:
- **Legal & Competency Analysis (Analysis Service):** Accurate determination of jurisdiction (Municipal, State, Federal) and automated semantic classification of reports.
- **Conversational Assistant (Chat Service):** An empathetic interviewer guided by Chain-of-Thought reasoning to build objective narratives and detect missing evidentiary elements in real-time.
- **Regulatory Validation (Legal Service):** Integration with Google Search Grounding to validate reports against federal sources and official Mexican laws (such as LGEEPA).
- **Multimedia Enrichment (Media Service):** Generation of high-fidelity satellite imagery via Gemini 3 Pro and structured geographical context descriptions.

---

## 4. Data Governance and Security
Following the **Governance-First** philosophy, v3.0 implements:
- **Row Level Security (RLS) in Supabase:** Strict policies that ensure only information owners (or authorized authorities) can manage the data.
- **Edge Functions for Secure Communications:** Email and notifications are processed on the server, protecting API Keys and preventing spam.
- **Audit Logging:** Every interaction and status change in a report is traceable and permanent.

---

## 5. DevOps and Quality Assurance
System robustness is guaranteed by a modern engineering pipeline:
- **CI/CD with GitHub Actions:** Automated deployment and continuous integration testing.
- **Modular End-to-End (E2E) Testing with Playwright:** Automated simulations of the reporting flow, refactored into isolated routines based on strict single-responsibility patterns to prevent visual and logic regressions ultra-efficiently.

---

## 6. Conclusion
**Denuncia Popular v3.0** is not just a tool; it is a governance infrastructure. By structuring the chaos of environmental data through modular AI and geospatial logic, we empower citizens with a system that is, by design, transparent, secure, and highly effective for environmental protection.

---
**Esoteria Intelligence Infrastructure**
*Structuring the future of environmental justice.*
