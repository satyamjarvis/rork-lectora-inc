import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { useLanguage } from "@/providers/language-provider";
import { Eye, EyeOff, WifiOff, RefreshCw } from "lucide-react-native";

export default function SignupScreen() {
  const { signUp } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [isNetworkError, setIsNetworkError] = useState(false);

  const checkNetworkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok || response.status === 204;
    } catch {
      return false;
    }
  }, []);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError(t.auth.signup.fillAllFields);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.signup.passwordsDontMatch);
      return;
    }

    if (password.length < 6) {
      setError(t.auth.signup.passwordTooShort);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.auth.signup.invalidEmail || "El correo electrónico no es válido");
      return;
    }

    setError("");
    setIsNetworkError(false);
    setLoading(true);
    
    try {
      console.log('📱 Verificando conexión antes de registro...');
      const hasNetwork = await checkNetworkConnectivity();
      
      if (!hasNetwork) {
        console.log('❌ Sin conexión a internet');
        setIsNetworkError(true);
        setError(t.auth.signup.networkError || "Sin conexión a internet. Verifica tu conexión e intenta de nuevo.");
        setLoading(false);
        return;
      }
      
      console.log('✅ Conexión verificada, procediendo con registro...');
      await signUp(email, password, name);
      setSuccess(true);
      
      setTimeout(() => {
        router.push({
          pathname: "/(auth)/verify-email",
          params: { email }
        });
      }, 1500);
    } catch (err: any) {
      console.error('❌ Error en signup:', err);
      
      const errorMessage = err?.message || "Error al crear la cuenta";
      
      if (errorMessage.toLowerCase().includes('network') || 
          errorMessage.toLowerCase().includes('conexión') ||
          errorMessage.toLowerCase().includes('internet') ||
          errorMessage.toLowerCase().includes('fetch') ||
          errorMessage.toLowerCase().includes('timeout')) {
        setIsNetworkError(true);
        setError(t.auth.signup.networkError || "Error de conexión. Verifica tu internet e intenta de nuevo.");
      } else {
        setIsNetworkError(false);
        setError(errorMessage);
      }
      
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError("");
    setIsNetworkError(false);
    handleSignup();
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>{t.auth.signup.title}</Text>
            <Text style={styles.tagline}>{t.auth.signup.tagline}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t.auth.signup.name}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.auth.signup.namePlaceholder}
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                testID="name-input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t.auth.signup.email}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.auth.signup.emailPlaceholder}
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                testID="email-input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t.auth.signup.password}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder={t.auth.signup.passwordPlaceholder}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="password-input"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t.auth.signup.confirmPassword}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder={t.auth.signup.confirmPasswordPlaceholder}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="confirm-password-input"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                {isNetworkError && <WifiOff size={20} color={theme.colors.error} style={styles.errorIcon} />}
                <Text style={styles.error}>{error}</Text>
                {isNetworkError && (
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={handleRetry}
                    disabled={loading}
                  >
                    <RefreshCw size={16} color={theme.colors.primary} />
                    <Text style={styles.retryText}>
                      {t.auth.signup.retry || "Reintentar"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{t.auth.signup.accountCreated}</Text>
                <Text style={styles.successSubtext}>{t.auth.signup.redirecting}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.button, (loading || success) && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading || success}
              testID="signup-button"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : success ? (
                <Text style={styles.buttonText}>{t.auth.signup.accountCreated}</Text>
              ) : (
                <Text style={styles.buttonText}>{t.auth.signup.createAccount}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t.auth.signup.alreadyHaveAccount}</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.link}>{t.auth.signup.signIn}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    fontSize: 42,
    fontWeight: "700" as const,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  passwordContainer: {
    position: "relative" as const,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute" as const,
    right: 16,
    top: 14,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  errorContainer: {
    backgroundColor: `${theme.colors.error}15`,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    alignItems: "center" as const,
  },
  errorIcon: {
    marginBottom: 8,
  },
  error: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: "center" as const,
  },
  retryButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 8,
    gap: 6,
  },
  retryText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  successContainer: {
    backgroundColor: theme.colors.success || "#10B981",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  successText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
    textAlign: "center",
    marginBottom: 4,
  },
  successSubtext: {
    color: "#FFFFFF",
    fontSize: 13,
    textAlign: "center",
    opacity: 0.9,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    gap: 4,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
