import React, { useState } from "react";
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
import { Eye, EyeOff, AlertCircle, Globe } from "lucide-react-native";

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const { theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const showGoogleSignIn: boolean = false;

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t.auth.login.fillAllFields);
      return;
    }

    setError("");
    setLoading(true);
    
    try {
      await signIn(email, password);
    } catch (err: any) {
      const errorMsg = err.message || "Error al iniciar sesión";
      if (errorMsg.includes("Invalid") || errorMsg.includes("credentials") || errorMsg.includes("Email not confirmed") || errorMsg.includes("User not found")) {
        setError("credentials_not_found");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
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
          <View style={styles.languageSelector}>
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => setShowLanguageMenu(!showLanguageMenu)}
            >
              <Globe size={20} color={theme.colors.primary} />
              <Text style={styles.languageButtonText}>
                {language === "en" ? "English" : "Español"}
              </Text>
            </TouchableOpacity>
            
            {showLanguageMenu && (
              <View style={styles.languageMenu}>
                <TouchableOpacity
                  style={styles.languageOption}
                  onPress={() => {
                    setLanguage("en");
                    setShowLanguageMenu(false);
                  }}
                >
                  <Text style={[styles.languageOptionText, language === "en" && styles.languageOptionActive]}>
                    English
                  </Text>
                </TouchableOpacity>
                <View style={styles.languageSeparator} />
                <TouchableOpacity
                  style={styles.languageOption}
                  onPress={() => {
                    setLanguage("es");
                    setShowLanguageMenu(false);
                  }}
                >
                  <Text style={[styles.languageOptionText, language === "es" && styles.languageOptionActive]}>
                    Español
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.header}>
            <Text style={styles.logo}>{t.auth.login.title}</Text>
            <Text style={styles.tagline}>{t.auth.login.tagline}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t.auth.login.email}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.auth.login.emailPlaceholder}
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
              <Text style={styles.label}>{t.auth.login.password}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder={t.auth.login.passwordPlaceholder}
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

            {error ? (
              error === "credentials_not_found" ? (
                <View style={styles.errorContainer}>
                  <View style={styles.errorHeader}>
                    <AlertCircle size={20} color={theme.colors.error} />
                    <Text style={styles.errorTitle}>{t.auth.login.credentialsNotFound}</Text>
                  </View>
                  <Text style={styles.errorMessage}>
                    {t.auth.login.credentialsNotFoundDescription}
                  </Text>
                  <TouchableOpacity 
                    style={styles.errorButton}
                    onPress={() => router.push("/(auth)/signup")}
                  >
                    <Text style={styles.errorButtonText}>{t.auth.login.createAccount}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.error}>{error}</Text>
              )
            ) : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              testID="login-button"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{t.auth.login.signIn}</Text>
              )}
            </TouchableOpacity>

            {showGoogleSignIn && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t.auth.login.orContinueWith}</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={async () => {
                    try {
                      setError("");
                      await signInWithGoogle();
                    } catch (err: any) {
                      setError(err.message || "Error al iniciar sesión con Google");
                    }
                  }}
                  disabled={loading}
                >
                  <Text style={styles.googleButtonText}>{t.auth.login.google}</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t.auth.login.dontHaveAccount}</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.link}>{t.auth.login.signUp}</Text>
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
  languageSelector: {
    position: "absolute" as const,
    top: 16,
    right: 24,
    zIndex: 10,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: theme.colors.text,
  },
  languageMenu: {
    position: "absolute" as const,
    top: 42,
    right: 0,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  languageOptionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  languageOptionActive: {
    color: theme.colors.primary,
    fontWeight: "600" as const,
  },
  languageSeparator: {
    height: 1,
    backgroundColor: theme.colors.border,
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
  error: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: theme.colors.errorBackground || (theme.isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.08)"),
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.errorBorder || (theme.isDark ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.15)"),
  },
  errorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.colors.error,
  },
  errorMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  errorButton: {
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    paddingHorizontal: 16,
  },
  googleButton: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    justifyContent: "center",
  },
  googleButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
