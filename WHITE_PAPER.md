# White Paper: Denuncia Popular v2.0
**Democratizando el Acceso a la Justicia Administrativa mediante Inteligencia Artificial**

**Versión:** 2.0  
**Fecha:** Noviembre 2025  
**Autor:** Esoteria AI

---

## 1. Resumen Ejecutivo

**Denuncia Popular v2.0** es una plataforma tecnológica diseñada para empoderar a la ciudadanía, facilitando la creación, gestión y presentación de denuncias formales por faltas administrativas. Utilizando tecnologías avanzadas como **Inteligencia Artificial Generativa (Google Gemini)** y **Geolocalización de Precisión (Google Maps)**, la plataforma elimina las barreras técnicas y legales que tradicionalmente impiden que los ciudadanos ejerzan sus derechos.

El sistema transforma un reporte ciudadano informal en un documento legalmente robusto, fundamentado y listo para ser procesado por las autoridades competentes, todo ello bajo una interfaz intuitiva y accesible.

---

## 2. Planteamiento del Problema

En México y gran parte de Latinoamérica, la participación ciudadana en la denuncia de irregularidades (baches, fallas de servicios, corrupción, inseguridad) es baja debido a tres factores críticos:

1.  **Complejidad Legal:** El ciudadano promedio desconoce el lenguaje técnico-jurídico necesario para redactar una denuncia formal que no sea desestimada por "falta de elementos".
2.  **Burocracia y Desconocimiento:** A menudo no se sabe a qué autoridad específica (municipal, estatal o federal) corresponde cada problema.
3.  **Miedo y Desconfianza:** El temor a represalias y la desconfianza en el manejo de datos personales desincentivan la denuncia nominal.

Como resultado, miles de incidentes quedan sin reportar, perpetuando la impunidad y el deterioro del entorno urbano.

---

## 3. La Solución: Denuncia Popular

Nuestra solución actúa como un **puente digital** entre el ciudadano y la autoridad. No es solo un buzón de quejas; es un **asistente legal automatizado**.

### Pilares de la Solución:
*   **Accesibilidad Universal:** Interfaz tipo "Wizard" que guía al usuario paso a paso sin requerir conocimientos previos.
*   **Inteligencia Legal:** Un motor de IA que entrevista al usuario, estructura los hechos, identifica la competencia (quién es responsable) y fundamenta legalmente la denuncia.
*   **Precisión Geográfica:** Integración con Google Maps para ubicar incidentes con exactitud, permitiendo descripciones manuales ("frente a la tienda X") para mayor referencia local.
*   **Seguridad y Anonimato:** Opciones robustas para proteger la identidad del denunciante mediante encriptación y modos de denuncia anónima.

---

## 4. Arquitectura Técnica

La plataforma está construida sobre una arquitectura moderna, escalable y segura, priorizando el rendimiento en el lado del cliente (Client-Side) para una experiencia fluida.

### 4.1 Stack Tecnológico
*   **Frontend:** React 19 + Vite (Rendimiento y modularidad).
*   **Lenguaje:** TypeScript (Seguridad de tipos y mantenibilidad).
*   **Estilos:** Tailwind CSS (Diseño responsivo y estética "Dark Mode" premium).
*   **Mapas:** Google Maps JavaScript API + Places API + Geocoding API.
*   **Inteligencia Artificial:** Google Gemini 1.5 Flash (Modelos de lenguaje grandes para análisis legal).
*   **Backend & Base de Datos:** Supabase (PostgreSQL) para persistencia de datos y autenticación.
*   **Generación de Documentos:** jsPDF para la creación dinámica de archivos PDF en el navegador.

### 4.2 Diagrama de Flujo de Datos
1.  **Input:** El usuario ingresa ubicación y hechos (voz o texto).
2.  **Procesamiento:**
    *   *Google Maps* valida y normaliza la ubicación.
    *   *Gemini AI* analiza el texto, extrae entidades, determina la competencia legal y redacta la narrativa jurídica.
3.  **Almacenamiento:** Los datos estructurados y la evidencia (fotos/videos) se guardan en Supabase.
4.  **Output:** Se genera un PDF con folio único, firma digital (hash) y estructura formal para descarga o envío.

---

## 5. Características Clave

### 5.1 Geolocalización Híbrida Inteligente
Migramos de OpenStreetMap a **Google Maps** para ofrecer:
*   **Autocomplete:** Búsqueda predictiva de direcciones.
*   **Geocodificación Inversa:** Conversión precisa de coordenadas a direcciones postales.
*   **Edición Manual:** Una característica única que permite al usuario refinar la dirección automática con referencias locales (ej. "Entre calle 5 y 6"), crucial para zonas con nomenclatura irregular.

### 5.2 Asistente Legal con IA (Chain of Thought)
El chat integrado no es un chatbot estándar. Utiliza técnicas de **Chain of Thought (CoT)** para:
1.  **Entrevistar:** Hacer las preguntas pertinentes que faltan (¿Cuándo ocurrió? ¿Había testigos?).
2.  **Fundamentar:** Buscar en tiempo real (Grounding) las leyes y reglamentos aplicables al caso específico.
3.  **Redactar:** Generar un texto formal, objetivo y libre de emociones, adecuado para un trámite administrativo.

### 5.3 Generación de Documentos Inmutables
El sistema genera un archivo PDF que cumple con los requisitos de un escrito formal de petición:
*   Encabezado con autoridad competente.
*   Proemio con identificación (o leyenda de anonimato).
*   Narrativa de hechos ordenada cronológicamente.
*   Fundamentación jurídica.
*   Pruebas adjuntas relacionadas.
*   Firma digital y Hash de verificación para integridad.

---

## 6. Hoja de Ruta (Roadmap)

### Fase 1: Consolidación (Actual)
*   Estabilización de la migración a Google Maps.
*   Optimización de prompts para el modelo legal de Gemini.
*   Despliegue en Vercel.

### Fase 2: Expansión (Q1 2026)
*   **App Móvil Nativa:** React Native para acceso offline y notificaciones push.
*   **Dashboard de Autoridad:** Panel para que los gobiernos reciban y gestionen las denuncias directamente.
*   **Integración Blockchain:** Registro de folios en una cadena de bloques para garantizar que las denuncias no puedan ser "borradas" o alteradas por funcionarios corruptos.

### Fase 3: Ecosistema (Q3 2026)
*   **API Pública:** Permitir a otras apps integrar el motor de denuncias.
*   **Análisis Predictivo:** Usar la data agregada para generar mapas de calor de problemas urbanos y predecir focos rojos.

---

## 7. Conclusión

**Denuncia Popular v2.0** no es solo una herramienta tecnológica; es un instrumento de cambio social. Al reducir la fricción para denunciar y elevar la calidad técnica de los reportes, democratizamos el acceso a la justicia administrativa. Transformamos la queja pasiva en acción legal efectiva, fomentando una ciudadanía más participativa y gobiernos más responsables.

---
*© 2025 Esoteria AI. Todos los derechos reservados.*
