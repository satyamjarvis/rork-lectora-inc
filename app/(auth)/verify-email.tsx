import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/providers/theme-provider";
import { useLanguage } from "@/providers/language-provider";
import { useAuth } from "@/providers/auth-provider";
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react-native";
import { supabase } from "@/lib/supabase";

export default function VerifyEmailScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { pendingVerification, attemptVerificationSignIn, clearPendingVerification } = useAuth();
  const params = useLocalSearchParams();
  const emailParam = typeof params.email === "string" ? params.email : undefined;
  const resolvedEmail = emailParam ?? pendingVerification?.email ?? "";
  
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const verifyAndRedirect = useCallback(() => {
    setVerified(true);
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 1200);
  }, []);

  const checkVerificationStatus = useCallback(async () => {
    try {
      console.log("Refreshing session before email verification check");
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.log("Refresh session error", refreshError.message);
      } else {
        console.log("Session refreshed", refreshData?.session?.expires_at);
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw userError;
      }

      const user = userData?.user;
      if (user?.email_confirmed_at || user?.confirmed_at) {
        console.log("Email confirmed at", user?.email_confirmed_at ?? user?.confirmed_at);
        verifyAndRedirect();
        return true;
      }

      console.log("Email not verified yet");
      return false;
    } catch (err: unknown) {
      console.log("Unexpected error while verifying email", err);
      throw err;
    }
  }, [verifyAndRedirect]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        console.log("Initial verification status check");
        const verifiedNow = await checkVerificationStatus();
        if (!verifiedNow && isMounted) {
          setVerified(false);
        }
      } catch (err: unknown) {
        console.log("Initial verification check failed", err);
        if (isMounted) {
          setError(t.auth.verifyEmail.checkError);
        }
      }
    };

    if (!pendingVerification) {
      initialize();
    } else {
      setVerified(false);
      setError("");
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event on verify page", event);
        if (event === "SIGNED_IN" && session) {
          verifyAndRedirect();
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [checkVerificationStatus, pendingVerification, t, verifyAndRedirect]);

  const handleResendEmail = async () => {
    if (!resolvedEmail) {
      setError(t.auth.verifyEmail.noEmail);
      return;
    }

    setResending(true);
    setError("");
    setResent(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resolvedEmail,
      });

      if (error) throw error;

      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: any) {
      console.error('Error resending email:', err);
      setError(err.message || t.auth.verifyEmail.resendError);
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    setError("");

    try {
      if (pendingVerification) {
        console.log("Attempting verification sign in with stored credentials");
        await attemptVerificationSignIn();
        verifyAndRedirect();
        return;
      }

      const verifiedNow = await checkVerificationStatus();
      if (!verifiedNow) {
        setError(t.auth.verifyEmail.notVerified);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || t.auth.verifyEmail.checkError);
      } else {
        setError(t.auth.verifyEmail.checkError);
      }
    } finally {
      setChecking(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID="verifyEmailScrollView"
      >
        <View style={styles.content}>
          {verified ? (
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, styles.successCircle]}>
                <CheckCircle2 size={64} color={theme.colors.success} />
              </View>
            </View>
          ) : (
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Mail size={64} color={theme.colors.primary} />
              </View>
            </View>
          )}

          <Text style={styles.title}>
            {verified ? t.auth.verifyEmail.verifiedTitle : t.auth.verifyEmail.title}
          </Text>

          {!verified && (
            <>
              <Text style={styles.description}>
                {t.auth.verifyEmail.description}
              </Text>

              {resolvedEmail ? (
                <View style={styles.emailContainer}>
                  <Text style={styles.email}>{resolvedEmail}</Text>
                </View>
              ) : null}

              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>
                  {t.auth.verifyEmail.instructionsTitle}
                </Text>
                <Text style={styles.instruction}>
                  1. {t.auth.verifyEmail.instruction1}
                </Text>
                <Text style={styles.instruction}>
                  2. {t.auth.verifyEmail.instruction2}
                </Text>
                <Text style={styles.instruction}>
                  3. {t.auth.verifyEmail.instruction3}
                </Text>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={20} color={theme.colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {resent ? (
                <View style={styles.successContainer}>
                  <CheckCircle2 size={20} color={theme.colors.success} />
                  <Text style={styles.successText}>{t.auth.verifyEmail.emailResent}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.button, checking && styles.buttonDisabled]}
                onPress={handleCheckVerification}
                disabled={checking}
                testID="checkVerificationButton"
              >
                {checking ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <CheckCircle2 size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>{t.auth.verifyEmail.checkButton}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, resending && styles.buttonDisabled]}
                onPress={handleResendEmail}
                disabled={resending}
                testID="resendVerificationButton"
              >
                {resending ? (
                  <ActivityIndicator color={theme.colors.primary} />
                ) : (
                  <>
                    <RefreshCw size={18} color={theme.colors.primary} />
                    <Text style={styles.secondaryButtonText}>
                      {t.auth.verifyEmail.resendButton}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {verified && (
            <>
              <Text style={styles.verifiedDescription}>
                {t.auth.verifyEmail.verifiedDescription}
              </Text>
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
            </>
          )}

          {!verified && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                clearPendingVerification();
                router.replace("/(auth)/login");
              }}
              testID="verifyEmailBackButton"
            >
              <Text style={styles.backButtonText}>{t.auth.verifyEmail.backToLogin}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  successCircle: {
    backgroundColor: theme.colors.success + "15",
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  verifiedDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  emailContainer: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  email: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.colors.primary,
    textAlign: "center",
  },
  instructionsContainer: {
    width: "100%",
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.error + "15",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  errorText: {
    flex: 1,
    color: theme.colors.error,
    fontSize: 14,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.success + "15",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  successText: {
    flex: 1,
    color: theme.colors.success,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  button: {
    width: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  backButton: {
    marginTop: 16,
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  loader: {
    marginTop: 16,
  },
});
