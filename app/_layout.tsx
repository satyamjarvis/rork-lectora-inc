import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from 'expo-linking';
import React, { useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { ArticlesProvider } from "@/providers/articles-provider";
import { StatisticsProvider } from "@/providers/statistics-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { LanguageContext } from "@/providers/language-provider";
import { trpc, trpcClient } from "@/lib/trpc";
import { ErrorBoundaryWrapper } from "@/components/ErrorBoundaryWrapper";
import { supabase, supabaseConfig } from "@/lib/supabase";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="reader/[id]" 
        options={{ 
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "slide_from_bottom"
        }} 
      />
      <Stack.Screen name="help" options={{ headerShown: true, title: "Ayuda" }} />
      <Stack.Screen name="privacy" options={{ headerShown: true, title: "Privacidad" }} />
      <Stack.Screen name="archived" options={{ headerShown: true, title: "Archivados" }} />
      <Stack.Screen name="folder/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="export-pdf" options={{ headerShown: true, title: "Exportar PDF" }} />
    </Stack>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <LanguageContext>
              <ThemeProvider>
                <AuthProvider>
                  <ArticlesProvider>
                    <StatisticsProvider>
                      {children}
                    </StatisticsProvider>
                  </ArticlesProvider>
                </AuthProvider>
              </ThemeProvider>
            </LanguageContext>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}



export default function RootLayout() {
  const appReadyRef = useRef(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        if (__DEV__) {
          console.log('🚀 Preparando app...');
          console.log('🔧 Supabase configurado:', supabaseConfig.isConfigured);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        if (__DEV__) {
          console.error('Error preparando app:', error);
        }
      } finally {
        appReadyRef.current = true;
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          if (__DEV__) {
            console.log('👋 Ocultando splash screen...');
          }
          await SplashScreen.hideAsync();
          if (__DEV__) {
            console.log('✅ Splash screen oculto');
          }
        } catch (splashError) {
          if (__DEV__) {
            console.warn('⚠️ Error ocultando splash:', splashError);
          }
        }
      }
    };
    
    prepare();
  }, []);

  const handleDeepLink = useCallback(async (url: string) => {
    if (__DEV__) {
      console.log('🔗 Deep link recibido:', url);
    }
    
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const parsedUrl = Linking.parse(url);
      if (__DEV__) {
        try {
          console.log('🔗 URL parseada:', JSON.stringify(parsedUrl, null, 2));
        } catch {
          console.log('🔗 URL parseada: [Error serializing]');
        }
      }

      if (parsedUrl.path?.includes('oauth/callback') || url.includes('access_token=')) {
        if (__DEV__) {
          console.log('🔐 Detectado callback de OAuth');
        }
        
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          const hash = url.substring(hashIndex + 1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (__DEV__) {
            console.log('🔑 Access token presente:', !!accessToken);
            console.log('🔑 Refresh token presente:', !!refreshToken);
          }
          
          if (accessToken && refreshToken) {
            if (__DEV__) {
              console.log('✅ Estableciendo sesión...');
            }
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              if (__DEV__) {
                console.error('❌ Error al establecer sesión:', error);
              }
            } else {
              if (__DEV__) {
                console.log('✅ Sesión establecida exitosamente');
                console.log('✅ Usuario:', data.user?.email);
              }
            }
          } else {
            if (__DEV__) {
              console.warn('⚠️ No se encontraron tokens en la URL');
            }
          }
        } else {
          if (__DEV__) {
            console.warn('⚠️ URL no contiene fragmento (#)');
          }
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error procesando deep link:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!supabaseConfig.isConfigured) {
      if (__DEV__) {
        console.warn('⚠️ Supabase no configurado, deep links deshabilitados');
      }
      return;
    }

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) {
        if (__DEV__) {
          console.log('🔗 Initial URL:', url);
        }
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  return (
    <ErrorBoundaryWrapper>
      <AppProviders>
        <RootLayoutNav />
      </AppProviders>
    </ErrorBoundaryWrapper>
  );
}