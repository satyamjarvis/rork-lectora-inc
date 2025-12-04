import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from 'expo-linking';
import React, { useEffect } from "react";
import { Platform, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { ArticlesProvider } from "@/providers/articles-provider";
import { StatisticsProvider } from "@/providers/statistics-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { LanguageContext } from "@/providers/language-provider";
import { trpc, trpcClient } from "@/lib/trpc";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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

function ConfigErrorScreen() {
  const missing = supabaseConfig.missingVariables;

  const handleReload = () => {
    if (Platform.OS === 'web') {
      globalThis?.location?.reload();
      return;
    }

    SplashScreen.hideAsync()
      .then(() => {
        console.log('Splash oculto después de intentar reintentar configuración');
      })
      .catch((error) => {
        console.error('No se pudo ocultar el splash:', error);
      });
  };

  return (
    <View style={styles.configContainer} testID="config-error-screen">
      <View style={styles.configCard} testID="config-error-card">
        <Text style={styles.configTitle}>Configuración incompleta</Text>
        <Text style={styles.configSubtitle}>
          Agrega las variables de Supabase al build antes de enviar a revisión para evitar cierres inesperados al iniciar.
        </Text>
        <View style={styles.configList}>
          {missing.map((item) => (
            <Text key={item} style={styles.configListItem} testID={`config-missing-${item}`}>
              • {item}
            </Text>
          ))}
        </View>
        <TouchableOpacity
          style={styles.reloadButton}
          onPress={handleReload}
          activeOpacity={0.85}
          testID="config-retry-button"
        >
          <Text style={styles.reloadButtonText}>Reintentar</Text>
        </TouchableOpacity>
        <Text style={styles.configHelp}>
          Revisa SUPABASE_SETUP.md para los pasos completos.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  configContainer: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  configCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 32,
    backgroundColor: '#0F172A',
    paddingVertical: 28,
    paddingHorizontal: 32,
    shadowColor: '#010409',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.35,
    shadowRadius: 50,
    elevation: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  configTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  configSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 24,
    marginBottom: 20,
  },
  configList: {
    marginBottom: 24,
    gap: 8,
  },
  configListItem: {
    fontSize: 16,
    color: '#FBBF24',
    fontWeight: '600',
  },
  reloadButton: {
    backgroundColor: '#2563EB',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  configHelp: {
    fontSize: 13,
    color: '#93C5FD',
    textAlign: 'center',
  },
});

export default function RootLayout() {
  const [appReady, setAppReady] = React.useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        console.log('🚀 Preparando app...');
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error('Error preparando app:', error);
      } finally {
        setAppReady(true);
      }
    };
    
    prepare();
  }, []);

  useEffect(() => {
    if (appReady) {
      const hideSplash = async () => {
        try {
          // Give a bit more time for layout to settle
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('👋 Ocultando splash screen...');
          await SplashScreen.hideAsync();
          console.log('✅ Splash screen oculto');
        } catch (error) {
          console.error('❌ Error ocultando splash screen:', error);
        }
      };
      
      hideSplash();
    }
  }, [appReady]);

  useEffect(() => {
    if (!supabaseConfig.isConfigured) {
      return;
    }

    const handleDeepLink = async (url: string) => {
      console.log('🔗 Deep link recibido:', url);
      
      if (Platform.OS === 'web') {
        return;
      }

      try {
        const parsedUrl = Linking.parse(url);
        try {
          console.log('🔗 URL parseada:', JSON.stringify(parsedUrl, null, 2));
        } catch (e) {
          console.log('🔗 URL parseada: [Error serializing]');
        }

        if (parsedUrl.path?.includes('oauth/callback') || url.includes('access_token=')) {
          console.log('🔐 Detectado callback de OAuth');
          
          const hashIndex = url.indexOf('#');
          if (hashIndex !== -1) {
            const hash = url.substring(hashIndex + 1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            
            console.log('🔑 Access token presente:', !!accessToken);
            console.log('🔑 Refresh token presente:', !!refreshToken);
            
            if (accessToken && refreshToken) {
              console.log('✅ Estableciendo sesión...');
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (error) {
                console.error('❌ Error al establecer sesión:', error);
              } else {
                console.log('✅ Sesión establecida exitosamente');
                console.log('✅ Usuario:', data.user?.email);
              }
            } else {
              console.warn('⚠️ No se encontraron tokens en la URL');
            }
          } else {
            console.warn('⚠️ URL no contiene fragmento (#)');
          }
        }
      } catch (error) {
        console.error('❌ Error procesando deep link:', error);
      }
    };

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 Initial URL:', url);
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!supabaseConfig.isConfigured) {
    return (
      <ErrorBoundary>
        <ConfigErrorScreen />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AppProviders>
        <RootLayoutNav />
      </AppProviders>
    </ErrorBoundary>
  );
}