import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useTheme } from "@/providers/theme-provider";
import { useLanguage } from "@/providers/language-provider";
import { X, Camera, FlipHorizontal, Check, RotateCcw } from "lucide-react-native";
import { useArticles } from "@/providers/articles-provider";
import { loadToolkitModule } from "@/lib/rorkToolkit";

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (url: string) => Promise<void>;
}

export default function CameraModal({ visible, onClose, onAdd }: CameraModalProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { addTranscribedArticle } = useArticles();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const cameraRef = useRef<CameraView>(null);

  const handleClose = () => {
    setCapturedImage(null);
    setShowTitleInput(false);
    setCustomTitle("");
    onClose();
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (photo && photo.base64) {
        console.log("📸 Foto capturada");
        setCapturedImage(`data:image/jpeg;base64,${photo.base64}`);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert(t.camera.errors.captureError, t.camera.errors.captureError);
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setShowTitleInput(false);
    setCustomTitle("");
  };

  const handleConfirmPhoto = () => {
    setShowTitleInput(true);
  };

  const transcribeAndSave = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      console.log("🔍 Transcribiendo texto de la imagen...");

      const { generateText } = await loadToolkitModule();
      const transcribedText = await generateText({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extrae TODO el texto visible de esta imagen de revista, libro o documento.

Instrucciones:
- Lee cuidadosamente TODO el texto visible
- Mantén la estructura: títulos, subtítulos, párrafos
- Respeta el formato original
- Si hay múltiples columnas, léelas en orden de izquierda a derecha
- Si hay texto pequeño o notas al pie, inclúyelos también
- Devuelve el texto en formato Markdown limpio
- Si hay un título principal, usa # para el título principal
- Si hay subtítulos, usa ##, ###, etc.
- Usa **negrita** para texto enfatizado
- Usa *itálica* para texto en cursiva
- NO inventes ni agregues contenido que no está en la imagen
- Si no puedes leer algo, omítelo, pero sé exhaustivo con lo que puedas leer

Devuelve SOLO el texto transcrito sin comentarios adicionales.`,
              },
              {
                type: "image",
                image: capturedImage,
              },
            ],
          },
        ],
      });

      console.log("✅ Texto transcrito, longitud:", transcribedText.length);

      if (!transcribedText || transcribedText.trim().length < 10) {
        Alert.alert(
          t.camera.errors.noText,
          t.camera.errors.noText
        );
        setLoading(false);
        return;
      }

      const content = transcribedText;
      const lines = transcribedText.trim().split("\n");
      let title = customTitle.trim() || "Artículo transcrito";

      if (!customTitle.trim()) {
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("#")) {
            title = trimmed.replace(/^#+\s*/, "");
            break;
          } else if (trimmed.length > 10 && trimmed.length < 150) {
            title = trimmed;
            break;
          }
        }
      }

      const excerpt = lines
        .filter((line) => {
          const trimmed = line.trim();
          return trimmed.length > 0 && !trimmed.startsWith("#");
        })
        .slice(0, 3)
        .join(" ")
        .substring(0, 300);

      console.log("💾 Guardando artículo transcrito...");
      console.log("📝 Título:", title);
      console.log("📝 Extracto:", excerpt.substring(0, 100));

      await addTranscribedArticle({
        title,
        content,
        excerpt,
        imageUrl: capturedImage,
      });

      Alert.alert(t.camera.success.title, t.camera.success.message, [
        {
          text: t.camera.success.ok,
          onPress: () => {
            setCapturedImage(null);
            setShowTitleInput(false);
            setCustomTitle("");
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.error("Error transcribing:", error);
      Alert.alert(t.camera.errors.transcribeError, t.camera.errors.transcribeError);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme);
  const isTablet = Platform.OS === "ios" && Platform.isPad === true;

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        presentationStyle={isTablet ? "fullScreen" : "pageSheet"}
        supportedOrientations={isTablet ? ["portrait", "portrait-upside-down"] : ["portrait"]}
        statusBarTranslucent={isTablet}
      >
        <View style={styles.overlay}>
          <View style={styles.permissionContainer}>
            <Camera size={48} color={theme.colors.primary} />
            <Text style={styles.permissionTitle}>{t.camera.permission.title}</Text>
            <Text style={styles.permissionText}>
              {t.camera.permission.description}
            </Text>
            <View style={styles.permissionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>{t.camera.permission.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
                <Text style={styles.grantButtonText}>{t.camera.permission.allow}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      presentationStyle={isTablet ? "fullScreen" : "pageSheet"}
      supportedOrientations={isTablet ? ["portrait", "portrait-upside-down"] : ["portrait"]}
      statusBarTranslucent={isTablet}
    >
      <View style={styles.container}>
        {capturedImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />

            <View style={styles.previewHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <X size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {!showTitleInput ? (
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={retakePicture}
                  disabled={loading}
                >
                  <RotateCcw size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>{t.camera.preview.retake}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmPhoto}
                >
                  <Check size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>{t.camera.preview.continue}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.titleInputContainer}
              >
                <View style={styles.titleInputBox}>
                  <Text style={styles.titleInputLabel}>{t.camera.preview.titleLabel}</Text>
                  <TextInput
                    style={styles.titleInput}
                    placeholder={t.camera.preview.titlePlaceholder}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={customTitle}
                    onChangeText={setCustomTitle}
                    autoFocus
                    maxLength={150}
                  />
                  <Text style={styles.titleInputHint}>
                    {t.camera.preview.titleHint}
                  </Text>

                  <View style={styles.titleInputActions}>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => setShowTitleInput(false)}
                      disabled={loading}
                    >
                      <Text style={styles.backButtonText}>{t.camera.preview.back}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.transcribeButton, loading && styles.buttonDisabled]}
                      onPress={transcribeAndSave}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.transcribeButtonText}>{t.camera.preview.transcribe}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            )}

            {loading && (
              <View style={styles.loadingOverlay}>
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>
                    {t.camera.loading.transcribing}
                  </Text>
                  <Text style={styles.loadingSubText}>
                    {t.camera.loading.subtitle}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <>
            {Platform.OS === "web" ? (
              <View style={styles.cameraContainer}>
                <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
              </View>
            ) : (
              <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <View style={styles.cameraHeader}>
                  <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <X size={28} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cameraControls}>
                  <TouchableOpacity
                    style={styles.flipButton}
                    onPress={() => setFacing((current) => (current === "back" ? "front" : "back"))}
                  >
                    <FlipHorizontal size={32} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                    <View style={styles.captureButtonInner} />
                  </TouchableOpacity>

                  <View style={styles.flipButton} />
                </View>
              </CameraView>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000000",
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    permissionContainer: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 24,
      padding: 32,
      alignItems: "center",
      maxWidth: 400,
    },
    permissionTitle: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 12,
    },
    permissionText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 24,
    },
    permissionButtons: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
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
    grantButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
    },
    grantButtonText: {
      fontSize: 16,
      color: "#FFFFFF",
      fontWeight: "600" as const,
    },
    cameraContainer: {
      flex: 1,
    },
    camera: {
      flex: 1,
    },
    cameraHeader: {
      paddingTop: Platform.OS === "ios" ? 50 : 20,
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    cameraControls: {
      position: "absolute",
      bottom: Platform.OS === "ios" ? 50 : 30,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    captureButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    captureButtonInner: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "#FFFFFF",
    },
    flipButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    previewContainer: {
      flex: 1,
      backgroundColor: "#000000",
    },
    previewImage: {
      flex: 1,
      resizeMode: "contain",
    },
    previewHeader: {
      position: "absolute",
      top: Platform.OS === "ios" ? 50 : 20,
      right: 20,
    },
    previewActions: {
      position: "absolute",
      bottom: Platform.OS === "ios" ? 50 : 30,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingHorizontal: 40,
      gap: 20,
    },
    retakeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 16,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    confirmButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: "#FFFFFF",
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    loadingBox: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 20,
      padding: 32,
      alignItems: "center",
      minWidth: 200,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "500" as const,
    },
    loadingSubText: {
      marginTop: 8,
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    titleInputContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: Platform.OS === "ios" ? 50 : 30,
    },
    titleInputBox: {
      backgroundColor: theme.colors.cardBackground,
      marginHorizontal: 20,
      borderRadius: 20,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    titleInputLabel: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: theme.colors.text,
      marginBottom: 12,
    },
    titleInput: {
      backgroundColor: theme.colors.inputBackground || theme.colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 8,
    },
    titleInputHint: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 20,
      lineHeight: 18,
    },
    titleInputActions: {
      flexDirection: "row",
      gap: 12,
    },
    backButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: theme.colors.text,
    },
    transcribeButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    transcribeButtonText: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: "#FFFFFF",
    },
  });
