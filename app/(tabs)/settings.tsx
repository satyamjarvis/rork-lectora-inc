import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
  Animated,
  Dimensions,
  Image,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/theme-provider";
import { useAuth } from "@/providers/auth-provider";
import * as ImagePicker from 'expo-image-picker';
import { useArticles } from "@/providers/articles-provider";
import { useStatistics } from "@/providers/statistics-provider";
import { useLanguage } from "@/providers/language-provider";
import { router } from "expo-router";
import { 
  Moon, 
  LogOut, 
  Archive, 
  Trash2, 
  User,
  Shield,
  HelpCircle,
  ChevronRight,
  BarChart3,
  Clock,
  BookOpen,
  Download,
  Target,
  Award,
  ArrowLeft,
  UserX,
  FileText,
  Printer
} from "lucide-react-native";

export default function SettingsScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, signOut, deleteAccount, uploadAvatar, deleteAvatar } = useAuth();
  const { articles, clearAllData } = useArticles();
  const { statistics, resetStatistics } = useStatistics();
  const { t } = useLanguage();
  const [showStatistics, setShowStatistics] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [modalAnimation] = useState(new Animated.Value(0));
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  const archivedCount = articles.filter(a => a.archived).length;

  const handleSignOut = () => {
    Alert.alert(
      t.settings.signOutConfirmTitle,
      t.settings.signOutConfirmMessage,
      [
        { text: t.settings.cancel, style: "cancel" },
        { 
          text: t.settings.signOut, 
          onPress: async () => {
            await signOut();
            router.replace("/(auth)/login");
          },
          style: "destructive"
        },
      ]
    );
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    Animated.spring(modalAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeDeleteModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowDeleteModal(false);
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (error: any) {
      setIsDeleting(false);
      Alert.alert(
        t.settings.deleteAccountModal.delete,
        error.message || "No se pudo eliminar la cuenta"
      );
    }
  };

  const handleAvatarPress = () => {
    if (Platform.OS === 'ios') {
      const options = user?.avatar_url 
        ? ['Tomar foto', 'Elegir de la galería', 'Quitar foto', 'Cancelar']
        : ['Tomar foto', 'Elegir de la galería', 'Cancelar'];
      const destructiveButtonIndex = user?.avatar_url ? 2 : undefined;
      const cancelButtonIndex = user?.avatar_url ? 3 : 2;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) {
            await handleTakePhoto();
          } else if (buttonIndex === 1) {
            await handlePickImage();
          } else if (buttonIndex === 2 && user?.avatar_url) {
            await handleDeleteAvatar();
          }
        }
      );
    } else {
      const options = user?.avatar_url
        ? [
            { text: 'Tomar foto', onPress: handleTakePhoto },
            { text: 'Elegir de la galería', onPress: handlePickImage },
            { text: 'Quitar foto', onPress: handleDeleteAvatar, style: 'destructive' as const },
            { text: 'Cancelar', style: 'cancel' as const },
          ]
        : [
            { text: 'Tomar foto', onPress: handleTakePhoto },
            { text: 'Elegir de la galería', onPress: handlePickImage },
            { text: 'Cancelar', style: 'cancel' as const },
          ];

      Alert.alert('Foto de perfil', 'Elige una opción', options);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingAvatar(true);
        await uploadAvatar(result.assets[0].uri);
        setIsUploadingAvatar(false);
      }
    } catch (error: any) {
      setIsUploadingAvatar(false);
      Alert.alert('Error', error.message || 'No se pudo tomar la foto');
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingAvatar(true);
        await uploadAvatar(result.assets[0].uri);
        setIsUploadingAvatar(false);
      }
    } catch (error: any) {
      setIsUploadingAvatar(false);
      Alert.alert('Error', error.message || 'No se pudo seleccionar la imagen');
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setIsUploadingAvatar(true);
      await deleteAvatar();
      setIsUploadingAvatar(false);
    } catch (error: any) {
      setIsUploadingAvatar(false);
      Alert.alert('Error', error.message || 'No se pudo eliminar la foto');
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      t.settings.content.clearDataConfirmTitle,
      t.settings.content.clearDataConfirmMessage,
      [
        { text: t.settings.content.cancel, style: "cancel" },
        { 
          text: t.settings.content.clearAll, 
          onPress: async () => {
            try {
              await clearAllData();
              await resetStatistics();
              Alert.alert(
                "Datos borrados",
                "Todos tus artículos, carpetas y estadísticas han sido eliminados exitosamente."
              );
            } catch (error: any) {
              Alert.alert(
                "Error",
                "No se pudieron borrar todos los datos: " + (error.message || "Error desconocido")
              );
            }
          },
          style: "destructive"
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const styles = createStyles(theme);

  if (showStatistics) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.statisticsHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowStatistics(false)}
          >
            <ArrowLeft 
              size={24} 
              color={theme.colors.text} 
            />
            <Text style={styles.backText}>{t.settings.title}</Text>
          </TouchableOpacity>
          <Text style={styles.statisticsTitle}>{t.settings.statistics.title}</Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Quick Stats Overview */}
          <View style={styles.quickStatsContainer}>
            <View style={styles.quickStatCard}>
              <View style={[styles.quickStatIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Clock size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.quickStatValue}>{formatTime(statistics.totalReadingTime)}</Text>
              <Text style={styles.quickStatLabel}>{t.settings.statistics.quickStats.totalTime}</Text>
            </View>
            
            <View style={styles.quickStatCard}>
              <View style={[styles.quickStatIcon, { backgroundColor: '#10B981' + '20' }]}>
                <BookOpen size={20} color="#10B981" />
              </View>
              <Text style={styles.quickStatValue}>{formatNumber(statistics.totalArticlesRead)}</Text>
              <Text style={styles.quickStatLabel}>{t.settings.statistics.quickStats.articles}</Text>
            </View>
            
            <View style={styles.quickStatCard}>
              <View style={[styles.quickStatIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                <Download size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.quickStatValue}>{formatNumber(statistics.totalPdfDownloads)}</Text>
              <Text style={styles.quickStatLabel}>{t.settings.statistics.quickStats.pdfs}</Text>
            </View>
          </View>

          {/* Reading Streaks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.settings.statistics.streaks.title}</Text>
            <View style={styles.card}>
              <View style={styles.streakContainer}>
                <View style={styles.streakItem}>
                  <View style={[styles.streakIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Target size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.streakValue}>{statistics.currentStreak}</Text>
                  <Text style={styles.streakLabel}>{t.settings.statistics.streaks.currentLabel}</Text>
                  <Text style={styles.streakSubtitle}>{t.settings.statistics.streaks.consecutiveDays}</Text>
                </View>
                
                <View style={styles.streakDivider} />
                
                <View style={styles.streakItem}>
                  <View style={[styles.streakIcon, { backgroundColor: '#10B981' + '20' }]}>
                    <Award size={24} color="#10B981" />
                  </View>
                  <Text style={styles.streakValue}>{statistics.longestStreak}</Text>
                  <Text style={styles.streakLabel}>{t.settings.statistics.streaks.longestLabel}</Text>
                  <Text style={styles.streakSubtitle}>{t.settings.statistics.streaks.personalRecord}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Additional Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.settings.statistics.additional.title}</Text>
            <View style={styles.card}>
              <View style={styles.additionalStatRow}>
                <Text style={styles.additionalStatLabel}>{t.settings.statistics.additional.readingSpeed}</Text>
                <Text style={styles.additionalStatValue}>{statistics.averageReadingSpeed} ppm</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.additionalStatRow}>
                <Text style={styles.additionalStatLabel}>{t.settings.statistics.additional.longestSession}</Text>
                <Text style={styles.additionalStatValue}>{formatTime(statistics.longestReadingSession)}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.additionalStatRow}>
                <Text style={styles.additionalStatLabel}>{t.settings.statistics.additional.totalWords}</Text>
                <Text style={styles.additionalStatValue}>{formatNumber(statistics.totalWordsRead)}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.additionalStatRow}>
                <Text style={styles.additionalStatLabel}>{t.settings.statistics.additional.totalAppTime}</Text>
                <Text style={styles.additionalStatValue}>{formatTime(statistics.totalAppTime)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.sections.account}</Text>
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <TouchableOpacity 
                style={styles.profileIcon} 
                onPress={handleAvatarPress}
                disabled={isUploadingAvatar}
                testID="settings-avatar-button"
              >
                {user?.avatar_url ? (
                  <Image 
                    source={{ uri: user.avatar_url }} 
                    style={styles.avatarImage}
                    testID="settings-avatar-image"
                  />
                ) : (
                  <User size={24} color={theme.colors.primary} />
                )}
                {isUploadingAvatar && (
                  <View style={styles.avatarOverlay}>
                    <Text style={styles.avatarOverlayText}>...</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || t.settings.account.user}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.sections.appearance}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <View style={styles.rowLeft}>
                <Moon size={20} color={theme.colors.text} />
                <Text style={styles.rowText}>{t.settings.appearance.darkMode}</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ 
                  false: theme.colors.border, 
                  true: theme.colors.primary 
                }}
                thumbColor="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.sections.statistics}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={() => setShowStatistics(true)}>
              <View style={styles.rowLeft}>
                <BarChart3 size={20} color={theme.colors.text} />
                <Text style={styles.rowText}>{t.settings.statistics.viewStats}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{formatTime(statistics.totalReadingTime)}</Text>
                <ChevronRight size={20} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.sections.content}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={() => router.push('/export-pdf')}>
              <View style={styles.rowLeft}>
                <Printer size={20} color={theme.colors.text} />
                <Text style={styles.rowText}>{t.settings.content.exportPrint}</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.row} onPress={() => router.push('/archived')}>
              <View style={styles.rowLeft}>
                <Archive size={20} color={theme.colors.text} />
                <Text style={styles.rowText}>{t.settings.content.archivedArticles}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{archivedCount}</Text>
                <ChevronRight size={20} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.row} onPress={handleClearData}>
              <View style={styles.rowLeft}>
                <Trash2 size={20} color={theme.colors.error} />
                <Text style={[styles.rowText, { color: theme.colors.error }]}>
                  {t.settings.content.clearAllData}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.sections.support}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={() => router.push('/help')}>
              <View style={styles.rowLeft}>
                <HelpCircle size={20} color={theme.colors.text} />
                <Text style={styles.rowText}>{t.settings.support.help}</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.row} onPress={() => router.push('/privacy')}>
              <View style={styles.rowLeft}>
                <Shield size={20} color={theme.colors.text} />
                <Text style={styles.rowText}>{t.settings.support.privacy}</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color={theme.colors.error} />
          <Text style={styles.signOutText}>{t.settings.signOut}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteAccountButton} onPress={openDeleteModal}>
          <UserX size={20} color="#EF4444" />
          <Text style={styles.deleteAccountText}>{t.settings.deleteAccount}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{t.settings.version} 1.0.0</Text>
      </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1}
            onPress={closeDeleteModal}
          />
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    scale: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                  {
                    translateY: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
                opacity: modalAnimation,
              },
            ]}
          >
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIconCircle}>
                <UserX size={40} color="#EF4444" />
              </View>
            </View>
            
            <Text style={styles.modalTitle}>{t.settings.deleteAccountModal.title}</Text>
            <Text style={styles.modalDescription}>
              {t.settings.deleteAccountModal.description}
            </Text>
            
            <View style={styles.modalList}>
              <View style={styles.modalListItem}>
                <View style={styles.modalListDot} />
                <Text style={styles.modalListText}>{t.settings.deleteAccountModal.items.articles}</Text>
              </View>
              <View style={styles.modalListItem}>
                <View style={styles.modalListDot} />
                <Text style={styles.modalListText}>{t.settings.deleteAccountModal.items.folders}</Text>
              </View>
              <View style={styles.modalListItem}>
                <View style={styles.modalListDot} />
                <Text style={styles.modalListText}>{t.settings.deleteAccountModal.items.notes}</Text>
              </View>
              <View style={styles.modalListItem}>
                <View style={styles.modalListDot} />
                <Text style={styles.modalListText}>{t.settings.deleteAccountModal.items.statistics}</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonCancel}
                onPress={closeDeleteModal}
                disabled={isDeleting}
              >
                <Text style={styles.modalButtonCancelText}>{t.settings.deleteAccountModal.cancel}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButtonDelete,
                  isDeleting && styles.modalButtonDeleting
                ]}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                <Text style={styles.modalButtonDeleteText}>
                  {isDeleting ? t.settings.deleteAccountModal.deleting : t.settings.deleteAccountModal.delete}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: theme.colors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  rowValue: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.inputBackground,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOverlayText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
    marginHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.colors.error,
  },
  version: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  deleteAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#EF444410",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#EF4444",
  },
  statisticsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  statisticsTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginLeft: 16,
  },
  quickStatsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: theme.colors.text,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  streakContainer: {
    flexDirection: "row",
    padding: 20,
  },
  streakItem: {
    flex: 1,
    alignItems: "center",
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: theme.colors.text,
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 2,
  },
  streakSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  streakDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 20,
  },
  additionalStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  additionalStatLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  additionalStatValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.colors.primary,
  },
  bottomSpacing: {
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 24,
    padding: 28,
    width: Dimensions.get('window').width - 48,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EF444415",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#EF444430",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  modalList: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  modalListItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modalListDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
    marginRight: 12,
  },
  modalListText: {
    fontSize: 15,
    color: theme.colors.text,
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.colors.text,
  },
  modalButtonDelete: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  modalButtonDeleting: {
    opacity: 0.6,
  },
  modalButtonDeleteText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});