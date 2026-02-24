# Estrategia de Optimización: Denuncia Popular v2.0

Este documento detalla la hoja de ruta estratégica para evolucionar la aplicación desde un prototipo funcional (MVP) hacia un producto robusto, seguro y escalable.

## Diagnóstico Actual
La aplicación cuenta con una base sólida:
- **Frontend:** React 19 + Vite (Rápido y moderno).
- **Mapas:** Google Maps API (Preciso y confiable).
- **Lógica Procedural:** LORE Engine (Bajo Gobernanza Esoteria).
- **Backend:** Supabase (Gobernanza de Datos).

**Áreas Críticas de Mejora:**
1.  **Gestión de Evidencia:** Actualmente solo se guardan los nombres de archivo, no los archivos reales.
2.  **Seguridad:** Faltan políticas de seguridad (RLS) en la base de datos.
3.  **Feedback de Usuario:** Faltan notificaciones visuales (Toasts) y estados de carga más refinados.

---

## Hoja de Ruta de Gobernanza

### Fase 1: Integridad Estructural y Seguridad (Inmediato)
*Objetivo: Garantizar la inmutabilidad de la evidencia y el aislamiento de datos.*

1.  **Implementación de Supabase Storage:**
    -   Crear un "Bucket" privado para almacenar fotos y documentos.
    -   Integrar la subida de archivos real en el frontend (`StepEvidence.tsx`).
    -   Generar URLs firmadas (temporales) para visualizar la evidencia en el PDF o dashboard.
2.  **Seguridad de Datos (RLS):**
    -   Configurar Row Level Security en PostgreSQL.
    -   Asegurar que solo el usuario (o admin) pueda ver sus denuncias (aunque actualmente es anónimo, preparar para futuro auth).
    -   Proteger las API Keys de Google Maps y Supabase (revisión de `.env`).

### Fase 2: Experiencia de Usuario (UX) Premium (Corto Plazo)
*Objetivo: Que la aplicación se sienta "viva" y profesional.*

1.  **Feedback Visual (Toasts):**
    -   Reemplazar `alert()` nativos por notificaciones "Toast" elegantes (ej. `sonner` o `react-hot-toast`).
    -   Notificar éxito al copiar folio, error al subir archivo, etc.
2.  **Skeletons y Loading States:**
    -   Mostrar "esqueletos" de carga mientras carga el mapa o la respuesta de la IA, en lugar de spinners simples.
3.  **Optimizaciones Móviles:**
    -   Asegurar que los botones tengan tamaño táctil adecuado (min 44px).
    -   Prevenir el zoom automático en inputs en iOS (font-size min 16px).

### Fase 3: Expansión de Capas de Gobernanza (Mediano Plazo)
*Objetivo: Recalibración estructural y multi-tenencia.*

1.  **Progressive Web App (PWA):**
    -   Configurar `vite-plugin-pwa`.
    -   Crear `manifest.json` y Service Workers.
    -   Permitir instalación en Home Screen y funcionamiento offline básico (guardar borrador localmente).
2.  **Dashboard de Autoridad (Mockup):**
    -   Crear una vista protegida `/admin` para visualizar las denuncias recibidas en un mapa de calor.

---

## Próximos Pasos Recomendados

Recomendamos iniciar inmediatamente con la **Fase 1**, ya que la falta de almacenamiento real de evidencia es un bloqueante funcional para el propósito legal de la aplicación.
