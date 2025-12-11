import { useState, useEffect, useCallback, useMemo } from "react";
import { Platform, Linking as RNLinking } from "react-native";
import * as ExpoLinking from "expo-linking";
import createContextHook from "@nkzw/create-context-hook";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import type { AuthApiError, User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  avatar_storage_path?: string | null;
}

interface PendingVerification {
  email: string;
  password: string;
  name: string;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);
  const [isProfilesTableAvailable, setIsProfilesTableAvailable] = useState(true);

  const buildFallbackUser = useCallback((supabaseUser: SupabaseUser): User => {
    const fallbackEmail = supabaseUser.email ?? 'usuario@local';
    const computedName = supabaseUser.user_metadata?.name ?? fallbackEmail.split('@')[0] ?? 'Usuario';
    return {
      id: supabaseUser.id,
      email: fallbackEmail,
      name: computedName,
      avatar_url: null,
      avatar_storage_path: null,
    };
  }, []);

  const handleProfilesTableMissing = useCallback((supabaseUser: SupabaseUser) => {
    console.warn('⚠️ Tabla profiles no disponible. Generando perfil local.');
    setIsProfilesTableAvailable(false);
    setUser(buildFallbackUser(supabaseUser));
    setPendingVerification(null);
  }, [buildFallbackUser]);

  const isProfilesTableMissingError = useCallback((error?: { code?: string; message?: string }) => {
    if (!error) return false;
    const normalizedMessage = error.message?.toLowerCase() ?? '';
    return (
      error.code === '42P01' ||
      normalizedMessage.includes("could not find the table 'public.profiles'") ||
      normalizedMessage.includes('relation "public.profiles" does not exist') ||
      normalizedMessage.includes('schema cache') ||
      normalizedMessage.includes('public.profiles does not exist')
    );
  }, []);

  const resolveAvatarUrl = useCallback((rawAvatarUrl: string | null | undefined, stamp?: number) => {
    if (!rawAvatarUrl) {
      return null;
    }

    const cacheBustStamp = stamp ?? Date.now();

    if (/^https?:\/\//i.test(rawAvatarUrl)) {
      const separator = rawAvatarUrl.includes('?') ? '&' : '?';
      return `${rawAvatarUrl}${separator}cb=${cacheBustStamp}`;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(rawAvatarUrl);

    const publicUrl = data?.publicUrl;

    if (!publicUrl) {
      console.warn('⚠️ No se obtuvo URL pública para el avatar.');
      return null;
    }

    const separator = publicUrl.includes('?') ? '&' : '?';
    return `${publicUrl}${separator}cb=${cacheBustStamp}`;
  }, []);

  const loadUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      const profileTimeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Profile load timeout')), 5000)
      );
      
      const profileQuery = supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id);
      
      let result;
      try {
        result = await Promise.race([profileQuery, profileTimeout]);
      } catch {
        console.warn('⏱️ Timeout cargando perfil, usando fallback');
        handleProfilesTableMissing(supabaseUser);
        return;
      }

      const { data: profiles, error } = result as any;

      if (error) {
        console.error('❌ Error loading profile:', error.message || 'Unknown error');

        if (isProfilesTableMissingError(error)) {
          handleProfilesTableMissing(supabaseUser);
          return;
        }

        console.log('⚠️ Error desconocido al cargar perfil, usando fallback');
        handleProfilesTableMissing(supabaseUser);
        return;
      }

      const profile = profiles && profiles.length > 0 ? profiles[0] : null;

      if (!profile) {
        console.log('⚠️ Perfil no existe, usando fallback');
        handleProfilesTableMissing(supabaseUser);
        return;
      }

      setIsProfilesTableAvailable(true);
      const resolvedAvatarUrl = resolveAvatarUrl(profile.avatar_url);
      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar_url: resolvedAvatarUrl,
        avatar_storage_path: profile.avatar_url ?? null,
      });
      console.log('✅ Perfil cargado:', profile.name);
      setPendingVerification(null);
    } catch (error: any) {
      console.error('❌ Error loading user profile:', error?.message || error);
    }
  }, [resolveAvatarUrl, handleProfilesTableMissing, isProfilesTableMissingError]);

  const checkAuthStatus = useCallback(async () => {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase cliente no disponible, continuando sin autenticación');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      console.log('🔍 Verificando estado de autenticación...');
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Auth check timeout')), 5000)
      );
      
      const sessionPromise = supabase.auth.getSession();
      
      let result;
      try {
        result = await Promise.race([sessionPromise, timeoutPromise]);
      } catch {
        console.warn('⏱️ Timeout al verificar autenticación, continuando sin sesión');
        setUser(null);
        setIsLoading(false);
        return;
      }

      const { data, error } = result as { data: { session: { user: SupabaseUser } | null }; error: { message?: string } | null };
      const session = data?.session;

      if (error) {
        const errorMsg = error.message || '';
        if (errorMsg.includes('Refresh Token') || errorMsg.includes('Invalid') || errorMsg.includes('Network')) {
          console.log('🗑️ Sesión inválida o error de red, limpiando estado');
          try {
            await Promise.race([
              supabase.auth.signOut(),
              new Promise((resolve) => setTimeout(resolve, 1500))
            ]);
          } catch {
            console.warn('⚠️ No se pudo limpiar la sesión');
          }
        } else {
          console.warn('⚠️ Error en sesión:', errorMsg);
        }
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        console.log('✅ Sesión activa encontrada:', session.user.email);
        await loadUserProfile(session.user);
      } else {
        console.log('ℹ️ No hay sesión activa');
        setUser(null);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('⚠️ Error en autenticación:', errorMessage);
      setUser(null);
    } finally {
      console.log('✅ Verificación completada');
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  useEffect(() => {
    if (!supabase) {
      console.warn('⚠️ Supabase no inicializado, omitiendo auth');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    
    const initAuth = async () => {
      try {
        await checkAuthStatus();
      } catch (e) {
        console.warn('⚠️ Error en checkAuthStatus:', e);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };
    
    initAuth();

    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;
          
          console.log('Auth event:', event);
          if (session?.user) {
            await loadUserProfile(session.user);
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              console.log('✅ Usuario autenticado, redirigiendo a home...');
              router.replace('/(tabs)');
            }
          } else {
            setUser(null);
          }
        }
      );
      authListener = data;
    } catch (listenerError) {
      console.warn('⚠️ Error configurando listener de auth:', listenerError);
    }

    return () => {
      isMounted = false;
      try {
        authListener?.subscription?.unsubscribe();
      } catch {
        // Ignore unsubscribe errors
      }
    };
  }, [checkAuthStatus, loadUserProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user);
        setPendingVerification(null);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }, [loadUserProfile]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      console.log('📝 Iniciando registro de usuario...');
      
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name,
          },
        },
      });
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 15000)
      );
      
      let result;
      try {
        result = await Promise.race([signUpPromise, timeoutPromise]);
      } catch (raceError: any) {
        if (raceError?.message === 'TIMEOUT') {
          console.error('⏱️ Timeout durante el registro');
          throw new Error('La solicitud tardó demasiado. Verifica tu conexión a internet e intenta de nuevo.');
        }
        throw raceError;
      }
      
      const { data, error } = result;

      if (error) {
        console.error('❌ Error de Supabase en signup:', error);
        
        if (error.message?.toLowerCase().includes('network') || 
            error.message?.toLowerCase().includes('fetch') ||
            error.message?.toLowerCase().includes('connection')) {
          throw new Error('Error de conexión. Verifica tu internet e intenta de nuevo.');
        }
        
        if (error.message?.toLowerCase().includes('already registered') ||
            error.message?.toLowerCase().includes('user already exists')) {
          throw new Error('Este correo ya está registrado. Intenta iniciar sesión.');
        }
        
        if (error.message?.toLowerCase().includes('invalid email')) {
          throw new Error('El correo electrónico no es válido.');
        }
        
        if (error.message?.toLowerCase().includes('password')) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }
        
        throw new Error(error.message || 'Error al crear la cuenta. Intenta de nuevo.');
      }

      if (!data?.user) {
        throw new Error('No se pudo completar el registro. Intenta de nuevo.');
      }

      console.log('✅ Usuario creado exitosamente:', data.user.id);
      
      const hasActiveSession = Boolean(data.session?.access_token);

      if (!hasActiveSession) {
        console.log('🔐 Registro requiere verificación de correo antes de crear el perfil. Se creará automáticamente después de confirmar.');
        setPendingVerification({ email, password, name });
        return;
      }

      console.log('✅ Usuario registrado, esperando creación automática de perfil...');

      await new Promise(resolve => setTimeout(resolve, 1500));

      await loadUserProfile(data.user);
      setPendingVerification(null);
    } catch (error: any) {
      console.error('❌ Sign up error completo:', error);
      console.error('❌ Mensaje:', error?.message);
      
      if (error?.message?.includes('Network request failed') || 
          error?.message?.includes('network') ||
          error?.message?.includes('Failed to fetch') ||
          error?.name === 'TypeError') {
        throw new Error('Error de conexión. Verifica tu internet e intenta de nuevo.');
      }
      
      throw new Error(error?.message || 'Error al registrarse. Por favor intenta de nuevo.');
    }
  }, [loadUserProfile]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setPendingVerification(null);
      router.replace('/(auth)/login');
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Error al cerrar sesión');
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      if (!user) throw new Error('No hay usuario autenticado');

      const { error } = await supabase.rpc('delete_user_account');

      if (error) {
        console.log('RPC error, trying direct deletion:', error);
        await supabase.auth.signOut();
      }

      setUser(null);
      setPendingVerification(null);
      router.replace('/(auth)/login');
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw new Error(error.message || 'Error al eliminar cuenta');
    }
  }, [user]);

  const uploadAvatar = useCallback(async (uri: string): Promise<string> => {
    try {
      if (!user) throw new Error('No hay usuario autenticado');
      if (!isProfilesTableAvailable) {
        throw new Error('El perfil del usuario aún no está listo en el servidor. Contacta al administrador.');
      }

      console.log('🔄 Iniciando subida de avatar...');
      console.log('📂 URI:', uri);
      console.log('📱 Platform:', Platform.OS);

      let blob: Blob;
      let actualFileType = 'jpg';

      console.log('📂 Obteniendo archivo...');
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Error al obtener la imagen: ${response.status}`);
      }

      blob = await response.blob();
      console.log('📦 Blob obtenido:', blob.size, 'bytes, tipo:', blob.type);

      if (blob.type) {
        const typeMatch = blob.type.match(/image\/(\w+)/);
        if (typeMatch) {
          actualFileType = typeMatch[1] === 'jpeg' ? 'jpg' : typeMatch[1];
        }
      }

      const fileExt = actualFileType;
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const contentType = `image/${fileExt}`;

      console.log('📝 Archivo info:', { fileName, contentType, size: blob.size });

      console.log('📦 Archivo preparado:', fileName);

      console.log('🗑️ Verificando archivos anteriores...');
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (listError) {
        console.error('⚠️ Error al listar archivos (puede ser normal si el bucket está vacío):', listError);
      }

      if (existingFiles && existingFiles.length > 0) {
        console.log('🗑️ Eliminando', existingFiles.length, 'archivos anteriores...');
        for (const file of existingFiles) {
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${file.name}`]);

          if (deleteError) {
            console.warn('⚠️ Error al eliminar archivo anterior:', deleteError);
          }
        }
      }

      console.log('⬆️ Subiendo archivo a Supabase Storage...');

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType,
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('❌ Error al subir archivo:', uploadError);
        console.error('❌ Mensaje:', uploadError.message);

        if (uploadError.message?.includes('not found')) {
          throw new Error('El bucket "avatars" no existe. Por favor contacta al administrador para configurar el almacenamiento.');
        }
        if (uploadError.message?.includes('policy')) {
          throw new Error('No tienes permisos para subir imágenes. Por favor contacta al administrador.');
        }
        throw new Error(uploadError.message || 'Error al subir la imagen');
      }

      console.log('✅ Archivo subido exitosamente:', uploadData);

      console.log('💾 Actualizando perfil en base de datos...');
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: fileName })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Error al actualizar perfil:', error);
        throw new Error('Error al actualizar el perfil: ' + error.message);
      }

      const resolvedAvatarUrl = resolveAvatarUrl(fileName);

      if (!resolvedAvatarUrl) {
        throw new Error('No se pudo generar la URL pública del avatar actualizado.');
      }

      setUser(prev => (prev ? {
        ...prev,
        avatar_url: resolvedAvatarUrl,
        avatar_storage_path: fileName,
      } : prev));
      console.log('✅ Avatar actualizado exitosamente');
      return resolvedAvatarUrl;
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error mensaje:', error.message);
      console.error('❌ Error detalles:', JSON.stringify(error, null, 2));

      if (error.message?.includes('bucket')) {
        throw error;
      }
      if (error.message?.includes('permisos')) {
        throw error;
      }

      throw new Error(error.message || 'Error al subir avatar. Por favor intenta de nuevo.');
    }
  }, [user, resolveAvatarUrl, isProfilesTableAvailable]);

  const deleteAvatar = useCallback(async () => {
    try {
      if (!user) throw new Error('No hay usuario autenticado');
      if (!isProfilesTableAvailable) {
        throw new Error('El perfil del usuario aún no está listo en el servidor. Contacta al administrador.');
      }

      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        for (const file of existingFiles) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${file.name}`]);
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => (prev ? {
        ...prev,
        avatar_url: null,
        avatar_storage_path: null,
      } : prev));
      console.log('✅ Avatar eliminado');
    } catch (error: any) {
      console.error('Error deleting avatar:', error);
      throw new Error(error.message || 'Error al eliminar avatar');
    }
  }, [user, isProfilesTableAvailable]);

  const clearPendingVerification = useCallback(() => {
    setPendingVerification(null);
  }, []);

  const attemptVerificationSignIn = useCallback(async () => {
    if (!pendingVerification) {
      throw new Error('No existe una solicitud de verificación pendiente.');
    }

    try {
      console.log('Intentando iniciar sesión tras verificación de email');
      const { email: pendingEmail, password: pendingPassword } = pendingVerification;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: pendingEmail,
        password: pendingPassword,
      });

      if (error) {
        if ((error as AuthApiError).message?.toLowerCase().includes('confirm')) {
          throw new Error('Tu correo aún no ha sido confirmado. Intenta nuevamente en unos segundos.');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('No se pudo completar la verificación. Intenta de nuevo.');
      }

      setPendingVerification(null);
      await loadUserProfile(data.user);
      return data.user;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('No se pudo completar la verificación');
    }
  }, [pendingVerification, loadUserProfile]);

  const signInWithGoogle = useCallback(async () => {
    try {
      console.log('🔐 Iniciando autenticación con Google...');
      console.log('📱 Platform:', Platform.OS);

      const redirectTo = Platform.OS === 'web'
        ? globalThis?.location?.origin ?? ''
        : ExpoLinking.createURL('/oauth/callback');

      if (!redirectTo) {
        throw new Error('No se pudo determinar la URL de retorno para OAuth');
      }

      console.log('🔁 redirectTo configurado en:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) {
        console.error('❌ Error en OAuth:', error);
        throw error;
      }

      console.log('✅ OAuth response:', data);

      if (!data?.url) {
        console.error('❌ No URL returned from OAuth');
        throw new Error('No se recibió URL de autenticación');
      }

      console.log('🔗 Opening OAuth URL:', data.url);

      if (Platform.OS === 'web') {
        globalThis.location.href = data.url;
        return;
      }

      const supported = await RNLinking.canOpenURL(data.url);
      if (!supported) {
        console.error('❌ Cannot open URL:', data.url);
        throw new Error('No se puede abrir la URL de autenticación');
      }

      await RNLinking.openURL(data.url);
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Error al iniciar sesión con Google');
    }
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    deleteAccount,
    uploadAvatar,
    deleteAvatar,
    pendingVerification,
    clearPendingVerification,
    attemptVerificationSignIn,
    signInWithGoogle,
    profileFeaturesReady: isProfilesTableAvailable,
  }), [
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    deleteAccount,
    uploadAvatar,
    deleteAvatar,
    pendingVerification,
    clearPendingVerification,
    attemptVerificationSignIn,
    signInWithGoogle,
    isProfilesTableAvailable,
  ]);
});
