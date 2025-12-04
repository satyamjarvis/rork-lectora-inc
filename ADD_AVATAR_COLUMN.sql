-- Agregar columna de avatar_url a la tabla profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Crear un bucket en Storage para avatares (ejecutar en Supabase Dashboard > Storage)
-- Name: avatars
-- Public: true
-- File size limit: 2MB
-- Allowed MIME types: image/*

-- Políticas de Storage para el bucket 'avatars'
-- Ejecutar estas políticas en: Storage > avatars > Policies

-- Política 1: Permitir a los usuarios subir su propio avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política 2: Permitir que todos vean los avatares (públicos)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Política 3: Permitir a los usuarios actualizar su propio avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política 4: Permitir a los usuarios eliminar su propio avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
