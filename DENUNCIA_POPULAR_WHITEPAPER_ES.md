# White Paper: Denuncia Popular v3.0
## Infraestructura de Inteligencia y Gobernanza para la Justicia Ambiental

---

## 1. Resumen Ejecutivo
**Denuncia Popular** es una plataforma de vanguardia diseñada para cerrar la brecha entre el incidente ambiental y la acción legal efectiva. Operando sobre la infraestructura de **Esoteria Workbench**, la aplicación v3.0 trasciende la simple recolección de datos para convertirse en un motor de **Inteligencia Estructurada**. Mediante la integración de modelos de lenguaje avanzados, geolocalización de precisión y una arquitectura orientada a la gobernanza, transformamos la participación ciudadana en activos legales accionables y auditables.

---

## 2. El Problema: El Caos de la Información Ambiental
La justicia ambiental en México a menudo se ve obstaculizada por:
- **Datos No Estructurados:** Relatos ciudadanos vagos que carecen de peso jurídico.
- **Inconsistencia Geoespacial:** Ubicaciones imprecisas que dificultan la jurisdicción.
- **Riesgos de Seguridad:** Exposición de datos sensibles y falta de auditoría en el proceso de denuncia.

---

## 3. Arquitectura Técnica y Pilares de Innovación

### A. Capa de Interfaz y Experiencia de Usuario (UX)
Construida con **React 19** y **Tailwind CSS 4**, la aplicación ofrece una experiencia fluida y responsive, sustentada en principios de **Clean Code** y diseño **SOLID**:
- **Mobile-First Design:** Implementación de *bottom sheets* y gestos táctiles para una usabilidad nativa en dispositivos móviles.
- **Wizard Multi-paso Estructurado:** Guía al usuario a través de una captura de hechos lógica, minimizando la fatiga del informante. La interfaz de usuario está altamente modularizada en subcomponentes de responsabilidad única (Single Responsibility Principle) para garantizar escalabilidad extrema y mantenibilidad.

### B. Inteligencia Geoespacial Avanzada
La integración con **Google Maps API** ha sido elevada a un nivel analítico:
- **Clustering de Marcadores:** Visualización fluida de miles de reportes mediante algoritmos de agrupamiento de alto rendimiento.
- **Análisis de Hotspots (Puntos Críticos):** Motores SQL avanzados que identifican automáticamente áreas de alta densidad de delitos ambientales para la asignación eficiente de recursos.
- **Entrada Manual de Ubicación:** Permite descripciones locales precisas ("frente a x lugar") manteniendo coordenadas GPS exactas.

### C. Arquitectura de Microservicios de Inteligencia Artificial (GenAI)
Utilizando **Google Gemini**, el núcleo de inteligencia trascendió de un bloque monolítico a un ecosistema ágil de **microservicios especializados**:
- **Análisis Legal y Competencia (Analysis Service):** Determinación precisa de la jurisdicción (Municipal, Estatal, Federal) y clasificación semántica de denuncias.
- **Asistente Conversacional (Chat Service):** Entrevistador empático guiado por Chain-of-Thought para construir narraciones objetivas y detectar elementos probatorios faltantes en tiempo real.
- **Validación Normativa (Legal Service):** Integración con Google Search Grounding para validar la denuncia contra fuentes federales y leyes oficiales (como la LGEEPA).
- **Enriquecimiento Multimedia (Media Service):** Generación de representaciones satelitales de alta fidelidad vía Gemini 3 Pro y descripción estructurada del entorno geográfico.

---

## 4. Gobernanza de Datos y Seguridad
Siguiendo la filosofía de **Gobernanza Primero**, la v3.0 implementa:
- **Row Level Security (RLS) en Supabase:** Políticas estrictas que aseguran que solo los propietarios de la información (o autoridades autorizadas) puedan gestionar los datos.
- **Edge Functions para Comunicaciones Seguras:** El envío de correos y notificaciones se procesa en el servidor, protegiendo las API Keys y evitando el spam.
- **Audit Logging:** Cada interacción y cambio de estado en una denuncia es trazable y permanente.

---

## 5. DevOps y Aseguramiento de Calidad
La robustez del sistema está garantizada por un pipeline de ingeniería moderna:
- **CI/CD con GitHub Actions:** Despliegue automatizado y pruebas de integración continuas.
- **Pruebas End-to-End (E2E) Modulares con Playwright:** Simulaciones automatizadas del flujo de denuncia, refactorizadas en rutinas aisladas basadas en responsabilidad única para prevenir regresiones visuales y lógicas de manera ultra-eficiente.

---

## 6. Conclusión
**Denuncia Popular v3.0** no es solo una herramienta; es una infraestructura de gobernanza. Al estructurar el caos de los datos ambientales mediante IA modular y lógica geoespacial, empoderamos a la ciudadanía con un sistema que es, por diseño, transparente, seguro y altamente efectivo para la protección del medio ambiente.

---
**Esoteria Intelligence Infrastructure**
*Estructurando el futuro de la justicia ambiental.*
