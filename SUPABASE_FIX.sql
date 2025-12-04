-- ================================================
-- FIX PARA EL ERROR DE LA COLUMNA 'images'
-- ================================================
-- Este script asegura que la columna 'images' existe en la tabla 'articles'
-- Copia y ejecuta esto en el SQL Editor de Supabase
-- ================================================

-- Verificar y agregar la columna 'images' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'articles' 
        AND column_name = 'images'
    ) THEN
        ALTER TABLE public.articles 
        ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE 'Columna images agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna images ya existe';
    END IF;
END $$;

-- Verificar y agregar la columna 'references' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'articles' 
        AND column_name = 'references'
    ) THEN
        ALTER TABLE public.articles 
        ADD COLUMN "references" JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE 'Columna references agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna references ya existe';
    END IF;
END $$;

-- Actualizar artículos existentes que tengan NULL en estas columnas
UPDATE public.articles 
SET images = '[]'::jsonb 
WHERE images IS NULL;

UPDATE public.articles 
SET "references" = '[]'::jsonb 
WHERE "references" IS NULL;

-- Mensaje de confirmación
DO $$ 
BEGIN
    RAISE NOTICE '✓ Script ejecutado correctamente';
    RAISE NOTICE '✓ Las columnas images y references están listas';
    RAISE NOTICE '✓ Ahora puedes agregar artículos con imágenes y referencias';
END $$;
