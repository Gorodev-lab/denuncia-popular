# Guía: Corrección de Restricciones de Google Cloud

Si ves un error de "RefererNotAllowedMapError" o el mapa no carga en producción, sigue estos pasos:

1.  Ve a [Google Cloud Console - Credentials](https://console.cloud.google.com/google/maps-apis/credentials).
2.  Busca tu API Key: `AIzaSyDkYPSf1SUQDHfLaqsL_kHkn3YNyYEfjLk`.
3.  En **Key restrictions**, selecciona **Websites**.
4.  En **Website restrictions**, añade los siguientes items:
    - `http://localhost:5173/*`
    - `http://localhost:5174/*`
    - `https://denuncia-popular.vercel.app/*`
    - `https://*.vercel.app/*`
5.  En **API restrictions**, selecciona **Restrict key**.
6.  Selecciona solo estas APIs:
    - *Maps JavaScript API*
    - *Places API*
    - *Geocoding API*
7.  Presiona **Save**.

Nota: Los cambios pueden tardar hasta 5 minutos en propagarse.
