-- Add video support to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS is_video BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS video_id TEXT;

-- Create index for video queries
CREATE INDEX IF NOT EXISTS idx_articles_is_video ON articles(is_video);
