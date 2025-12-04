-- ================================================
-- FUNCIÓN PARA ELIMINAR CUENTA DE USUARIO
-- ================================================
-- Esta función elimina todos los datos del usuario y su cuenta
-- Se ejecuta de forma segura con DELETE CASCADE
-- ================================================

-- Crear la función para eliminar la cuenta del usuario
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Obtener el ID del usuario autenticado
  current_user_id := auth.uid();
  
  -- Verificar que hay un usuario autenticado
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user';
  END IF;
  
  -- Eliminar todos los datos del usuario
  -- Las siguientes tablas se eliminan automáticamente por DELETE CASCADE:
  -- - articles (incluyendo reading_sessions por CASCADE)
  -- - folders
  -- - daily_statistics
  -- - user_statistics
  -- - profiles
  
  -- Log para debugging
  RAISE NOTICE 'Deleting all data for user: %', current_user_id;
  
  -- Eliminar el usuario de auth.users
  -- Esto desencadenará DELETE CASCADE en todas las tablas relacionadas
  DELETE FROM auth.users WHERE id = current_user_id;
  
  RAISE NOTICE 'User account deleted successfully: %', current_user_id;
END;
$$;

-- ================================================
-- PERMISOS
-- ================================================
-- Permitir que usuarios autenticados ejecuten esta función
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- ================================================
-- INSTRUCCIONES DE USO
-- ================================================
-- 1. Copia este SQL completo
-- 2. Ve a tu proyecto de Supabase
-- 3. Abre SQL Editor
-- 4. Pega el SQL y ejecuta
-- 5. La función estará disponible para usar desde el código
-- ================================================

-- ================================================
-- TESTING (Opcional - NO ejecutar en producción)
-- ================================================
-- Para probar la función (solo en desarrollo):
-- SELECT delete_user_account();
-- ================================================
