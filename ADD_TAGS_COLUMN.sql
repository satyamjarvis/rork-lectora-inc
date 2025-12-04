-- ================================================
-- ADD TAGS COLUMN TO ARTICLES TABLE
-- ================================================
-- Run this SQL in your Supabase SQL Editor
-- ================================================

-- Add tags column to articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add index for tags search
CREATE INDEX IF NOT EXISTS idx_articles_tags ON public.articles USING GIN (tags);

-- ================================================
-- VERIFICACIÓN
-- ================================================
-- Después de ejecutar, verifica con:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'articles' AND column_name = 'tags';
-- ================================================
