# Configuración de Google OAuth para iOS y Android

## Problema
La autenticación con Google no funciona en dispositivos móviles porque falta configurar correctamente el deep linking.

## Solución

### 1. Configurar URLs de Redirección en Supabase

Ve a tu proyecto de Supabase:
- URL: https://hodsrehnvqizglehqebm.supabase.co
- Ve a **Authentication** > **URL Configuration**
- Agrega las siguientes URLs en **Redirect URLs**:

```
app.rork.lectora://oauth/callback
http://localhost:8081
https://hodsrehnvqizglehqebm.supabase.co/auth/v1/callback
```

### 2. Configurar Google Cloud Console

#### Para iOS:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Credentials**
4. Edita tu OAuth 2.0 Client ID para iOS:
   - Client ID: `234427533598-pj5pp8tsig5nrp0qkesvlivltld77g6m.apps.googleusercontent.com`
5. En **Authorized redirect URIs**, agrega:
   ```
   app.rork.lectora://oauth/callback
   https://hodsrehnvqizglehqebm.supabase.co/auth/v1/callback
   ```
6. En **Bundle ID**, asegúrate de tener: `app.rork.lectora`

#### Para Android:
1. En el mismo proyecto de Google Cloud Console
2. Edita tu OAuth 2.0 Client ID para Android
3. En **Authorized redirect URIs**, agrega:
   ```
   app.rork.lectora://oauth/callback
   https://hodsrehnvqizglehqebm.supabase.co/auth/v1/callback
   ```
4. En **Package name**, asegúrate de tener: `app.rork.lectora`
5. Necesitas agregar el **SHA-1 certificate fingerprint**:
   - Para desarrollo, ejecuta:
     ```bash
     # Para Android
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
   - Copia el SHA-1 y agrégalo en Google Cloud Console

#### Para Web (ya configurado):
- Client ID: `234427533598-qaf73e3dts242495thjfs5nhpt6720pg.apps.googleusercontent.com`
- Client Secret: `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`

### 3. Actualizar app.json (Ya hecho ✅)

El archivo `app.json` ya tiene configurado el scheme correcto:
```json
{
  "scheme": "myapp"
}
```

Pero la app usará `app.rork.lectora://` como el deep link basado en el bundle identifier.

### 4. Probar la Configuración

1. Reinicia tu app en el dispositivo
2. Presiona "Iniciar sesión con Google"
3. Deberías ver:
   - Se abre el navegador con la página de Google
   - Seleccionas tu cuenta
   - Google te redirige de vuelta a la app
   - La app te lleva automáticamente a la home page

### 5. Debugging

Si todavía no funciona, revisa los logs:
- Busca en los logs: "Deep link recibido"
- Verifica que los tokens (access_token y refresh_token) estén presentes
- Asegúrate de que la URL de redirección de Google coincida con la configurada en Supabase

### Notas Importantes

1. **iOS**: El deep link usa el bundle identifier: `app.rork.lectora://`
2. **Android**: Usa el mismo esquema: `app.rork.lectora://`
3. **Web**: Usa el origin de la web: `window.location.origin`

### URLs de Redirección Finales

- **iOS/Android**: `app.rork.lectora://oauth/callback`
- **Web**: Automático (usa el origin)
- **Supabase Callback**: `https://hodsrehnvqizglehqebm.supabase.co/auth/v1/callback`
