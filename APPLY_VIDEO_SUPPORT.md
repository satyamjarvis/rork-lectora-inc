# Aplicar Soporte para Videos de YouTube

## Instrucciones para Agregar Soporte de Videos

Para habilitar el soporte de videos de YouTube en tu app, necesitas ejecutar la migración SQL en tu base de datos de Supabase.

### Pasos:

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Navega a "SQL Editor" en el menú lateral
3. Haz clic en "+ New query"
4. Copia y pega el contenido del archivo `ADD_VIDEO_SUPPORT.sql`
5. Haz clic en "Run" para ejecutar la migración

### ¿Qué hace esta migración?

- Agrega la columna `is_video` (boolean) para identificar si es un video
- Agrega la columna `video_id` (text) para almacenar el ID del video de YouTube
- Crea un índice para optimizar las consultas de videos

### Uso

Una vez aplicada la migración:

1. En el modal "Add Article/Video", pega una URL de YouTube
2. La app detectará automáticamente que es un video
3. Guardará la miniatura del video
4. Al hacer clic en el video, abrirá YouTube para reproducirlo

### URLs de YouTube compatibles:

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/v/VIDEO_ID`

### Características:

- ✅ Miniatura automática del video
- ✅ Icono de YouTube sobre la miniatura
- ✅ Abre YouTube al hacer clic
- ✅ Se puede guardar en carpetas
- ✅ Se puede etiquetar con tags
