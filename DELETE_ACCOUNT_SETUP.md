# Instrucciones para Agregar la Función de Eliminar Cuenta

## 📝 Descripción
La funcionalidad de eliminar cuenta permite a los usuarios borrar permanentemente su cuenta y todos sus datos asociados de la base de datos de Supabase.

## 🔧 Configuración de la Base de Datos

### Paso 1: Ejecutar el SQL
1. Ve a tu proyecto de Supabase: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral
4. Crea una nueva query
5. Copia todo el contenido del archivo `DELETE_USER_ACCOUNT.sql`
6. Pega el contenido en el editor
7. Haz clic en **Run** para ejecutar

### Paso 2: Verificar
Después de ejecutar el SQL, verifica que la función se creó correctamente:
- No deberían aparecer errores en el SQL Editor
- La función `delete_user_account()` debería estar disponible

## ✅ ¿Qué hace la función?

La función `delete_user_account()` realiza las siguientes acciones:

1. **Identifica al usuario autenticado** - Obtiene el ID del usuario que está ejecutando la función
2. **Elimina todos los datos del usuario** - Gracias a `DELETE CASCADE`, elimina automáticamente:
   - Artículos guardados
   - Carpetas
   - Sesiones de lectura
   - Estadísticas diarias
   - Estadísticas generales
   - Notas y highlights
   - Perfil de usuario
3. **Elimina la cuenta** - Finalmente elimina el usuario de la tabla `auth.users`

## 🔒 Seguridad

- La función usa `SECURITY DEFINER` para ejecutarse con privilegios elevados
- Solo usuarios autenticados pueden ejecutar la función
- Solo puede eliminar datos del usuario que está autenticado
- Es una operación **irreversible**

## 🎯 Cómo se usa en la app

1. El usuario va a **Settings** (Configuración)
2. Hace clic en el botón **"Eliminar Cuenta"** (en rojo en la parte inferior)
3. Aparece una alerta de confirmación explicando que la acción es permanente
4. Si confirma, se ejecuta `deleteAccount()` del `auth-provider`
5. La función llama a `supabase.rpc('delete_user_account')`
6. Supabase ejecuta la función SQL que elimina todos los datos
7. El usuario es redirigido a la pantalla de login

## ⚠️ Importante

- Esta acción **NO SE PUEDE DESHACER**
- Todos los datos del usuario se eliminan permanentemente
- Se debe mostrar una advertencia clara al usuario antes de confirmar
- Después de eliminar la cuenta, el usuario debe crear una nueva si quiere volver a usar la app

## 🧪 Testing (Solo en Desarrollo)

Si quieres probar que funciona (solo en un proyecto de desarrollo, NO en producción):

```sql
-- Esto eliminará tu cuenta actual - solo para testing
SELECT delete_user_account();
```

## 📱 Interfaz de Usuario

El botón de eliminar cuenta:
- Se encuentra en la parte inferior de la página de Settings
- Tiene un color rojo distintivo (#EF4444)
- Muestra el icono UserX
- Tiene texto "Eliminar Cuenta"
- Al hacer clic, muestra una alerta de confirmación en español

## 🔍 Solución de Problemas

### Error: "Could not find the function delete_user_account"
- **Solución**: Asegúrate de haber ejecutado el SQL en Supabase

### Error: "No authenticated user"
- **Solución**: El usuario debe estar autenticado. Verifica que la sesión esté activa

### Error: "Permission denied"
- **Solución**: Verifica que ejecutaste el `GRANT EXECUTE` en el SQL

## 📚 Recursos Adicionales

- [Documentación de Supabase RPC](https://supabase.com/docs/guides/database/functions)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL DELETE CASCADE](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
