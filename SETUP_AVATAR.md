# Configuración de Avatares en Supabase

## Paso 1: Ejecutar SQL para agregar columna avatar_url

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `ADD_AVATAR_COLUMN.sql`
4. Ejecuta el script

## Paso 2: Crear bucket de Storage

1. Ve a **Storage** en el menú lateral
2. Haz clic en **Create a new bucket**
3. Configura el bucket:
   - **Name**: `avatars`
   - **Public**: ✅ Activado
   - **File size limit**: 2 MB
   - **Allowed MIME types**: `image/*`
4. Haz clic en **Create bucket**

## Paso 3: Configurar políticas de Storage

Las políticas ya están incluidas en el archivo SQL, pero si necesitas configurarlas manualmente:

1. Ve a **Storage > avatars**
2. Haz clic en la pestaña **Policies**
3. Las políticas deberían estar creadas automáticamente

## Verificación

Para verificar que todo está configurado correctamente:

```sql
-- Verificar que la columna existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'avatar_url';

-- Verificar políticas de Storage
SELECT * FROM storage.objects WHERE bucket_id = 'avatars';
```

## Notas

- Los avatares se almacenan en la ruta: `avatars/{user_id}/{filename}`
- El tamaño máximo por imagen es 2MB
- Solo se permiten imágenes (jpg, png, gif, webp, etc.)
- Los usuarios solo pueden subir/modificar/eliminar sus propios avatares
- Los avatares son públicamente accesibles (para mostrarlos en la app)
