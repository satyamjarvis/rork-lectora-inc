# Checklist para Envío a Apple Store

## ⚠️ IMPORTANTE: Evitar Rechazos por Crashes

Apple ha rechazado tu app debido a crashes en el lanzamiento. He implementado las siguientes mejoras para solucionar estos problemas:

### 1. **Timeouts Reducidos**
   - Reducido timeout de autenticación de 30s a 8s
   - Reducido timeout de carga de perfil de infinito a 5s
   - Reducido timeout de carga de datos de infinito a 10s
   - Esto evita que la app se quede congelada esperando respuestas de Supabase

### 2. **Fallback en Caso de Errores**
   - Si la tabla de perfiles no está disponible, la app usa datos locales
   - Si hay timeout cargando datos, la app continúa sin datos en lugar de crashear
   - Todos los errores tienen manejo adecuado con try-catch

### 3. **Error Boundary Mejorado**
   - Captura todos los errores no manejados
   - Muestra una pantalla de error en lugar de crashear
   - Permite al usuario reintentar

## 📋 Checklist Pre-Envío

### ANTES DE CREAR EL BUILD:

1. **Verificar Configuración de Supabase**
   ```bash
   # Asegúrate de que estas variables estén en tus secrets de EAS:
   EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   EXPO_PUBLIC_SUPABASE_KEY=tu_key_de_supabase
   ```

2. **Verificar que Supabase está Funcionando**
   - Abre tu proyecto en Supabase Dashboard
   - Ve a Settings > API
   - Verifica que el proyecto está activo (no pausado)
   - Verifica que la tabla `profiles` existe
   - Verifica que las políticas RLS están configuradas correctamente

3. **Probar la App en Dispositivo Real**
   ```bash
   # Ejecuta en tu iPhone/iPad:
   npx expo start
   # Escanea el QR y prueba:
   # - Login/Signup
   # - Cargar artículos
   # - Ver estadísticas
   ```

4. **Verificar Logs en Consola**
   - Durante las pruebas, busca mensajes de error
   - Especialmente busca: "Timeout", "Error", "Failed"
   - Si ves timeouts frecuentes, puede ser problema de conexión a Supabase

### PROBLEMAS COMUNES Y SOLUCIONES:

#### ❌ "Could not find the table 'public.profiles'"
**Solución:**
```sql
-- Ejecuta esto en Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilita RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### ❌ "Auth check timeout"
**Solución:**
- Verifica tu conexión a internet
- Verifica que Supabase no está pausado
- Si persiste, aumenta el timeout en `providers/auth-provider.tsx` línea 154

#### ❌ "Profile load timeout"
**Solución:**
- La app ahora usa fallback automático
- El usuario puede usar la app con datos locales
- Esto NO debería causar crashes

### TESTING EN iPad ESPECÍFICAMENTE:

Dado que Apple probó en **iPad Air (5th generation) con iPadOS 26.1**, asegúrate de:

1. **Probar en iPad si es posible**
   - Usa TestFlight para distribuir a tu iPad
   - Prueba específicamente en iPad Air si tienes acceso

2. **Verificar Layouts en iPad**
   - Los layouts deben verse bien en pantallas grandes
   - Los modales deben funcionar correctamente
   - El tab bar debe ser visible

3. **Probar Conexión Lenta**
   - En Settings > Developer > Network Link Conditioner
   - Prueba con "3G" o "LTE" para simular conexión lenta
   - La app NO debe crashear, solo mostrar loading más largo

### ANTES DE ENVIAR A REVISIÓN:

✅ La app inicia sin crashes  
✅ Login/Signup funciona correctamente  
✅ La app funciona con conexión lenta  
✅ La app funciona sin conexión (muestra mensaje apropiado)  
✅ No hay logs de "timeout" en consola  
✅ Probado en iPad (preferiblemente)  
✅ Error boundary captura y muestra errores sin crashear  
✅ Supabase está activo y respondiendo  

## 🚀 Crear Build para Revisión

```bash
# 1. Verifica que todo está bien:
npm run typecheck
npm run lint

# 2. Crea build de producción:
eas build --platform ios --profile production

# 3. Cuando termine, envía a TestFlight:
eas submit --platform ios

# 4. Prueba en TestFlight antes de enviar a revisión
```

## 📞 Si Apple Rechaza de Nuevo

Si Apple rechaza por crashes:

1. **Pide los crash logs detallados**
   - En App Store Connect > TestFlight > Crashes
   - Descarga los crash logs
   - Busca la línea específica que causa el crash

2. **Revisa los logs de la app**
   - Busca mensajes de console.log/console.error
   - Identifica qué timeout se está activando

3. **Contacta con el soporte**
   - Explica que has implementado timeouts y fallbacks
   - Pide más información sobre el crash específico

## 🔧 Cambios Implementados en Este Fix

### `providers/auth-provider.tsx`
- ✅ Timeout de autenticación reducido a 8s
- ✅ Timeout de carga de perfil a 5s
- ✅ Fallback automático si no se puede cargar perfil
- ✅ Manejo robusto de errores de red

### `providers/articles-provider.tsx`
- ✅ Timeout de carga de datos a 10s
- ✅ Fallback a datos vacíos en caso de timeout
- ✅ Logs detallados para debugging

### `app/_layout.tsx`
- ✅ Reducido tiempo de preparación de 100ms a 50ms
- ✅ Splash screen se oculta más rápido
- ✅ Error boundary envolviendo toda la app

### `components/ErrorBoundary.tsx`
- ✅ Captura todos los errores no manejados
- ✅ Muestra UI amigable al usuario
- ✅ Permite reintentar sin reiniciar la app

## ⚡ Optimizaciones de Performance

Estos cambios también mejoran el rendimiento:
- Inicialización más rápida (50ms vs 100ms)
- Timeouts más cortos = feedback más rápido al usuario
- Fallbacks = mejor experiencia aunque Supabase esté lento
- Error boundaries = nunca más white screen of death

## 📝 Notas Finales

- La app ahora es mucho más resiliente a problemas de red
- Los timeouts son agresivos pero razonables
- El usuario siempre ve algo (aunque sea un error bonito)
- Los logs te ayudarán a debuggear si hay problemas

**¡Buena suerte con la revisión! 🍀**
