import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useTheme } from "@/providers/theme-provider";
import { useLanguage } from "@/providers/language-provider";
import { X } from "lucide-react-native";

interface AddArticleModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (url: string) => Promise<void>;
}

function LoadingDots() {
  const { theme } = useTheme();
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return ".";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Text style={{ fontSize: 20, color: theme.colors.primary, fontWeight: "600" as const }}>
      {dots}
    </Text>
  );
}

export default function AddArticleModal({ visible, onClose, onAdd }: AddArticleModalProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleAdd = async () => {
    if (!url.trim()) {
      setError(t.addArticleModal.errors.enterUrl);
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError(t.addArticleModal.errors.invalidUrl);
      return;
    }

    setError("");
    setLoading(true);
    setLoadingMessage(t.addArticleModal.loading.extracting);

    try {
      await onAdd(url);
      setUrl("");
      setLoadingMessage(t.addArticleModal.loading.success);
      setTimeout(() => {
        onClose();
        setLoadingMessage("");
      }, 1000);
    } catch (err: any) {
      console.error('Error adding article:', err);
      const errorMessage = err?.message || "No se pudo agregar el artículo. Por favor intenta de nuevo.";
      setError(errorMessage);
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleClose = () => {
    setUrl("");
    setError("");
    setLoading(false);
    setLoadingMessage("");
    onClose();
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t.addArticleModal.title}</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t.addArticleModal.label}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.addArticleModal.placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            autoFocus
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {loadingMessage ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingMessage}>{loadingMessage}</Text>
              <View style={styles.dotsContainer}>
                <LoadingDots />
              </View>
            </View>
          ) : null}

          <View style={styles.buttons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, loading && styles.cancelButtonTextDisabled]}>{t.addArticleModal.cancel}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.addButton, loading && styles.addButtonDisabled]}
              onPress={handleAdd}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.addButtonText}>{t.addArticleModal.add}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: theme.colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: "500" as const,
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
    marginBottom: 12,
  },
  error: {
    fontSize: 14,
    color: theme.colors.error,
    marginBottom: 12,
  },
  loadingMessage: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: 12,
    fontWeight: "500" as const,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "500" as const,
  },
  addButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },
  cancelButtonTextDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    marginBottom: 12,
  },
  dotsContainer: {
    marginTop: 4,
  },
  dotStyle: {
    fontSize: 24,
    color: theme.colors.primary,
  },
});
