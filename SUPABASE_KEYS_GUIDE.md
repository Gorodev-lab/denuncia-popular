# Cómo obtener la Service Role Key de Supabase

La **Service Role Key** es una llave especial que tiene permisos de "superadministrador". Permite saltarse las reglas de seguridad (RLS) para leer, escribir o borrar cualquier dato. **Mantenla secreta.**

## Pasos para obtenerla:

1.  **Inicia sesión en Supabase:**
    Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard) e inicia sesión con tu cuenta.

2.  **Selecciona tu Proyecto:**
    Haz clic en el proyecto `denuncia-popular` (o el nombre que le hayas dado).

3.  **Ve a la Configuración del Proyecto (Project Settings):**
    En la barra lateral izquierda, hasta abajo, busca el icono de un engranaje ⚙️ (**Settings**). Haz clic ahí.

4.  **Entra a la sección API:**
    En el menú que aparece dentro de Settings, haz clic en **API**.

5.  **Busca las llaves (Project API keys):**
    Verás un apartado llamado `Project API keys`. Ahí encontrarás dos llaves:
    *   `anon` `public`: Esta es la que ya tienes en tu archivo `.env`.
    *   `service_role` `secret`: **Esta es la que buscas.**

6.  **Copia la llave:**
    Haz clic en el botón de copiar (o en "Reveal" si está oculta) al lado de `service_role`.

## ⚠️ Advertencia Importante
*   **NUNCA** pongas esta llave en el código del frontend (archivos `.tsx`, `.ts` que se envían al navegador).
*   **NUNCA** la subas a GitHub en un archivo público.
*   Solo úsala en scripts del servidor (Node.js scripts, Edge Functions) o para tareas administrativas locales.
