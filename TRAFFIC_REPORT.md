# Reporte de Tráfico y Datos de la Aplicación

## Estado Actual
Actualmente, la aplicación **Denuncia Popular** no tiene un panel de administración público ni herramientas de análisis de tráfico (como Google Analytics) integradas en el código visible.

Además, la base de datos Supabase está configurada de manera segura con **Row Level Security (RLS)**. Esto significa que:
- El público puede **enviar** denuncias (INSERT).
- El público **no puede ver** las denuncias existentes (SELECT está bloqueado para usuarios anónimos).

Esto es excelente para la privacidad y seguridad de los datos, pero impide que podamos consultar el número de denuncias directamente desde la aplicación o con las credenciales públicas actuales.

## Cómo Ver el Tráfico (Denuncias Recibidas)
Para ver cuántas personas han usado la aplicación hoy, debes acceder directamente al panel de control de Supabase:

1.  Ve a [Supabase Dashboard](https://supabase.com/dashboard).
2.  Selecciona tu proyecto (`denuncia-popular`).
3.  En el menú lateral izquierdo, haz clic en **Table Editor** (icono de tabla).
4.  Selecciona la tabla `denuncias`.
5.  Aquí verás todas las entradas. Puedes filtrar por la columna `created_at` para ver las de hoy.

## Opciones para el Futuro
Si deseas monitorear el tráfico y los datos más fácilmente, puedo implementar una de las siguientes soluciones:

1.  **Panel de Administración**: Crear una página protegida por contraseña (ej. `/admin`) que muestre estadísticas y gráficos.
2.  **Google Analytics / Vercel Analytics**: Integrar herramientas de seguimiento para ver visitas, ubicación de usuarios, y tiempo en pantalla.
3.  **Script de Reporte**: Si me proporcionas la `SERVICE_ROLE_KEY` (que se encuentra en los ajustes de Supabase > API), puedo crear un script para generarte un reporte desde aquí.

¿Te gustaría que proceda con alguna de estas opciones?
