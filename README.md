# 🌿 Denuncia Popular - Sistema de Denuncias Ambientales

Una aplicación web moderna para facilitar la presentación de denuncias populares ante SEMARNAT (Secretaría de Medio Ambiente y Recursos Naturales de México).

## 📋 Características

- **Interfaz Bilingüe**: Soporte completo para español e inglés
- **Formulario Interactivo**: Wizard multi-paso para facilitar el proceso de denuncia
- **Integración con Mapas**: Selección visual de la ubicación del incidente
- **Generación de PDF**: Descarga automática de constancia de presentación
- **UI Moderna**: Diseño oscuro y minimalista con Tailwind CSS
- **Integración con IA**: Asistencia mediante Google Gemini API

## 🚀 Instalación y Uso Local

### Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/TU_USUARIO/denuncia-popular.git
   cd denuncia-popular
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto y añade tus claves API:
   ```env
   # Google Maps API (REQUERIDO - ver documentación de migración)
   VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key_aqui
   
   # Supabase
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   
   # Gemini AI (opcional)
   GEMINI_API_KEY=tu_gemini_api_key_aqui
   ```
   
   **📖 Para obtener tu Google Maps API key**, consulta la guía completa:
   - [`GOOGLE_MAPS_MIGRATION.md`](./GOOGLE_MAPS_MIGRATION.md) - Guía paso a paso

4. **Ejecutar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   
   Visita `http://localhost:5173` para ver la aplicación en funcionamiento.

## 🏗️ Tecnologías Utilizadas

- **React** + **TypeScript**: Framework principal
- **Vite**: Build tool y servidor de desarrollo
- **Tailwind CSS**: Estilos y diseño responsive
- **Google Gemini API**: Asistencia con IA
- **Google Maps API**: Mapas interactivos y geocodificación
- **Supabase**: Base de datos y almacenamiento

## 📦 Deploy a Vercel

Este proyecto está optimizado para desplegarse en Vercel:

1. Fork o clona este repositorio
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Configura la variable de entorno `GEMINI_API_KEY`
4. ¡Deploy automático!

## 🛠️ Estructura del Proyecto

```
denuncia-popular/
├── components/          # Componentes React reutilizables
├── services/           # Servicios y lógica de negocio
├── App.tsx             # Componente principal de la aplicación
├── types.ts            # Definiciones de tipos TypeScript
└── README.md           # Este archivo
```

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias y mejoras.

```

## 📚 Documentación Completa

Este proyecto incluye documentación exhaustiva sobre la migración a Google Maps:

### Guías de Migración
- **[`COMPLETE_MIGRATION_SUMMARY.md`](./COMPLETE_MIGRATION_SUMMARY.md)** - Resumen completo de la migración
- **[`MIGRATION_SUMMARY.md`](./MIGRATION_SUMMARY.md)** - Referencia rápida
- **[`GOOGLE_MAPS_MIGRATION.md`](./GOOGLE_MAPS_MIGRATION.md)** - Guía técnica detallada
- **[`ARCHITECTURE_COMPARISON.md`](./ARCHITECTURE_COMPARISON.md)** - Comparación antes/después
- **[`POST_MIGRATION_CHECKLIST.md`](./POST_MIGRATION_CHECKLIST.md)** - Lista de verificación
- **[`MANUAL_INPUT_FEATURE.md`](./MANUAL_INPUT_FEATURE.md)** - Explicación de la función de entrada manual

### Características Destacadas

#### 🗺️ Integración con Google Maps
- **Geocodificación precisa**: Convierte coordenadas a direcciones y viceversa
- **Búsqueda inteligente**: Autocompletado con Google Places API
- **Entrada manual de dirección**: Los usuarios pueden personalizar la dirección detectada
- **Modo oscuro premium**: Estilos personalizados para mejor experiencia visual

#### ⭐ Entrada Manual de Dirección
Una característica clave que permite a los usuarios:
- Ver la dirección auto-detectada por Google
- Editar manualmente para agregar detalles locales
- Mantener coordenadas GPS precisas mientras personalizan la descripción
- Ejemplo: "En frente de la farmacia del Dr. Simi" en lugar de "Av. Reforma 222"

## 📄 Licencia

