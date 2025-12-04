# Configuración de Supabase - Instrucciones

## ✅ Archivos Creados

- ✅ `.env` - Variables de entorno con credenciales de Supabase
- ✅ `lib/supabase.ts` - Cliente de Supabase configurado
- ✅ `supabase-schema.sql` - Esquema completo de base de datos
- ✅ Providers actualizados para usar Supabase

## 📋 Pasos para Configurar Supabase

### 1. Crear las Tablas en Supabase

1. Ve a tu proyecto de Supabase: https://hodsrehnvqizglehqebm.supabase.co
2. En el menú lateral, selecciona **SQL Editor**
3. Crea una nueva query
4. Copia TODO el contenido del archivo `supabase-schema.sql`
5. Pégalo en el editor SQL
6. Haz clic en **Run** para ejecutar el script

Esto creará:
- ✅ Tabla `profiles` - Perfiles de usuarios
- ✅ Tabla `folders` - Carpetas de organización
- ✅ Tabla `articles` - Artículos guardados
- ✅ Tabla `reading_sessions` - Sesiones de lectura
- ✅ Tabla `daily_statistics` - Estadísticas diarias
- ✅ Tabla `user_statistics` - Estadísticas generales
- ✅ Políticas RLS (Row Level Security) - Seguridad a nivel de fila
- ✅ Triggers automáticos - Creación de perfil al registrarse
- ✅ Índices para mejor rendimiento

### 2. Verificar la Configuración

Después de ejecutar el script SQL:

1. Ve a **Table Editor** en Supabase
2. Deberías ver todas las tablas creadas:
   - profiles
   - folders
   - articles
   - reading_sessions
   - daily_statistics
   - user_statistics

3. Verifica que RLS esté activado:
   - Cada tabla debe tener el ícono de candado 🔒
   - Esto garantiza que los usuarios solo vean sus propios datos

### 3. Configurar Email Auth (Opcional pero Recomendado)

1. Ve a **Authentication** > **Providers**
2. Asegúrate de que **Email** esté habilitado
3. Configura:
   - **Enable Email Confirmations**: Puedes desactivarlo para desarrollo
   - **Secure Email Change**: Habilitado por defecto
   - **Email Templates**: Personaliza los emails (opcional)

### 4. Probar la Aplicación

La aplicación ahora está lista para:

1. **Registro de Usuarios**:
   - Los usuarios pueden crear cuentas con email/password
   - Se crea automáticamente un perfil y estadísticas iniciales
   
2. **Inicio de Sesión**:
   - Login con email/password
   - Sesión persistente (se mantiene al cerrar/abrir la app)

3. **Gestión de Artículos**:
   - Guardar artículos
   - Organizar en carpetas
   - Marcar como favoritos
   - Archivar

4. **Estadísticas**:
   - Se guardan automáticamente en Supabase
   - Sesiones de lectura
   - Tiempo en la app
   - Racha de lectura

## 🔐 Seguridad Implementada

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS que garantizan:
- ✅ Los usuarios SOLO pueden ver sus propios datos
- ✅ Los usuarios SOLO pueden modificar sus propios datos
- ✅ No se puede acceder a datos de otros usuarios
- ✅ Las políticas se aplican automáticamente en todas las consultas

### Ejemplo de Políticas:

```sql
-- Los usuarios solo pueden ver sus propios artículos
CREATE POLICY "Users can view own articles"
  ON public.articles FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar sus propios artículos
CREATE POLICY "Users can delete own articles"
  ON public.articles FOR DELETE
  USING (auth.uid() = user_id);
```

## 🗑️ Eliminación de Cuenta

La función `deleteAccount()` está lista en el provider de auth.

Para implementar el botón de eliminar cuenta:

1. Agrega un botón en la pantalla de configuración
2. Muestra una confirmación
3. Llama a `deleteAccount()` del provider
4. Esto eliminará:
   - ✅ El usuario de auth
   - ✅ Todos sus artículos (CASCADE)
   - ✅ Todas sus carpetas (CASCADE)
   - ✅ Todas sus estadísticas (CASCADE)
   - ✅ Todas sus sesiones de lectura (CASCADE)

### Implementación del Botón (ejemplo):

```tsx
const { deleteAccount } = useAuth();
const [showConfirm, setShowConfirm] = useState(false);

const handleDeleteAccount = async () => {
  Alert.alert(
    "Eliminar Cuenta",
    "¿Estás seguro? Esta acción no se puede deshacer.",
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAccount();
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar la cuenta");
          }
        },
      },
    ]
  );
};
```

## 📊 Base de Datos - Relaciones

```
auth.users (Supabase Auth)
    ↓
profiles (1:1)
    ↓
    ├── user_statistics (1:1)
    ├── daily_statistics (1:many)
    ├── folders (1:many)
    │       ↓
    └── articles (1:many)
            ↓
        reading_sessions (1:many)
```

Todas las relaciones usan `ON DELETE CASCADE`, por lo que al eliminar un usuario, se eliminan automáticamente todos sus datos.

## ⚡ Optimizaciones

El esquema incluye índices para mejorar el rendimiento:
- Índices en `user_id` para búsquedas rápidas
- Índices en `date` para estadísticas
- Índices en `saved_at` para ordenamiento
- Índices en relaciones (folder_id, article_id)

## 🧪 Testing

Para probar:

1. Registra un nuevo usuario
2. Guarda algunos artículos
3. Lee un artículo (se guardará la sesión)
4. Verifica en Supabase Table Editor que los datos se guardan correctamente

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Reinicia el servidor de desarrollo: `npm run start --clear`

### Error: "relation does not exist"
- No se ejecutó el script SQL
- Ve a SQL Editor y ejecuta `supabase-schema.sql`

### Error: "new row violates row-level security policy"
- Las políticas RLS están bloqueando la operación
- Verifica que estés autenticado correctamente
- Revisa las políticas en Authentication > Policies

### Los datos no aparecen después de crearlos
- Verifica la consola para errores
- Comprueba que las políticas RLS permitan SELECT
- Asegúrate de que `user_id` coincide con `auth.uid()`

## 📝 Notas Importantes

1. **Credenciales**: Las credenciales en `.env` son del entorno de desarrollo
2. **RLS**: NUNCA desactives RLS en producción
3. **Backups**: Supabase hace backups automáticos, pero configura los tuyos también
4. **Límites**: El plan gratuito de Supabase tiene límites, monitorea tu uso

## ✨ Próximos Pasos

Ahora que Supabase está configurado:

1. ✅ Los usuarios pueden registrarse e iniciar sesión
2. ✅ Los datos se persisten en la nube
3. ✅ Funciona offline con sync automático
4. ✅ Múltiples dispositivos se sincronizan

Puedes agregar:
- Sincronización en tiempo real con Supabase Realtime
- Carga de imágenes con Supabase Storage
- Funciones serverless con Edge Functions
- Búsqueda full-text en artículos
