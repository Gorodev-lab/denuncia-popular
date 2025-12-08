# White Paper: Denuncia Popular v2.1
**Democratizando el Acceso a la Justicia Administrativa mediante Inteligencia Artificial**

**Versión:** 2.1  
**Fecha:** Noviembre 2025  
**Autor:** Esoteria AI  
**Estado:** En Producción (Beta)

---

## 1. Resumen Ejecutivo

**Denuncia Popular** es una plataforma cívica diseñada para transformar la frustración ciudadana en acción legal efectiva. Utilizando **Inteligencia Artificial Generativa** y **Geolocalización de Alta Precisión**, la plataforma convierte reportes informales de servicios públicos deficientes (baches, luminarias, fugas) en denuncias administrativas formalmente estructuradas, fundamentadas legalmente y listas para su presentación ante la autoridad competente.

La versión 2.1 consolida una arquitectura robusta centrada en la privacidad del usuario, la precisión de los datos y la escalabilidad técnica.

---

## 2. Planteamiento del Problema

La brecha entre el ciudadano y la administración pública se perpetúa por tres barreras fundamentales:

1.  **Barrera Técnica-Legal:** El ciudadano promedio carece del conocimiento jurídico para redactar una denuncia que cumpla con los requisitos de forma y fondo (Art. 8 Constitucional y leyes administrativas locales). Los reportes informales en redes sociales carecen de validez jurídica.
2.  **Ambigüedad de Competencia:** Es difícil para el ciudadano distinguir si un problema es competencia municipal, estatal o federal, o a qué dependencia específica corresponde.
3.  **Fricción en el Proceso:** Los mecanismos oficiales suelen ser burocráticos, requieren presencialidad o utilizan plataformas digitales obsoletas y difíciles de usar.

---

## 3. Solución y Propuesta de Valor

**Denuncia Popular** actúa como un **Asistente Legal Inteligente** que:

*   **Entrevista** al usuario para recabar los hechos esenciales (tiempo, modo, lugar).
*   **Localiza** con precisión el incidente utilizando servicios de mapas líderes en la industria.
*   **Fundamenta** la petición analizando la normativa vigente mediante IA.
*   **Genera** un documento PDF inmutable, listo para imprimir o enviar digitalmente.

---

## 4. Arquitectura Técnica y Justificación de Decisiones

La arquitectura de Denuncia Popular ha sido diseñada priorizando la **resiliencia**, la **seguridad** y la **experiencia de usuario (UX)**. A continuación, justificamos cada decisión tecnológica crítica.

### 4.1 Frontend: React 19 + Vite
*   **Decisión:** Migración a React 19 y uso de Vite como bundler.
*   **Justificación:**
    *   **Rendimiento:** React 19 introduce mejoras significativas en el manejo del DOM y la concurrencia. Vite ofrece tiempos de carga casi instantáneos (HMR) durante el desarrollo y builds optimizados para producción.
    *   **Ecosistema:** La inmensa comunidad y librerías disponibles aseguran mantenibilidad a largo plazo.
    *   **UX Fluida:** El modelo SPA (Single Page Application) elimina las recargas de página, crucial para mantener el contexto del usuario durante el "Wizard" de denuncia.

### 4.2 Base de Datos y Backend: Supabase (PostgreSQL)
*   **Decisión:** Uso de Supabase como Backend-as-a-Service (BaaS).
*   **Justificación:**
    *   **Seguridad (RLS):** Las *Row Level Security Policies* de PostgreSQL permiten definir reglas de acceso granulares directamente en la base de datos. Esto asegura que, incluso si el frontend es comprometido, los datos permanecen seguros.
    *   **Autenticación Anónima:** Supabase Auth permite sesiones anónimas seguras, vitales para proteger la identidad de los denunciantes que temen represalias.
    *   **Escalabilidad:** Al estar basado en PostgreSQL, ofrece robustez empresarial y capacidad de consultas geoespaciales (PostGIS) nativas.

### 4.3 Servicios de Mapas: Google Maps Platform
*   **Decisión:** Migración de OpenStreetMap (Leaflet) a Google Maps API.
*   **Justificación:**
    *   **Calidad de Datos:** En Latinoamérica, la base de datos de direcciones y POIs (Puntos de Interés) de Google es superior a la de OSM. Esto es crítico para evitar denuncias desechadas por "ubicación imprecisa".
    *   **Geocoding Inverso:** La API de Google ofrece una conversión de coordenadas a direcciones mucho más precisa y legible para las autoridades.
    *   **Familiaridad:** La interfaz de Google Maps es el estándar de facto; su uso reduce la curva de aprendizaje para el usuario final.

### 4.4 Inteligencia Artificial: Google Gemini 1.5 Flash
*   **Decisión:** Implementación de Gemini 1.5 Flash a través del SDK `@google/genai`.
*   **Justificación:**
    *   **Ventana de Contexto:** La amplia ventana de contexto permite inyectar leyes y reglamentos completos en el prompt del sistema, mejorando la precisión de la fundamentación legal (RAG ligero).
    *   **Razonamiento:** Gemini demuestra capacidades superiores en tareas de razonamiento lógico y redacción formal en español comparado con modelos más pequeños.
    *   **Latencia y Costo:** La versión Flash ofrece el equilibrio ideal entre velocidad de respuesta (crítica para el chat en tiempo real) y costo operativo.

### 4.5 Almacenamiento: Supabase Storage
*   **Decisión:** Almacenamiento de evidencias (fotos/videos) en buckets privados.
*   **Justificación:** Integración nativa con la base de datos y políticas de seguridad unificadas. Permite generar URLs firmadas temporales para proteger la evidencia.

---

## 5. Flujo de Datos y Seguridad

1.  **Captura:** El usuario ingresa datos en el cliente (navegador). No se envían datos sensibles al servidor hasta la confirmación final.
2.  **Procesamiento IA:** Los textos se envían a Gemini para limpieza y estructuración. *Nota: Se anonimizan datos personales antes de enviar al LLM siempre que es posible.*
3.  **Persistencia:** Los datos se guardan en Supabase con RLS activado.
4.  **Generación Local:** El PDF final se genera en el navegador (Client-side) usando `jsPDF`. Esto garantiza que el documento final se crea en el dispositivo del usuario, reduciendo la carga del servidor y aumentando la privacidad.

---

## 6. Hoja de Ruta (Roadmap)

*   **Q4 2025:** Estabilización de Beta, integración completa de Google Maps y optimización de prompts legales.
*   **Q1 2026:** Lanzamiento de App Móvil (React Native) y Dashboard para ONGs.
*   **Q2 2026:** Integración con WhatsApp (Ver Anexo A).

---

## Anexo A: Estrategia de Integración con WhatsApp

### Objetivo
Habilitar la creación de denuncias directamente desde WhatsApp, aprovechando que es la plataforma de comunicación más utilizada en México, reduciendo la fricción de descargar una app o visitar una web.

### Estrategia Técnica

La implementación se realizará utilizando la **WhatsApp Business API** (a través de Meta o un BSP como Twilio), conectada a nuestro backend en Supabase y al cerebro de IA Gemini.

#### Fase 1: El "Bot" de Triaje (MVP)
*   **Funcionalidad:** Un bot simple que recibe la ubicación y una foto, y devuelve un enlace "mágico" (Magic Link) para completar la denuncia en la web.
*   **Flujo:**
    1.  Usuario envía ubicación actual por WhatsApp.
    2.  Usuario envía foto de la evidencia.
    3.  Bot responde: *"¡Gracias! Hemos guardado tu evidencia. Para formalizar tu denuncia legalmente, completa tus datos aquí: [enlace-con-token]"*.
    4.  El enlace abre la Web App con la ubicación y la foto ya precargadas (usando el ID de sesión).

#### Fase 2: Denuncia Conversacional Completa (Full AI)
*   **Funcionalidad:** Todo el proceso ocurre dentro del chat.
*   **Arquitectura:**
    *   **Entrada de Audio:** El usuario envía notas de voz narrando el problema.
    *   **STT (Speech-to-Text):** Usamos el modelo **Whisper** (o Gemini Multimodal) para transcribir el audio a texto.
    *   **Procesamiento:** Un agente de IA extrae las variables (Qué, Quién, Cuándo) del texto transcrito.
    *   **Confirmación:** El bot resume la denuncia y pide confirmación: *"Entendido. Denuncia por bache en Calle 5. ¿Es correcto?"*.
    *   **Entrega:** El bot genera el PDF y lo envía de regreso al usuario dentro del mismo chat.

### Requisitos de Infraestructura para WhatsApp
1.  **Webhook Server:** Un servidor (Node.js/Edge Function) para recibir los eventos de mensajes de WhatsApp.
2.  **Gestión de Estado:** Una tabla en Supabase `whatsapp_sessions` para mantener el estado de la conversación (ej. `WAITING_FOR_LOCATION`, `WAITING_FOR_PHOTO`).
3.  **Verificación de Negocio:** Meta requiere verificación de negocio para acceder a la API completa sin límites estrictos.

### Justificación de la Estrategia
WhatsApp elimina la barrera de entrada más alta: la interfaz de usuario desconocida. Al usar una interfaz conversacional familiar, democratizamos el acceso a segmentos de la población con menor alfabetización digital.
