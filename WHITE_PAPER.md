# White Paper: Denuncia Popular v2.2
**Democratizando el Acceso a la Justicia Administrativa mediante Inteligencia Artificial**

**Versión:** 2.2  
**Fecha:** Diciembre 2025  
**Autor:** Esoteria AI  
**Estado:** En Producción (Beta Pública) - **Migrando a Esoteria AI Ecosystem**

> [!IMPORTANT]
> **Nota de Migración (Dic 2025):** Este proyecto se encuentra en proceso de migración a la infraestructura gobernada de Esoteria AI. Ver `docs/MIGRATION_EXECUTION_GUIDE.md` para detalles de la nueva arquitectura de despliegue.

---

## 1. Resumen Ejecutivo

**Denuncia Popular** es una plataforma cívica diseñada para transformar la frustración ciudadana en acción legal efectiva. Utilizando **Inteligencia Artificial Generativa** y **Geolocalización de Alta Precisión**, la plataforma convierte reportes informales de servicios públicos deficientes (baches, luminarias, fugas) en denuncias administrativas formalmente estructuradas, fundamentadas legalmente y listas para su presentación ante la autoridad competente.

La versión 2.2 introduce mejoras significativas en la **experiencia del mapa**, **seguridad de datos** e **infraestructura como código**, consolidando una plataforma robusta, segura y escalable.

---

## 2. Planteamiento del Problema

La brecha entre el ciudadano y la administración pública se perpetúa por tres barreras fundamentales:

1.  **Barrera Técnica-Legal:** El ciudadano promedio carece del conocimiento jurídico para redactar una denuncia que cumpla con los requisitos de forma y fondo (Art. 8 Constitucional y leyes administrativas locales).
2.  **Ambigüedad de Competencia:** Es difícil para el ciudadano distinguir si un problema es competencia municipal, estatal o federal.
3.  **Fricción en el Proceso:** Los mecanismos oficiales suelen ser burocráticos y difíciles de usar.

---

## 3. Solución y Propuesta de Valor

**Denuncia Popular** actúa como un **Asistente Legal Inteligente** que:

*   **Entrevista** al usuario para recabar los hechos esenciales.
*   **Localiza** con precisión el incidente utilizando múltiples capas de mapas.
*   **Fundamenta** la petición analizando la normativa vigente mediante IA.
*   **Genera** un documento PDF inmutable, listo para imprimir o enviar digitalmente.
*   **Notifica** al usuario por correo electrónico con el comprobante adjunto.

---

## 4. Arquitectura Técnica Actual (v2.2)

### 4.1 Frontend: React 19 + Vite + TypeScript
*   **Stack:** React 19, Vite 6, TypeScript 5.8
*   **UI/UX:** Diseño glassmórfico con paleta oscura (zinc), animaciones fluidas y micro-interacciones.
*   **Responsivo:** Optimizado para móvil y escritorio.

### 4.2 Base de Datos y Backend: Supabase (PostgreSQL)
*   **BaaS:** Supabase como Backend-as-a-Service.
*   **Seguridad (RLS):** Políticas de Seguridad a Nivel de Fila (Row Level Security) estrictas:
    *   `SELECT`: Público (para el mapa de denuncias).
    *   `INSERT`: Solo usuarios autenticados.
    *   `UPDATE/DELETE`: Solo el propietario del registro.
*   **Infraestructura como Código:** Esquema y políticas versionados en `supabase/schema.sql` y `supabase/policies.sql`.

### 4.3 Servicios de Mapas: OpenStreetMap + Leaflet
*   **Decisión (v2.2):** Retorno a OpenStreetMap (Leaflet/React-Leaflet) con capas múltiples.
*   **Justificación:**
    *   **Costo:** Sin costos por uso, ideal para proyectos cívicos sin fines de lucro.
    *   **Flexibilidad:** Capas intercambiables sin dependencia de un solo proveedor.
*   **Capas Disponibles:**
    | Capa | Proveedor | Uso |
    |------|-----------|-----|
    | Calle | OpenStreetMap | Navegación urbana estándar |
    | Topografía | OpenTopoMap | Denuncias en áreas rurales/montañosas |
    | Satélite | Esri World Imagery | Verificación visual de ubicaciones |
    | Relieve | Esri World Shaded Relief | Contexto geográfico |

### 4.4 Interacción del Mapa (Nuevas Funcionalidades v2.2)
*   **Marcador Arrastrable:** El usuario puede arrastrar el pin rojo para ajustar la ubicación con precisión milimétrica.
*   **Autocompletado de Búsqueda:** Al escribir en la barra de búsqueda, se muestran sugerencias en tiempo real (con debounce de 500ms).
*   **Controles Reubicados:**
    *   Zoom: Esquina inferior izquierda.
    *   Capas: Esquina inferior derecha.
*   **Efecto Ripple:** Animación visual al hacer clic en el mapa.

### 4.5 Inteligencia Artificial: Google Gemini 2.0 Flash
*   **Modelo:** `gemini-2.0-flash-exp` (vía `@google/genai` SDK).
*   **Casos de Uso:**
    *   **ChatBot Legal:** Asistente conversacional con persona de "Asistente Legal para Ciudadanos Mexicanos".
    *   **Auto-etiquetado:** Generación automática de etiquetas para clasificar denuncias.
    *   **Redacción:** Limpieza y formalización del texto de la denuncia.

### 4.6 Notificaciones: EmailJS
*   **Servicio:** EmailJS (sin servidor propio).
*   **Funcionalidad:** Envío automático del PDF generado al correo del usuario tras el registro exitoso.

### 4.7 Generación de Documentos: jsPDF
*   **Generación Client-Side:** El PDF se crea en el navegador del usuario, asegurando privacidad y reduciendo carga del servidor.

---

## 5. Seguridad y Mejores Prácticas (v2.2)

| Aspecto | Implementación |
|---------|----------------|
| Secretos | Variables de entorno (`.env.local`), nunca hardcodeados. |
| RLS | Políticas estrictas en PostgreSQL (ver `supabase/policies.sql`). |
| Validación | Entrada del usuario validada en frontend y backend. |
| CORS | Configurado en Supabase para dominios autorizados. |
| Evidencia | Almacenada en buckets privados con URLs firmadas. |

---

## 6. Flujo de Datos

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuario   │────▶│   Mapa      │────▶│   Gemini    │
│  (Browser)  │     │ (Leaflet)   │     │   (IA)      │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   jsPDF     │◀────│  Supabase   │◀────│ Nominatim   │
│   (PDF)     │     │  (DB/RLS)   │     │ (Geocoding) │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│   EmailJS   │
│   (Correo)  │
└─────────────┘
```

---

## 7. Hoja de Ruta (Roadmap)

| Fase | Periodo | Objetivos |
|------|---------|-----------|
| Beta Pública | Q4 2025 | ✅ Estabilización, capas de mapa, marcador arrastrable, autocompletado. |
| Móvil | Q1 2026 | App nativa (React Native), notificaciones push. |
| WhatsApp | Q2 2026 | Bot conversacional para denuncias vía WhatsApp. |
| Dashboard ONG | Q3 2026 | Panel de administración para ONGs y gobiernos locales. |

---

## Anexo A: Estrategia de Integración con WhatsApp

*(Sin cambios respecto a v2.1)*

### Objetivo
Habilitar la creación de denuncias directamente desde WhatsApp, aprovechando que es la plataforma de comunicación más utilizada en México.

### Fases
1.  **Bot de Triaje (MVP):** Recibe ubicación y foto, devuelve Magic Link.
2.  **Denuncia Conversacional (Full AI):** Proceso completo dentro del chat con soporte de audio (STT).

---

## Anexo B: Infraestructura como Código

La versión 2.2 introduce el directorio `supabase/` con:

*   **`schema.sql`:** Definición completa de las tablas `feedback` y `denuncias`, incluyendo triggers.
*   **`policies.sql`:** Políticas RLS listas para aplicar en Supabase SQL Editor.

Esto permite:
*   **Versionado:** Cambios en la base de datos rastreables en Git.
*   **Reproducibilidad:** Cualquier desarrollador puede recrear el entorno.
*   **Auditoría:** Historial de cambios en políticas de seguridad.

---

## Anexo C: Verificación de Seguridad

Script de verificación RLS disponible en `tests/verify_rls.js`:

```bash
node tests/verify_rls.js
```

**Salida Esperada (Políticas Correctas):**
```
✅ Lectura Anónima: Éxito
✅ Escritura Anónima: Bloqueado (correcto)
```

---

**Contacto:** [https://denuncia-popular.vercel.app](https://denuncia-popular.vercel.app)  
**Repositorio:** [https://github.com/Gorodev-lab/denuncia-popular](https://github.com/Gorodev-lab/denuncia-popular)
