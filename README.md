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
   
   Crea un archivo `.env.local` en la raíz del proyecto y añade tu clave API de Gemini:
   ```env
   GEMINI_API_KEY=tu_clave_api_aqui
   ```

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
- **Leaflet**: Integración de mapas interactivos

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

---

**Nota**: Esta aplicación es una herramienta de asistencia para la presentación de denuncias populares. Asegúrate de seguir los procedimientos legales oficiales de SEMARNAT.
