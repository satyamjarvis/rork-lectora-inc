-- ================================================
-- FIX PROFILE CREATION ERRORS
-- ================================================
-- Este script resuelve los errores:
-- 1. "Cannot coerce the result to a single JSON object"
-- 2. "insert or update on table profiles violates foreign key constraint"
-- ================================================

-- PASO 1: Verificar que la tabla profiles existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) as profiles_table_exists;

-- PASO 2: Verificar el trigger handle_new_user
SELECT 
  t.tgname as trigger_name,
  t.tgenabled as enabled,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'users'
AND t.tgname = 'on_auth_user_created';

-- PASO 3: Eliminar el trigger antiguo si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- PASO 4: Eliminar la función antigua si existe
DROP FUNCTION IF EXISTS public.handle_new_user();

-- PASO 5: Crear la función mejorada con mejor manejo de errores
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Intentar insertar el perfil
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1),
      'Usuario'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Intentar insertar las estadísticas del usuario
  INSERT INTO public.user_statistics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log el error pero no fallar el registro
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASO 6: Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASO 7: Verificar que el trigger fue creado correctamente
SELECT 
  t.tgname as trigger_name,
  t.tgenabled as enabled,
  p.proname as function_name,
  CASE t.tgtype::integer & 1 
    WHEN 1 THEN 'ROW' 
    ELSE 'STATEMENT' 
  END as level,
  CASE t.tgtype::integer & 66
    WHEN 2 THEN 'BEFORE'
    WHEN 64 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END as timing
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'users'
AND t.tgname = 'on_auth_user_created';

-- PASO 8: Crear perfiles para usuarios existentes que no tienen uno
INSERT INTO public.profiles (id, email, name)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1),
    'Usuario'
  )
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- PASO 9: Crear estadísticas para usuarios existentes que no tienen
INSERT INTO public.user_statistics (user_id)
SELECT u.id
FROM auth.users u
LEFT JOIN public.user_statistics s ON u.id = s.user_id
WHERE s.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- PASO 10: Verificar que todos los usuarios tienen perfil
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT p.id) as users_with_profile,
  COUNT(DISTINCT s.user_id) as users_with_stats
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_statistics s ON u.id = s.user_id;

-- ================================================
-- NOTAS IMPORTANTES
-- ================================================
-- 1. El trigger ahora usa "ON CONFLICT DO NOTHING" para evitar errores de duplicados
-- 2. El trigger usa "SECURITY DEFINER" para que se ejecute con privilegios del propietario
-- 3. Se añadió manejo de excepciones para que no falle el registro si hay problemas
-- 4. Los pasos 8 y 9 crean perfiles y estadísticas para usuarios existentes
-- ================================================
