# Aplicar Migración: Agregar Columnas de Notas y Resaltados

## Problema
La aplicación intentaba guardar notas y resaltados en la tabla `articles`, pero estas columnas no existían en la base de datos de Supabase.

## Error que se corrige
```
Could not find the 'notes' column of 'articles' in the schema cache
```

## Solución

Debes ejecutar el archivo SQL de migración en tu base de datos de Supabase:

### Pasos:

1. **Ve a tu proyecto de Supabase**
   - Abre https://app.supabase.com
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral izquierdo, haz clic en "SQL Editor"

3. **Ejecuta la migración**
   - Copia todo el contenido del archivo `ADD_NOTES_HIGHLIGHTS.sql`
   - Pégalo en el SQL Editor
   - Haz clic en "Run" (Ejecutar)

4. **Verifica que funcionó**
   - Ejecuta esta consulta para verificar:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'articles' 
   AND column_name IN ('notes', 'highlights');
   ```
   - Deberías ver ambas columnas listadas

## Qué hace esta migración

- ✅ Agrega la columna `notes` (JSONB) para almacenar notas del usuario
- ✅ Agrega la columna `highlights` (JSONB) para almacenar resaltados
- ✅ Agrega índices GIN para mejorar el rendimiento de búsquedas
- ✅ Usa `IF NOT EXISTS` para que sea seguro ejecutarlo múltiples veces

## Después de aplicar la migración

Una vez ejecutada la migración en Supabase:

1. Refresca tu aplicación
2. Intenta agregar una nota a un artículo
3. El error debería desaparecer y las notas se guardarán correctamente

## Nota importante

Si en el futuro necesitas recrear toda la base de datos desde cero, usa el archivo `supabase-schema.sql` actualizado, que ahora ya incluye estas columnas.
