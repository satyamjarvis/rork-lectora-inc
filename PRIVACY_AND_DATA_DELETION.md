# Política de Privacidad y Gestión de Datos

## 🔐 Privacidad y Seguridad

### Datos que Recopilamos

La aplicación **Lectora** recopila y almacena los siguientes datos:

#### Información de la Cuenta
- Email
- Nombre
- Fecha de creación de cuenta

#### Contenido del Usuario
- Artículos guardados (URL, título, contenido extraído)
- Carpetas de organización
- Marcadores y archivados
- Notas y anotaciones

#### Estadísticas de Uso
- Tiempo de lectura
- Tiempo en la aplicación
- Artículos leídos
- Sesiones de lectura
- Racha de lectura diaria
- Velocidad de lectura promedio
- Descargas de PDF

### Cómo Usamos Tus Datos

Los datos se utilizan exclusivamente para:
- ✅ Proporcionar la funcionalidad de la aplicación
- ✅ Sincronizar tus datos entre dispositivos
- ✅ Mostrar estadísticas personales
- ✅ Mejorar tu experiencia de lectura

**NO compartimos ni vendemos tus datos a terceros.**

### Almacenamiento de Datos

- Todos los datos se almacenan en Supabase (infraestructura AWS)
- Los datos están encriptados en tránsito (HTTPS)
- Los datos están encriptados en reposo
- Ubicación: Servidores en [ubicación según tu configuración de Supabase]

### Seguridad Row-Level Security (RLS)

Implementamos Row-Level Security que garantiza:

- ✅ Solo TÚ puedes acceder a tus datos
- ✅ Ni otros usuarios ni administradores pueden ver tu contenido
- ✅ Las políticas de seguridad se aplican a nivel de base de datos
- ✅ Imposible acceder a datos sin autenticación

## 🗑️ Eliminación de Cuenta y Datos

### Derecho a Eliminar

Como usuario, tienes derecho a:
- Eliminar tu cuenta en cualquier momento
- Eliminar todos tus datos sin excepciones
- No dejar rastro de tu información

### Proceso de Eliminación

Cuando eliminas tu cuenta:

#### 1. Confirmación Requerida
```
⚠️ ADVERTENCIA
Esta acción eliminará permanentemente:
- Tu cuenta de usuario
- Todos tus artículos guardados
- Todas tus carpetas
- Todas tus estadísticas de lectura
- Todas tus sesiones de lectura

Esta acción NO se puede deshacer.
```

#### 2. Eliminación Automática (CASCADE)

Al confirmar, se eliminan automáticamente:

```
Usuario Eliminado
    ↓
├── Perfil de usuario ❌
├── Estadísticas generales ❌
├── Estadísticas diarias (todas) ❌
├── Sesiones de lectura (todas) ❌
├── Carpetas (todas) ❌
└── Artículos guardados (todos) ❌
```

#### 3. Tiempo de Eliminación
- **Inmediato**: Los datos se eliminan de la base de datos al instante
- **Backups**: Los backups se eliminan según la política de Supabase (máximo 30 días)

### Implementación Técnica

La eliminación está garantizada por:

1. **DELETE CASCADE en la base de datos**
```sql
-- Ejemplo de configuración
CREATE TABLE articles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

2. **Función deleteAccount()**
```typescript
const { deleteAccount } = useAuth();

// Al llamar esta función:
await deleteAccount();
// Se eliminan TODOS los datos automáticamente
```

## 📊 Retención de Datos

### Datos Activos
- Mientras tu cuenta esté activa, mantenemos todos tus datos
- No eliminamos datos automáticamente
- Tú controlas qué mantener y qué eliminar

### Datos Eliminados
- Datos de cuenta eliminada: 0-30 días (según backups)
- No se conservan datos después de eliminar la cuenta
- No hay "papelera de reciclaje" - la eliminación es permanente

## 🔄 Exportación de Datos

### Derecho a Portabilidad

Tienes derecho a exportar tus datos antes de eliminar tu cuenta.

### Implementación Sugerida

```typescript
const exportUserData = async () => {
  const { articles, folders } = useArticles();
  const { statistics } = useStatistics();
  const { user } = useAuth();

  const exportData = {
    user: {
      email: user.email,
      name: user.name,
    },
    articles,
    folders,
    statistics,
    exportDate: new Date().toISOString(),
  };

  // Guardar como JSON
  const jsonData = JSON.stringify(exportData, null, 2);
  
  // Descargar o compartir
  // (implementación específica según plataforma)
};
```

## 📱 Privacidad en la App

### Datos Locales
- La app puede almacenar datos temporalmente en caché
- Al cerrar sesión, los datos locales se limpian
- Al eliminar la app, todos los datos locales se eliminan

### Permisos Solicitados
- **Ninguno**: La app no requiere permisos especiales
- **Opcional**: Notificaciones (solo si las activas)

## 🔍 Transparencia

### Acceso a Datos
Solo tú y tu dispositivo tienen acceso a:
- Contenido de artículos
- Notas personales
- Estadísticas de lectura

### Logs del Sistema
- Supabase mantiene logs de acceso por seguridad
- Los logs no contienen contenido personal
- Los logs se eliminan automáticamente después de 7 días

## 🛡️ Medidas de Seguridad

### Autenticación
- Contraseñas hasheadas (bcrypt)
- Sesiones encriptadas
- Tokens JWT con expiración

### Base de Datos
- Row-Level Security (RLS) activado
- Políticas de acceso estrictas
- Encriptación en reposo y tránsito

### Código
- TypeScript para seguridad de tipos
- Validación de entrada
- Sanitización de datos

## 📞 Contacto

Para consultas sobre privacidad:
- Email: [tu email de soporte]
- O elimina tu cuenta directamente desde la app

## 📝 Cambios en la Política

Esta política puede actualizarse. Los cambios importantes se notificarán:
- Mediante email
- Mediante notificación en la app
- En esta documentación

Última actualización: [Fecha actual]

---

## 🚀 Para Desarrolladores

### Testing de Eliminación

```typescript
// Test 1: Verificar que los datos se crean
const testDataCreation = async () => {
  await signUp("test@example.com", "password123", "Test User");
  await addArticle("https://example.com");
  // Verificar en Supabase Table Editor
};

// Test 2: Verificar que los datos se eliminan
const testDataDeletion = async () => {
  await deleteAccount();
  // Verificar en Supabase Table Editor que no hay datos del usuario
};

// Test 3: Verificar aislamiento entre usuarios
const testDataIsolation = async () => {
  // Usuario 1 crea artículos
  await signUp("user1@test.com", "pass1", "User 1");
  await addArticle("https://example.com");
  await signOut();
  
  // Usuario 2 no debería ver artículos de Usuario 1
  await signUp("user2@test.com", "pass2", "User 2");
  const articles = await getArticles();
  console.assert(articles.length === 0, "User 2 can see User 1 data!");
};
```

### Monitoreo

```sql
-- Verificar políticas RLS
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Verificar cascadas
SELECT 
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

---

**Recuerda**: La privacidad de los usuarios es primordial. Siempre prioriza la seguridad y transparencia.
