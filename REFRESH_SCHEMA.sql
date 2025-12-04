-- ================================================
-- REFRESCAR ESQUEMA DE SUPABASE
-- ================================================
-- Este archivo soluciona el error "Could not find the 'images' column"
-- Ejecuta esto en el SQL Editor de Supabase
-- ================================================

-- 1. Verificar que la columna 'images' existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'articles' 
      AND column_name = 'images'
  ) THEN
    -- Si no existe, agregar la columna
    ALTER TABLE public.articles 
    ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
    
    RAISE NOTICE 'Columna images agregada exitosamente';
  ELSE
    RAISE NOTICE 'Columna images ya existe';
  END IF;
END $$;

-- 2. Verificar que la columna 'references' existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'articles' 
      AND column_name = 'references'
  ) THEN
    -- Si no existe, agregar la columna
    ALTER TABLE public.articles 
    ADD COLUMN "references" JSONB DEFAULT '[]'::jsonb;
    
    RAISE NOTICE 'Columna references agregada exitosamente';
  ELSE
    RAISE NOTICE 'Columna references ya existe';
  END IF;
END $$;

-- 3. Notificar al schema cache de PostgREST (Supabase API)
NOTIFY pgrst, 'reload schema';

-- 4. Verificar las columnas
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'articles'
ORDER BY ordinal_position;

-- ================================================
-- INSTRUCCIONES:
-- ================================================
-- 1. Ve al Dashboard de Supabase
-- 2. Abre SQL Editor
-- 3. Pega y ejecuta todo este código
-- 4. Si ves errores, reinicia la aplicación móvil
-- 5. Si el problema persiste, ve a Settings > API y reinicia el servidor API
-- ================================================
