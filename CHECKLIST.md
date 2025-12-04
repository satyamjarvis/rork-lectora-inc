# ✅ Lista de Verificación - Integración Supabase

## Antes de Empezar

- [ ] Tengo acceso a mi proyecto de Supabase
- [ ] He leído `QUICKSTART.md`
- [ ] El servidor de desarrollo está corriendo

## Setup de Base de Datos (5 minutos)

- [ ] Abrir Supabase Dashboard: https://hodsrehnvqizglehqebm.supabase.co
- [ ] Ir a **SQL Editor**
- [ ] Copiar contenido de `supabase-schema.sql`
- [ ] Pegar en SQL Editor
- [ ] Hacer clic en **Run**
- [ ] Verificar mensaje "Success"
- [ ] Ir a **Table Editor**
- [ ] Verificar que existen 6 tablas:
  - [ ] profiles
  - [ ] folders
  - [ ] articles
  - [ ] reading_sessions
  - [ ] daily_statistics
  - [ ] user_statistics
- [ ] Verificar que todas las tablas tienen el candado 🔒 (RLS activado)

## Configuración de Authentication (2 minutos)

- [ ] Ir a **Authentication** > **Providers**
- [ ] Verificar que **Email** está habilitado
- [ ] Ir a **Authentication** > **Settings**
- [ ] Para desarrollo: Desactivar "Enable email confirmations"
- [ ] Para producción: Dejar activado y configurar email templates

## Testing de la Aplicación (10 minutos)

### Test 1: Registro de Usuario
- [ ] Abrir la app
- [ ] Hacer clic en "Sign Up"
- [ ] Completar el formulario:
  - [ ] Nombre
  - [ ] Email
  - [ ] Contraseña (mínimo 6 caracteres)
- [ ] Hacer clic en "Create Account"
- [ ] Verificar redirección a pantalla principal
- [ ] Verificar nombre de usuario en la pantalla de inicio

### Test 2: Verificar Usuario en Supabase
- [ ] Ir a Supabase Dashboard
- [ ] Ir a **Authentication** > **Users**
- [ ] Verificar que aparece el usuario creado
- [ ] Ir a **Table Editor** > **profiles**
- [ ] Verificar que aparece el perfil del usuario
- [ ] Ir a **Table Editor** > **user_statistics**
- [ ] Verificar que aparecen las estadísticas iniciales

### Test 3: Guardar Artículo
- [ ] En la app, hacer clic en el botón "+"
- [ ] Ingresar una URL (ejemplo: https://example.com/article)
- [ ] Hacer clic en "Save"
- [ ] Verificar que el artículo aparece en la lista
- [ ] Ir a Supabase **Table Editor** > **articles**
- [ ] Verificar que el artículo se guardó correctamente

### Test 4: Crear Carpeta
- [ ] Ir a la pestaña "Folders"
- [ ] Hacer clic en "Create Folder"
- [ ] Ingresar nombre de carpeta
- [ ] Hacer clic en "Create"
- [ ] Verificar que la carpeta aparece
- [ ] Ir a Supabase **Table Editor** > **folders**
- [ ] Verificar que la carpeta se guardó

### Test 5: Sesión de Lectura
- [ ] Abrir un artículo
- [ ] Leer durante al menos 10 segundos
- [ ] Cerrar el artículo
- [ ] Ir a Supabase **Table Editor** > **reading_sessions**
- [ ] Verificar que se guardó la sesión
- [ ] Ir a **Table Editor** > **daily_statistics**
- [ ] Verificar que se actualizaron las estadísticas del día

### Test 6: Cerrar Sesión y Volver a Entrar
- [ ] Ir a Settings
- [ ] Hacer clic en "Sign Out"
- [ ] Verificar redirección a pantalla de login
- [ ] Cerrar la app completamente
- [ ] Volver a abrir la app
- [ ] Hacer login con las mismas credenciales
- [ ] Verificar que todos los artículos siguen ahí
- [ ] Verificar que las estadísticas se mantienen

### Test 7: Multi-dispositivo (Opcional)
- [ ] Iniciar sesión en otro dispositivo con la misma cuenta
- [ ] Verificar que aparecen los mismos artículos
- [ ] Guardar un artículo en un dispositivo
- [ ] Hacer "pull to refresh" en el otro dispositivo
- [ ] Verificar que el artículo se sincronizó

### Test 8: Privacidad y Aislamiento
- [ ] Crear una segunda cuenta de usuario
- [ ] Verificar que NO aparecen los artículos de la primera cuenta
- [ ] Guardar artículos en la segunda cuenta
- [ ] Volver a la primera cuenta
- [ ] Verificar que NO aparecen los artículos de la segunda cuenta

## Seguridad (5 minutos)

### Verificar Políticas RLS
- [ ] Ir a Supabase **Authentication** > **Policies**
- [ ] Verificar que todas las tablas tienen políticas:
  - [ ] profiles: 3 políticas (SELECT, UPDATE, INSERT)
  - [ ] folders: 4 políticas (SELECT, INSERT, UPDATE, DELETE)
  - [ ] articles: 4 políticas (SELECT, INSERT, UPDATE, DELETE)
  - [ ] reading_sessions: 4 políticas (SELECT, INSERT, UPDATE, DELETE)
  - [ ] daily_statistics: 4 políticas (SELECT, INSERT, UPDATE, DELETE)
  - [ ] user_statistics: 4 políticas (SELECT, INSERT, UPDATE, DELETE)

### Verificar Cascadas
- [ ] Ejecutar esta query en SQL Editor:
```sql
SELECT
  tc.table_name,
  ccu.table_name AS foreign_table_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
```
- [ ] Verificar que todas las relaciones tienen `delete_rule = CASCADE`

## Implementación del Botón de Eliminar Cuenta (10 minutos)

- [ ] Abrir `app/(tabs)/settings.tsx`
- [ ] Importar `useAuth`
- [ ] Agregar función `handleDeleteAccount` (ver QUICKSTART.md)
- [ ] Agregar botón "Eliminar Cuenta"
- [ ] Probar el botón:
  - [ ] Hacer clic
  - [ ] Verificar mensaje de confirmación
  - [ ] Cancelar y verificar que no pasa nada
  - [ ] Volver a hacer clic
  - [ ] Confirmar eliminación
  - [ ] Verificar redirección a pantalla de login
  - [ ] Ir a Supabase **Authentication** > **Users**
  - [ ] Verificar que el usuario fue eliminado
  - [ ] Verificar que todos los datos fueron eliminados:
    - [ ] profiles
    - [ ] articles
    - [ ] folders
    - [ ] reading_sessions
    - [ ] daily_statistics
    - [ ] user_statistics

## Documentación Revisada

- [ ] He leído `QUICKSTART.md`
- [ ] He leído `SUPABASE_SETUP.md`
- [ ] He revisado `PRIVACY_AND_DATA_DELETION.md`
- [ ] He revisado `SUPABASE_INTEGRATION_SUMMARY.md`
- [ ] He guardado `SUPABASE_SQL_QUERIES.md` para referencia futura

## Troubleshooting Común

### Problema: "Missing Supabase environment variables"
- [ ] Verificar que existe `.env` en la raíz del proyecto
- [ ] Verificar contenido del `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://hodsrehnvqizglehqebm.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=eyJhbGciOi...
```
- [ ] Reiniciar servidor: `npm run start -- --clear`

### Problema: "relation does not exist"
- [ ] Ir a Supabase SQL Editor
- [ ] Ejecutar nuevamente `supabase-schema.sql`
- [ ] Verificar que no hay errores en la ejecución

### Problema: "new row violates row-level security policy"
- [ ] Verificar que el usuario está autenticado
- [ ] Verificar en consola: `const { user } = useAuth(); console.log(user);`
- [ ] Verificar políticas RLS en Supabase
- [ ] Ejecutar query de verificación de políticas (ver arriba)

### Problema: No aparecen los datos
- [ ] Verificar console.log para errores
- [ ] Verificar que RLS permite SELECT
- [ ] Verificar que `user_id` coincide con `auth.uid()`
- [ ] Ejecutar query de verificación:
```sql
SELECT * FROM auth.users WHERE email = 'tu@email.com';
SELECT * FROM public.articles WHERE user_id = 'USER_ID_AQUI';
```

### Problema: No se puede hacer login
- [ ] Verificar email de confirmación (si está activado)
- [ ] Ir a **Authentication** > **Users**
- [ ] Buscar el usuario y verificar estado
- [ ] Si dice "Waiting for verification", desactivar email confirmations
- [ ] O buscar el email de confirmación

## Monitoreo en Producción

### Configuración de Alertas (Opcional)
- [ ] Configurar alertas en Supabase para:
  - [ ] Límite de usuarios alcanzado (80%)
  - [ ] Límite de base de datos alcanzado (80%)
  - [ ] Límite de almacenamiento alcanzado (80%)
  - [ ] Límite de ancho de banda alcanzado (80%)

### Monitoreo Regular
- [ ] Revisar **Database** > **Database Usage** semanalmente
- [ ] Revisar **Authentication** > **Users** para ver crecimiento
- [ ] Revisar logs de errores en Supabase **Logs**

## Preparación para Producción

- [ ] Verificar que `.env` está en `.gitignore`
- [ ] Nunca subir credenciales a Git
- [ ] Activar "Enable email confirmations" en producción
- [ ] Configurar email templates personalizados
- [ ] Configurar dominio personalizado (opcional)
- [ ] Hacer backup manual inicial
- [ ] Documentar flujo de eliminación de cuenta para soporte

## ✅ Verificación Final

- [ ] ✅ Base de datos creada correctamente
- [ ] ✅ Usuarios pueden registrarse
- [ ] ✅ Usuarios pueden iniciar sesión
- [ ] ✅ Artículos se guardan en la nube
- [ ] ✅ Carpetas funcionan correctamente
- [ ] ✅ Estadísticas se rastrean
- [ ] ✅ Sesiones se mantienen al cerrar/abrir app
- [ ] ✅ Multi-dispositivo funciona
- [ ] ✅ RLS protege datos de usuarios
- [ ] ✅ Eliminar cuenta funciona correctamente

## 🎉 ¡Completado!

Si todos los items están marcados, tu integración con Supabase está **100% completa y funcionando**.

Tu aplicación ahora:
- ✅ Tiene autenticación real
- ✅ Guarda datos en la nube
- ✅ Sincroniza entre dispositivos
- ✅ Protege la privacidad de usuarios
- ✅ Permite eliminación completa de cuenta
- ✅ Está lista para producción
- ✅ Es escalable

**¡Excelente trabajo! 🚀**

---

## Próximos Pasos Recomendados

1. [ ] Implementar búsqueda de artículos
2. [ ] Agregar categorías/tags
3. [ ] Implementar compartir artículos
4. [ ] Agregar sincronización en tiempo real (Supabase Realtime)
5. [ ] Implementar almacenamiento de imágenes (Supabase Storage)
6. [ ] Agregar notificaciones push
7. [ ] Crear dashboard de analytics
8. [ ] Implementar modo offline robusto

Para ideas y features: Revisa la documentación de Supabase y Expo.

**¡Feliz desarrollo! 🎨**
