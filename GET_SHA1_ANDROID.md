# Cómo Obtener el SHA-1 para Google OAuth en Android

## ¿Por qué necesitas el SHA-1?

Google OAuth en Android requiere que registres el **SHA-1 certificate fingerprint** de tu app en Google Cloud Console. Esto es una medida de seguridad para verificar que tu app es legítima.

## Obtener SHA-1 para Desarrollo (Debug)

### Opción 1: Usando keytool (Recomendado)

```bash
# En macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# En Windows
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

Busca en la salida algo como:
```
Certificate fingerprint (SHA-1): A1:B2:C3:D4:E5:F6:78:90:12:34:56:78:90:AB:CD:EF:12:34:56:78
```

### Opción 2: Usando EAS (Si usas Expo)

Si estás usando EAS Build, puedes obtener el SHA-1 del build:

1. Haz un build de desarrollo:
   ```bash
   eas build --profile development --platform android
   ```

2. Ve a la página del build en Expo
3. Descarga el `.aab` o `.apk`
4. Extrae el certificado y obtén el SHA-1

## Registrar el SHA-1 en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Credentials**
4. Busca tu **OAuth 2.0 Client ID** para Android
5. Si no existe, créalo:
   - Click en "Create Credentials" > "OAuth client ID"
   - Tipo: Android
   - Package name: `app.rork.lectora`
   - SHA-1: (el que obtuviste arriba)

6. En **Authorized redirect URIs**, agrega:
   ```
   app.rork.lectora://oauth/callback
   https://hodsrehnvqizglehqebm.supabase.co/auth/v1/callback
   ```

## SHA-1 para Producción

Cuando subas tu app a Google Play, necesitarás también el SHA-1 del certificado de producción:

1. Ve a [Google Play Console](https://play.google.com/console/)
2. Selecciona tu app
3. Ve a **Release** > **Setup** > **App signing**
4. Copia el **SHA-1 certificate fingerprint**
5. Agrégalo también en Google Cloud Console (puedes tener múltiples SHA-1 en el mismo Client ID)

## Verificar que Funciona

Después de configurar el SHA-1:

1. Espera 5-10 minutos para que los cambios se propaguen
2. Cierra completamente tu app
3. Abre la app de nuevo
4. Intenta iniciar sesión con Google
5. Deberías poder autenticarte sin errores

## Problemas Comunes

### Error: "API_DISABLED"
- Asegúrate de que la API de Google+ esté habilitada en tu proyecto de Google Cloud

### Error: "DEVELOPER_ERROR"
- El SHA-1 no está configurado correctamente
- El package name no coincide con el de tu app
- Las URIs de redirección no están configuradas

### Error: "SIGN_IN_CANCELLED"
- El usuario canceló el inicio de sesión
- Esto es normal si el usuario presiona "Atrás"

### La app no recibe el deep link
- Verifica que el scheme esté configurado en `app.json`
- Asegúrate de que las redirect URIs en Supabase y Google Cloud coincidan
- Revisa los logs de la app para ver si el deep link se está recibiendo
