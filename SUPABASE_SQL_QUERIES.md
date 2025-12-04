# Consultas SQL Útiles para Supabase

## 📊 Monitoreo y Análisis

### Ver Usuarios Registrados
```sql
-- Ver todos los usuarios con sus perfiles
SELECT 
  u.id,
  u.email,
  u.created_at as registered_at,
  p.name,
  p.updated_at as last_profile_update
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
```

### Ver Estadísticas de Usuarios
```sql
-- Ver estadísticas de todos los usuarios
SELECT 
  p.name,
  p.email,
  us.total_reading_time,
  us.total_articles_read,
  us.current_streak,
  us.longest_streak,
  us.average_reading_speed
FROM public.user_statistics us
JOIN public.profiles p ON us.user_id = p.id
ORDER BY us.total_reading_time DESC;
```

### Ver Artículos por Usuario
```sql
-- Ver cuántos artículos tiene cada usuario
SELECT 
  p.email,
  p.name,
  COUNT(a.id) as total_articles,
  COUNT(CASE WHEN a.bookmarked THEN 1 END) as bookmarked,
  COUNT(CASE WHEN a.archived THEN 1 END) as archived
FROM public.profiles p
LEFT JOIN public.articles a ON p.id = a.user_id
GROUP BY p.id, p.email, p.name
ORDER BY total_articles DESC;
```

### Ver Usuarios Activos
```sql
-- Ver usuarios que han leído en los últimos 7 días
SELECT DISTINCT
  p.email,
  p.name,
  COUNT(ds.id) as days_active,
  SUM(ds.reading_time) as total_reading_time_seconds
FROM public.profiles p
JOIN public.daily_statistics ds ON p.id = ds.user_id
WHERE ds.date >= CURRENT_DATE - INTERVAL '7 days'
  AND ds.reading_time > 0
GROUP BY p.id, p.email, p.name
ORDER BY total_reading_time_seconds DESC;
```

## 🔧 Mantenimiento

### Limpiar Usuarios Inactivos (Solo para desarrollo)
```sql
-- ⚠️ CUIDADO: Esta query elimina usuarios que no han guardado artículos
-- Solo usar en desarrollo, NUNCA en producción sin confirmación

-- Ver usuarios sin artículos (REVISAR PRIMERO)
SELECT 
  u.id,
  u.email,
  u.created_at,
  COUNT(a.id) as article_count
FROM auth.users u
LEFT JOIN public.articles a ON u.id = a.user_id
GROUP BY u.id, u.email, u.created_at
HAVING COUNT(a.id) = 0
ORDER BY u.created_at;

-- Para eliminar (descomentar solo si estás seguro):
-- DELETE FROM auth.users
-- WHERE id IN (
--   SELECT u.id
--   FROM auth.users u
--   LEFT JOIN public.articles a ON u.id = a.user_id
--   GROUP BY u.id
--   HAVING COUNT(a.id) = 0
--   AND u.created_at < NOW() - INTERVAL '30 days'
-- );
```

### Resetear Estadísticas de un Usuario
```sql
-- Resetear estadísticas de un usuario específico
-- Reemplaza 'usuario@email.com' con el email del usuario
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Obtener el ID del usuario
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'usuario@email.com';
  
  IF target_user_id IS NOT NULL THEN
    -- Eliminar sesiones de lectura
    DELETE FROM public.reading_sessions WHERE user_id = target_user_id;
    
    -- Eliminar estadísticas diarias
    DELETE FROM public.daily_statistics WHERE user_id = target_user_id;
    
    -- Resetear estadísticas generales
    UPDATE public.user_statistics
    SET 
      total_reading_time = 0,
      total_app_time = 0,
      total_articles_read = 0,
      total_pdf_downloads = 0,
      total_words_read = 0,
      average_reading_speed = 0,
      longest_reading_session = 0,
      current_streak = 0,
      longest_streak = 0,
      last_active_date = NULL
    WHERE user_id = target_user_id;
    
    RAISE NOTICE 'Estadísticas reseteadas para usuario %', target_user_id;
  ELSE
    RAISE NOTICE 'Usuario no encontrado';
  END IF;
END $$;
```

## 🔍 Debugging y Verificación

### Verificar Políticas RLS
```sql
-- Ver todas las políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Verificar Triggers
```sql
-- Ver todos los triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

### Verificar Relaciones y Cascadas
```sql
-- Ver todas las foreign keys y reglas de eliminación
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

### Verificar Índices
```sql
-- Ver todos los índices
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## 📈 Reportes

### Top Artículos por Sesiones de Lectura
```sql
-- Artículos más leídos
SELECT 
  a.title,
  a.domain,
  COUNT(rs.id) as reading_sessions,
  SUM(rs.duration) as total_reading_time_seconds,
  AVG(rs.duration) as avg_session_duration
FROM public.articles a
JOIN public.reading_sessions rs ON a.id = rs.article_id
GROUP BY a.id, a.title, a.domain
ORDER BY reading_sessions DESC
LIMIT 10;
```

### Actividad por Día de la Semana
```sql
-- Ver qué días son más populares para leer
SELECT 
  TO_CHAR(DATE(date), 'Day') as day_of_week,
  COUNT(*) as days_count,
  AVG(reading_time) as avg_reading_time,
  AVG(articles_read) as avg_articles_read
FROM public.daily_statistics
WHERE reading_time > 0
GROUP BY TO_CHAR(DATE(date), 'Day'), EXTRACT(DOW FROM date)
ORDER BY EXTRACT(DOW FROM date);
```

### Usuarios con Mejor Racha
```sql
-- Top 10 usuarios con mejores rachas
SELECT 
  p.name,
  p.email,
  us.current_streak,
  us.longest_streak,
  us.last_active_date
FROM public.user_statistics us
JOIN public.profiles p ON us.user_id = p.id
ORDER BY us.current_streak DESC
LIMIT 10;
```

## 🧪 Testing en Desarrollo

### Crear Usuario de Prueba con Datos
```sql
-- Función para crear datos de prueba
-- SOLO PARA DESARROLLO
DO $$
DECLARE
  test_user_id UUID;
  test_article_id UUID;
BEGIN
  -- Nota: El usuario debe crearse primero desde la app
  -- Esta función solo añade artículos y estadísticas de prueba
  
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test@example.com';
  
  IF test_user_id IS NOT NULL THEN
    -- Crear artículo de prueba
    INSERT INTO public.articles (
      user_id, url, title, excerpt, content, domain, reading_time, bookmarked
    ) VALUES (
      test_user_id,
      'https://example.com/test',
      'Test Article',
      'This is a test article',
      'Full content here',
      'example.com',
      5,
      true
    ) RETURNING id INTO test_article_id;
    
    -- Crear sesión de lectura
    INSERT INTO public.reading_sessions (
      user_id, article_id, start_time, end_time, duration, words_read, date
    ) VALUES (
      test_user_id,
      test_article_id,
      NOW() - INTERVAL '1 hour',
      NOW(),
      3600,
      1000,
      CURRENT_DATE
    );
    
    -- Actualizar estadísticas
    INSERT INTO public.daily_statistics (
      user_id, date, reading_time, articles_read, words_read
    ) VALUES (
      test_user_id,
      CURRENT_DATE,
      3600,
      1,
      1000
    );
    
    RAISE NOTICE 'Datos de prueba creados para usuario %', test_user_id;
  ELSE
    RAISE NOTICE 'Usuario de prueba no encontrado. Crea primero el usuario desde la app.';
  END IF;
END $$;
```

## 🗄️ Backup Manual

### Exportar Datos de un Usuario
```sql
-- Exportar todos los datos de un usuario específico
-- Reemplaza 'usuario@email.com' con el email del usuario
COPY (
  SELECT json_build_object(
    'profile', (SELECT row_to_json(p) FROM public.profiles p WHERE p.id = u.id),
    'articles', (SELECT json_agg(a) FROM public.articles a WHERE a.user_id = u.id),
    'folders', (SELECT json_agg(f) FROM public.folders f WHERE f.user_id = u.id),
    'user_statistics', (SELECT row_to_json(us) FROM public.user_statistics us WHERE us.user_id = u.id),
    'daily_statistics', (SELECT json_agg(ds) FROM public.daily_statistics ds WHERE ds.user_id = u.id),
    'reading_sessions', (SELECT json_agg(rs) FROM public.reading_sessions rs WHERE rs.user_id = u.id)
  )
  FROM auth.users u
  WHERE u.email = 'usuario@email.com'
) TO '/tmp/user_backup.json';
```

## 🔐 Seguridad

### Verificar que RLS está Activado
```sql
-- Verificar que todas las tablas tienen RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- rowsecurity debería ser 't' (true) para todas las tablas
```

### Ver Intentos de Acceso No Autorizado (Logs)
```sql
-- Esta query requiere permisos de superadmin
-- Ver en el panel de Supabase > Logs en su lugar
```

## 💡 Optimización

### Analizar Tamaño de Tablas
```sql
-- Ver tamaño de cada tabla
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Vaciar Tablas para Testing
```sql
-- ⚠️ CUIDADO: Esto elimina TODOS los datos
-- SOLO USAR EN DESARROLLO

-- Eliminar todos los artículos
TRUNCATE TABLE public.articles CASCADE;

-- Eliminar todas las estadísticas
TRUNCATE TABLE public.reading_sessions CASCADE;
TRUNCATE TABLE public.daily_statistics CASCADE;
TRUNCATE TABLE public.user_statistics CASCADE;

-- Eliminar todas las carpetas
TRUNCATE TABLE public.folders CASCADE;

-- Para eliminar usuarios, ir a Authentication > Users en el dashboard
```

## 📝 Notas

- **Siempre haz backup antes de ejecutar queries destructivas**
- **Prueba las queries en desarrollo primero**
- **No ejecutes queries que eliminen datos en producción sin confirmación**
- **Verifica los resultados con SELECT antes de ejecutar UPDATE o DELETE**

Para más información sobre SQL en Supabase:
- [Documentación de Supabase SQL](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
