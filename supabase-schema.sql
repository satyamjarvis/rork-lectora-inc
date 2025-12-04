-- ================================================
-- READER APP - SUPABASE DATABASE SCHEMA
-- ================================================
-- Este archivo contiene todo el esquema de base de datos
-- Copia y ejecuta esto en el SQL Editor de Supabase
-- ================================================

-- Habilitar RLS (Row Level Security) en todas las tablas
-- ================================================

-- 1. TABLA: profiles
-- Almacena información adicional del usuario
-- ================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. TABLA: folders
-- Almacena carpetas de organización
-- ================================================
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Políticas para folders
CREATE POLICY "Users can view own folders"
  ON public.folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders"
  ON public.folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON public.folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON public.folders FOR DELETE
  USING (auth.uid() = user_id);

-- 3. TABLA: articles
-- Almacena artículos guardados
-- ================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  domain TEXT NOT NULL,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  "references" JSONB DEFAULT '[]'::jsonb,
  highlights JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  reading_time INTEGER DEFAULT 0,
  bookmarked BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Políticas para articles
CREATE POLICY "Users can view own articles"
  ON public.articles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own articles"
  ON public.articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own articles"
  ON public.articles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own articles"
  ON public.articles FOR DELETE
  USING (auth.uid() = user_id);

-- 4. TABLA: reading_sessions
-- Almacena sesiones de lectura
-- ================================================
CREATE TABLE IF NOT EXISTS public.reading_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  words_read INTEGER DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para reading_sessions
CREATE POLICY "Users can view own reading sessions"
  ON public.reading_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading sessions"
  ON public.reading_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading sessions"
  ON public.reading_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading sessions"
  ON public.reading_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 5. TABLA: daily_statistics
-- Almacena estadísticas diarias
-- ================================================
CREATE TABLE IF NOT EXISTS public.daily_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  reading_time INTEGER DEFAULT 0,
  articles_read INTEGER DEFAULT 0,
  app_time INTEGER DEFAULT 0,
  pdf_downloads INTEGER DEFAULT 0,
  words_read INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas para daily_statistics
CREATE POLICY "Users can view own daily statistics"
  ON public.daily_statistics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily statistics"
  ON public.daily_statistics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily statistics"
  ON public.daily_statistics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily statistics"
  ON public.daily_statistics FOR DELETE
  USING (auth.uid() = user_id);

-- 6. TABLA: user_statistics
-- Almacena estadísticas generales del usuario
-- ================================================
CREATE TABLE IF NOT EXISTS public.user_statistics (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  total_reading_time INTEGER DEFAULT 0,
  total_app_time INTEGER DEFAULT 0,
  total_articles_read INTEGER DEFAULT 0,
  total_pdf_downloads INTEGER DEFAULT 0,
  total_words_read INTEGER DEFAULT 0,
  average_reading_speed INTEGER DEFAULT 0,
  longest_reading_session INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas para user_statistics
CREATE POLICY "Users can view own statistics"
  ON public.user_statistics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own statistics"
  ON public.user_statistics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own statistics"
  ON public.user_statistics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own statistics"
  ON public.user_statistics FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- FUNCIONES Y TRIGGERS
-- ================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_statistics_updated_at
  BEFORE UPDATE ON public.daily_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_statistics_updated_at
  BEFORE UPDATE ON public.user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear profile automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO public.user_statistics (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear profile automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_articles_user_id ON public.articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_folder_id ON public.articles(folder_id);
CREATE INDEX IF NOT EXISTS idx_articles_saved_at ON public.articles(saved_at);
CREATE INDEX IF NOT EXISTS idx_articles_notes ON public.articles USING GIN (notes);
CREATE INDEX IF NOT EXISTS idx_articles_highlights ON public.articles USING GIN (highlights);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON public.reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_article_id ON public.reading_sessions(article_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_date ON public.reading_sessions(date);
CREATE INDEX IF NOT EXISTS idx_daily_statistics_user_id ON public.daily_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_statistics_date ON public.daily_statistics(date);

-- ================================================
-- NOTAS IMPORTANTES
-- ================================================
-- 1. Todas las tablas tienen RLS habilitado
-- 2. Los usuarios solo pueden ver/modificar sus propios datos
-- 3. Al eliminar un usuario (DELETE CASCADE), se eliminan todos sus datos
-- 4. El trigger handle_new_user crea automáticamente profile y user_statistics
-- 5. Los triggers de updated_at actualizan el timestamp automáticamente
-- ================================================
