-- ================================================
-- ADD NOTES AND HIGHLIGHTS COLUMNS TO ARTICLES
-- ================================================
-- Execute this in your Supabase SQL Editor
-- ================================================

-- Add notes column (JSONB array of notes)
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb;

-- Add highlights column (JSONB array of highlights)
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_notes ON public.articles USING GIN (notes);
CREATE INDEX IF NOT EXISTS idx_articles_highlights ON public.articles USING GIN (highlights);

-- ================================================
-- VERIFICATION
-- ================================================
-- After running this, verify with:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'articles' AND column_name IN ('notes', 'highlights');
-- ================================================
