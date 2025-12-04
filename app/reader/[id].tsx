import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
  TextInput,
  Linking,
  Animated,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import Markdown from "react-native-markdown-display";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useTheme } from "@/providers/theme-provider";
import { useArticles } from "@/providers/articles-provider";
import { useStatistics } from "@/providers/statistics-provider";
import { useLanguage } from "@/providers/language-provider";
import * as Speech from "expo-speech";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { 
  X, 
  Settings2, 
  Bookmark, 
  BookmarkCheck,
  Sun,
  Moon,
  Copy,

  StickyNote,
  Play,
  Pause,
  Archive,
  Share2,
  MoreHorizontal,
  FolderInput,
  FolderPlus,
  Check,
  Tag,
  FileDown,
  Printer,
} from "lucide-react-native";

const fontFamilies = [
  { label: "System", value: Platform.select({ ios: "System", android: "Roboto", default: "System" }) },
  { label: "Serif", value: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }) },
  { label: "Sans", value: Platform.select({ ios: "Helvetica", android: "sans-serif", default: "sans-serif" }) },
];

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { getArticleById, toggleBookmark, archiveArticle, folders, addFolder, moveArticleToFolder, addNoteToArticle, removeNoteFromArticle, addTagsToArticle } = useArticles();
  const { startReadingSession, endReadingSession } = useStatistics();
  const { language, t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFoldersModal, setShowFoldersModal] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [fontFamily, setFontFamily] = useState(fontFamilies[0].value);
  const [isPlaying, setIsPlaying] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showNotesList, setShowNotesList] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [speechChunks, setSpeechChunks] = useState<string[]>([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const floatingButtonsScale = useRef(new Animated.Value(0)).current;

  const article = getArticleById(id);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.spring(floatingButtonsScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, 300);
  }, []);

  useEffect(() => {
    if (article && article.isVideo && article.url) {
      Linking.openURL(article.url).catch(err => {
        console.error('Failed to open YouTube:', err);
        Alert.alert('Error', 'No se pudo abrir YouTube. Por favor, intenta de nuevo.');
      });
      router.back();
    }
  }, [article?.id]);

  // Track reading session
  useEffect(() => {
    if (article && !article.isVideo) {
      console.log('Starting reading session for article:', article.id);
      startReadingSession(article.id);
      
      // End session when component unmounts or article changes
      return () => {
        console.log('Ending reading session for article:', article.id);
        // Estimate words read based on article content
        const wordsRead = article.content.split(' ').length;
        endReadingSession(wordsRead);
        
        if (isPlaying) {
          Speech.stop();
          setIsPlaying(false);
          setSpeechChunks([]);
          setCurrentChunkIndex(0);
        }
      };
    }
  }, [article?.id, isPlaying]);

  // Handle chunk playback
  useEffect(() => {
    if (isPlaying && speechChunks.length > 0 && currentChunkIndex < speechChunks.length) {
      playChunk(speechChunks[currentChunkIndex]);
    } else if (isPlaying && speechChunks.length > 0 && currentChunkIndex >= speechChunks.length) {
      setIsPlaying(false);
      setSpeechChunks([]);
      setCurrentChunkIndex(0);
      console.log('✅ Reproducción de todos los fragmentos completada');
    }
  }, [isPlaying, currentChunkIndex, speechChunks]);

  const styles = createStyles(theme, fontSize, lineHeight, fontFamily);
  const markdownStyles = useMemo(() => createMarkdownStyles(theme, fontSize, lineHeight, fontFamily), [theme, fontSize, lineHeight, fontFamily]);

  const markdownRules = useMemo(() => ({
    image: (node: any) => {
      return (
        <Image
          key={node.key}
          source={{ uri: node.attributes.src }}
          style={{
            width: 300,
            height: 300,
            borderRadius: 12,
            marginVertical: 12,
          }}
          contentFit="cover"
        />
      );
    },
  }), []);



  function renderContent() {
    if (!article) return null;
    
    return (
      <Markdown
        style={markdownStyles}
        rules={markdownRules}
        onLinkPress={(url) => {
          Linking.openURL(url).catch(err => {
            console.error('Failed to open link:', err);
          });
          return false;
        }}
      >
        {article.content}
      </Markdown>
    );
  }

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: theme.colors.text }}>Article not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => toggleBookmark(article.id)}
          >
            {article.bookmarked ? (
              <BookmarkCheck size={24} color={theme.colors.primary} />
            ) : (
              <Bookmark size={24} color={theme.colors.text} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowFoldersModal(true)}
          >
            <FolderInput size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowActions(true)}
          >
            <MoreHorizontal size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowSettings(true)}
          >
            <Settings2 size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.articleContentContainer}>
          {renderContent()}
        </View>

        {article.images && article.images.length > 0 && (
          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>{t.reader.images.title}</Text>
            {article.images.map((img, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  source={{ uri: img.url }}
                  style={styles.articleImage}
                  contentFit="cover"
                />
                {(img.alt || img.caption) && (
                  <Text style={styles.imageCaption}>
                    {img.caption || img.alt}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.referencesSection}>
          <Text style={styles.sectionTitle}>{t.reader.source.title}</Text>
          <TouchableOpacity
            style={styles.referenceItem}
            onPress={() => Linking.openURL(article.url)}
          >
            <Text style={styles.referenceUrl} numberOfLines={2}>
              {article.url}
            </Text>
          </TouchableOpacity>
        </View>

        {article.tags && article.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>{t.reader.tags.title}</Text>
            <View style={styles.tagsContainer}>
              {article.tags.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Tag size={14} color={theme.colors.primary} />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Floating Action Buttons */}
      <Animated.View 
        style={[
          styles.floatingActions,
          {
            transform: [{ scale: floatingButtonsScale }],
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => handleCopyText()}
        >
          <Copy size={20} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.floatingButton, (article.notes && article.notes.length > 0) && { borderColor: theme.colors.primary, borderWidth: 2 }]}
          onPress={() => {
            if (article.notes && article.notes.length > 0) {
              setShowNotesList(true);
            } else {
              setShowNoteModal(true);
            }
          }}
          onLongPress={() => setShowNoteModal(true)}
        >
          <StickyNote size={20} color={(article.notes && article.notes.length > 0) ? theme.colors.primary : theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.floatingButton, styles.playButton]}
          onPress={() => handlePlayPause()}
        >
          {isPlaying ? (
            <Pause size={20} color="#FFFFFF" />
          ) : (
            <Play size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <View style={styles.settingsPanel}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Reading Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Theme</Text>
              <View style={styles.themeButtons}>
                <TouchableOpacity 
                  style={[styles.themeButton, !isDarkMode && styles.themeButtonActive]}
                  onPress={() => !isDarkMode && toggleTheme()}
                >
                  <Sun size={20} color={!isDarkMode ? theme.colors.primary : theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.themeButton, isDarkMode && styles.themeButtonActive]}
                  onPress={() => isDarkMode && toggleTheme()}
                >
                  <Moon size={20} color={isDarkMode ? theme.colors.primary : theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Font Size</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderValue}>{fontSize}px</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={14}
                  maximumValue={24}
                  value={fontSize}
                  onValueChange={setFontSize}
                  step={1}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.border}
                />
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Line Height</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderValue}>{lineHeight.toFixed(1)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1.2}
                  maximumValue={2.0}
                  value={lineHeight}
                  onValueChange={setLineHeight}
                  step={0.1}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.border}
                />
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Font</Text>
              <View style={styles.fontButtons}>
                {fontFamilies.map((font) => (
                  <TouchableOpacity
                    key={font.value}
                    style={[
                      styles.fontButton,
                      fontFamily === font.value && styles.fontButtonActive
                    ]}
                    onPress={() => setFontFamily(font.value)}
                  >
                    <Text style={[
                      styles.fontButtonText,
                      fontFamily === font.value && styles.fontButtonTextActive
                    ]}>
                      {font.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Actions Modal */}
      <Modal
        visible={showActions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActions(false)}
        >
          <View style={styles.actionsPanel}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>{t.reader.actions.title}</Text>
              <TouchableOpacity onPress={() => setShowActions(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionsList}>
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => {
                  setShowActions(false);
                  handleExportToPDF();
                }}
              >
                <FileDown size={20} color={theme.colors.text} />
                <Text style={styles.actionText}>{t.reader.actions.exportPDF}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => {
                  setShowActions(false);
                  handlePrintArticle();
                }}
              >
                <Printer size={20} color={theme.colors.text} />
                <Text style={styles.actionText}>{t.reader.actions.print}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => {
                  setShowActions(false);
                  setTagsInput(article.tags ? article.tags.join(', ') : '');
                  setShowTagsModal(true);
                }}
              >
                <Tag size={20} color={theme.colors.text} />
                <Text style={styles.actionText}>{t.reader.actions.tags}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => handleCopyArticle()}
              >
                <Copy size={20} color={theme.colors.text} />
                <Text style={styles.actionText}>{t.reader.actions.copyArticle}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => handleShare()}
              >
                <Share2 size={20} color={theme.colors.text} />
                <Text style={styles.actionText}>{t.reader.actions.share}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => handleArchive()}
              >
                <Archive size={20} color={theme.colors.text} />
                <Text style={styles.actionText}>{t.reader.actions.archive}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Note Modal */}
      <Modal
        visible={showNoteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNoteModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNoteModal(false)}
        >
          <View style={styles.notePanel} onStartShouldSetResponder={() => true}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>{t.reader.notes.addNote}</Text>
              <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder={t.reader.notes.placeholder}
              placeholderTextColor={theme.colors.textSecondary}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={styles.saveNoteButton}
              onPress={() => handleSaveNote()}
            >
              <Text style={styles.saveNoteText}>{t.reader.notes.saveNote}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Notes List Modal */}
      <Modal
        visible={showNotesList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotesList(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNotesList(false)}
        >
          <View style={styles.listPanel} onStartShouldSetResponder={() => true}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>{t.reader.notes.title} ({article.notes?.length || 0})</Text>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => {
                  setShowNotesList(false);
                  setShowNoteModal(true);
                }}>
                  <StickyNote size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowNotesList(false)}>
                  <X size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView 
              style={styles.itemsList}
              showsVerticalScrollIndicator={false}
            >
              {article.notes && article.notes.length > 0 ? (
                article.notes.map((note) => (
                  <View key={note.id} style={styles.noteItem}>
                    <View style={styles.noteContent}>
                      <Text style={styles.noteText}>{note.text}</Text>
                      <Text style={styles.noteDate}>
                        {new Date(note.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteNote(note.id)}
                    >
                      <X size={18} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <StickyNote size={48} color={theme.colors.textSecondary} />
                  <Text style={styles.emptyStateText}>{t.reader.notes.emptyStateTitle}</Text>
                  <Text style={styles.emptyStateSubtext}>
                    {t.reader.notes.emptyStateDescription}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Folders Modal */}
      <Modal
        visible={showFoldersModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowFoldersModal(false);
          setShowNewFolderInput(false);
          setNewFolderName("");
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowFoldersModal(false);
            setShowNewFolderInput(false);
            setNewFolderName("");
          }}
        >
          <View style={styles.foldersPanel} onStartShouldSetResponder={() => true}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>{t.reader.folders.saveInFolder}</Text>
              <TouchableOpacity onPress={() => {
                setShowFoldersModal(false);
                setShowNewFolderInput(false);
                setNewFolderName("");
              }}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.foldersList}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity 
                style={styles.folderItem}
                onPress={() => handleMoveToFolder(null)}
              >
                <View style={styles.folderIconContainer}>
                  <FolderInput size={20} color={theme.colors.text} />
                </View>
                <Text style={styles.folderText}>{t.reader.folders.noFolder}</Text>
                {!article.folderId && (
                  <Check size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>

              {folders.map((folder) => (
                <TouchableOpacity 
                  key={folder.id}
                  style={styles.folderItem}
                  onPress={() => handleMoveToFolder(folder.id)}
                >
                  <View style={styles.folderIconContainer}>
                    <FolderInput size={20} color={theme.colors.text} />
                  </View>
                  <Text style={styles.folderText}>{folder.name}</Text>
                  {article.folderId === folder.id && (
                    <Check size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}

              {showNewFolderInput ? (
                <View style={styles.newFolderContainer}>
                  <TextInput
                    style={styles.newFolderInput}
                    placeholder={t.reader.folders.folderNamePlaceholder}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={newFolderName}
                    onChangeText={setNewFolderName}
                    autoFocus
                  />
                  <TouchableOpacity 
                    style={styles.createFolderButton}
                    onPress={() => handleCreateFolder()}
                  >
                    <Text style={styles.createFolderText}>{t.reader.folders.create}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.newFolderButton}
                  onPress={() => setShowNewFolderInput(true)}
                >
                  <FolderPlus size={20} color={theme.colors.primary} />
                  <Text style={styles.newFolderButtonText}>{t.reader.folders.newFolder}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Tags Modal */}
      <Modal
        visible={showTagsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTagsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTagsModal(false)}
        >
          <View style={styles.notePanel} onStartShouldSetResponder={() => true}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>{t.reader.tags.editTags}</Text>
              <TouchableOpacity onPress={() => setShowTagsModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.tagsHelp}>
              {t.reader.tags.helpText}
            </Text>

            <TextInput
              style={styles.noteInput}
              placeholder={t.reader.tags.placeholder}
              placeholderTextColor={theme.colors.textSecondary}
              value={tagsInput}
              onChangeText={setTagsInput}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={styles.saveNoteButton}
              onPress={() => handleSaveTags()}
            >
              <Text style={styles.saveNoteText}>{t.reader.tags.saveTags}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>


    </SafeAreaView>
  );

  async function handleCopyText() {
    if (!article) {
      return;
    }
    
    try {
      await Clipboard.setStringAsync(article.content);
      console.log('✅ Contenido copiado al portapapeles');
      
      if (Platform.OS === 'web') {
        alert('Contenido copiado al portapapeles');
      } else {
        Alert.alert("Éxito", "Contenido copiado al portapapeles");
      }
    } catch (error) {
      console.error('❌ Error copiando texto:', error);
      if (Platform.OS === 'web') {
        alert('Error al copiar el contenido');
      } else {
        Alert.alert("Error", "No se pudo copiar el contenido");
      }
    }
  }

  async function handleCopyArticle() {
    if (!article) {
      return;
    }
    
    try {
      const fullText = `${article.title}\n\n${article.content}\n\nFuente: ${article.url}`;
      await Clipboard.setStringAsync(fullText);
      setShowActions(false);
      console.log('✅ Artículo completo copiado');
      
      if (Platform.OS === 'web') {
        alert('Artículo copiado al portapapeles');
      } else {
        Alert.alert("Éxito", "Artículo copiado al portapapeles");
      }
    } catch (error) {
      console.error('❌ Error copiando artículo:', error);
      setShowActions(false);
      if (Platform.OS === 'web') {
        alert('Error al copiar el artículo');
      } else {
        Alert.alert("Error", "No se pudo copiar el artículo");
      }
    }
  }



  function cleanTextForSpeech(text: string): string {
    let cleaned = text;
    
    console.log('🧹 Limpiando texto para reproducción...');
    
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '');
    
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    cleaned = cleaned.replace(/#{1,6}\s+/g, '');
    
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
    cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
    cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
    
    cleaned = cleaned.replace(/^>\s+/gm, '');
    
    const lines = cleaned.split('\n');
    const contentLines: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) continue;
      
      if (/^[-*•]\s/.test(trimmedLine)) {
        continue;
      }
      
      if (/^\d+\.\s/.test(trimmedLine)) {
        continue;
      }
      
      if (trimmedLine.length < 15) {
        continue;
      }
      
      const lowerLine = trimmedLine.toLowerCase();
      const skipKeywords = [
        'tabla de contenido',
        'table of contents',
        'índice',
        'index',
        'referencias',
        'references',
        'fuente:',
        'source:',
        'relacionado:',
        'related:',
        'ver también',
        'see also',
        'más información',
        'more info',
        'compartir',
        'share',
        'tweet',
        'facebook',
        'linkedin',
      ];
      
      if (skipKeywords.some(keyword => lowerLine.includes(keyword))) {
        continue;
      }
      
      contentLines.push(trimmedLine);
    }
    
    cleaned = contentLines.join('. ');
    
    cleaned = cleaned.replace(/\.{2,}/g, '.');
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    cleaned = cleaned.replace(/\s*\.\s*\./g, '.');
    
    cleaned = cleaned.trim();

    if (cleaned.length === 0) {
      console.warn('⚠️ El texto limpio está vacío, usando texto original simplificado');
      return text.substring(0, 1000); // Fallback to raw text if cleaning removed everything
    }
    
    console.log(`✅ Texto limpio: ${cleaned.length} caracteres, primeros 100: ${cleaned.substring(0, 100)}`);
    
    return cleaned;
  }

  function detectArticleLanguage(text: string): string {
    const spanishWords = ['el', 'la', 'los', 'las', 'de', 'del', 'en', 'y', 'un', 'una', 'que', 'es', 'por', 'para', 'con', 'como', 'más', 'pero', 'su', 'al', 'lo', 'se', 'está', 'esta', 'son', 'fue', 'era', 'sin', 'sobre', 'todo', 'también', 'ya', 'solo', 'año', 'años', 'así', 'muy'];
    const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'what', 'which', 'their', 'will', 'would', 'there', 'can', 'who'];
    
    const textLower = text.toLowerCase();
    const words = textLower.match(/\b\w+\b/g) || [];
    
    console.log(`🔍 Analizando ${words.length} palabras para detectar idioma...`);
    
    if (words.length < 10) {
      const fallback = language === 'es' ? 'es-ES' : 'en-US';
      console.log(`⚠️ Pocas palabras, usando idioma de configuración: ${fallback}`);
      return fallback;
    }
    
    const wordsToAnalyze = words.slice(0, 300);
    
    let spanishCount = 0;
    let englishCount = 0;
    
    for (const word of wordsToAnalyze) {
      if (spanishWords.includes(word)) spanishCount++;
      if (englishWords.includes(word)) englishCount++;
    }
    
    console.log(`📊 Detección de idioma - Español: ${spanishCount}, Inglés: ${englishCount}`);
    
    if (spanishCount === 0 && englishCount === 0) {
      const fallback = language === 'es' ? 'es-ES' : 'en-US';
      console.log(`⚠️ No se detectaron palabras comunes, usando idioma de configuración: ${fallback}`);
      return fallback;
    }
    
    if (Math.abs(spanishCount - englishCount) < 5) {
      const fallback = language === 'es' ? 'es-ES' : 'en-US';
      console.log(`🎤 Diferencia mínima, usando idioma de configuración: ${fallback}`);
      return fallback;
    }
    
    const detected = spanishCount > englishCount ? 'es-ES' : 'en-US';
    const confidence = Math.abs(spanishCount - englishCount);
    console.log(`✅ Idioma detectado: ${detected} (confianza: ${confidence})`);
    return detected;
  }

  function splitTextIntoChunks(text: string, maxLength: number = 2000): string[] {
    if (text.length <= maxLength) return [text];
    
    const chunks: string[] = [];
    let currentText = text;
    
    while (currentText.length > 0) {
      if (currentText.length <= maxLength) {
        chunks.push(currentText);
        break;
      }
      
      let cutIndex = maxLength;
      // Try to cut at paragraph
      const lastParagraph = currentText.lastIndexOf('\n', maxLength);
      if (lastParagraph > maxLength * 0.7) {
        cutIndex = lastParagraph;
      } else {
        // Try to cut at sentence
        const lastPeriod = currentText.lastIndexOf('. ', maxLength);
        if (lastPeriod > maxLength * 0.7) {
          cutIndex = lastPeriod + 1;
        } else {
           // Fallback to space
           const lastSpace = currentText.lastIndexOf(' ', maxLength);
           if (lastSpace > 0) {
             cutIndex = lastSpace;
           }
        }
      }
      
      chunks.push(currentText.slice(0, cutIndex).trim());
      currentText = currentText.slice(cutIndex).trim();
    }
    
    console.log(`🧩 Texto dividido en ${chunks.length} fragmentos`);
    return chunks;
  }

  async function playChunk(chunk: string) {
    const detectedLanguage = detectArticleLanguage(article!.content);
    console.log(`🗣️ Reproduciendo chunk (${chunk.length} chars) en idioma: ${detectedLanguage}`);
    
    if (Platform.OS === 'web') {
        if ('speechSynthesis' in window) {
             const utterance = new SpeechSynthesisUtterance(chunk);
             utterance.lang = detectedLanguage;
             utterance.rate = 1.0;
             utterance.onend = () => {
                 setCurrentChunkIndex(prev => prev + 1);
             };
             utterance.onerror = (e) => {
                 console.error('Error speech web', e);
                 setIsPlaying(false);
             };
             window.speechSynthesis.speak(utterance);
        }
        return;
    }

    try {
        await Speech.speak(chunk, {
          language: detectedLanguage,
          pitch: 1.0,
          rate: 0.9,
          onDone: () => {
            console.log(`✅ Fragmento ${currentChunkIndex + 1} completado`);
            setCurrentChunkIndex(prev => prev + 1);
          },
          onStopped: () => {
             console.log('🛑 Reproducción detenida');
          },
          onError: (error) => {
            console.error('❌ Error en fragmento:', error);
            // Try fallback language if specific one fails
            if (detectedLanguage.includes('-')) {
               const fallbackLang = detectedLanguage.split('-')[0];
               console.log(`⚠️ Intentando idioma fallback: ${fallbackLang}`);
               Speech.speak(chunk, {
                   language: fallbackLang,
                   onDone: () => setCurrentChunkIndex(prev => prev + 1),
                   onError: () => {
                       console.warn('⚠️ Fallback falló, saltando fragmento...');
                       setCurrentChunkIndex(prev => prev + 1);
                   }
               });
            } else {
               console.warn('⚠️ Saltando fragmento con error...');
               setCurrentChunkIndex(prev => prev + 1);
            }
          },
        });
    } catch (e) {
        console.error('Error playing chunk', e);
        setIsPlaying(false);
        Alert.alert('Error', 'No se pudo reproducir el audio. Verifica tu conexión o configuración de idioma.');
    }
  }

  async function handlePlayPause() {
    if (!article) return;
    
    const newPlayingState = !isPlaying;
    
    console.log(newPlayingState ? '▶️ Intentando iniciar reproducción' : '⏸️ Reproducción pausada');
    
    if (!newPlayingState) {
      setIsPlaying(false);
      setSpeechChunks([]);
      setCurrentChunkIndex(0);
      
      if (Platform.OS === 'web') {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } else {
        try {
          await Speech.stop();
          console.log('⏸️ Reproducción detenida');
        } catch (error) {
          console.error('❌ Error deteniendo reproducción:', error);
        }
      }
      return;
    }
    
    const cleanedContent = cleanTextForSpeech(article.content);
    const chunks = splitTextIntoChunks(cleanedContent);
    
    if (chunks.length === 0) {
        Alert.alert('Error', 'No hay contenido para reproducir.');
        return;
    }

    setSpeechChunks(chunks);
    setCurrentChunkIndex(0);
    setIsPlaying(true);
  }

  async function handleShare() {
    if (!article) return;
    
    setShowActions(false);
    console.log('📤 Compartiendo artículo:', article.title);
    
    const shareData = {
      title: article.title,
      text: article.excerpt || article.title,
      url: article.url,
    };
    
    try {
      if (Platform.OS === 'web' && navigator.share) {
        await navigator.share(shareData);
        console.log('✅ Artículo compartido exitosamente');
      } else if (Platform.OS === 'web') {
        const sharePayload = `${article.title}\n\n${article.url}`;
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(sharePayload);
        } else {
          await Clipboard.setStringAsync(sharePayload);
        }
        alert('Enlace copiado al portapapeles');
      } else {
        const { Share } = await import('react-native');
        await Share.share({
          message: `${article.title}\n\n${article.url}`,
          url: article.url,
        });
        console.log('✅ Artículo compartido');
      }
    } catch (error: any) {
      if (error?.message?.includes('cancel')) {
        console.log('ℹ️ Usuario canceló compartir');
      } else {
        console.error('❌ Error compartiendo:', error);
        if (Platform.OS === 'web') {
          alert('Error al compartir el artículo');
        } else {
          Alert.alert("Error", "No se pudo compartir el artículo");
        }
      }
    }
  }

  function handleArchive() {
    if (!article) return;
    
    console.log('📦 Archivando artículo:', article.id);
    
    if (Platform.OS === 'web') {
      if (confirm('¿Estás seguro de que quieres archivar este artículo?')) {
        const wordsRead = article.content.split(' ').length;
        endReadingSession(wordsRead);
        archiveArticle(article.id);
        setShowActions(false);
        console.log('✅ Artículo archivado');
        router.back();
      }
    } else {
      Alert.alert(
        "Archivar Artículo",
        "¿Estás seguro de que quieres archivar este artículo?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Archivar",
            style: "destructive",
            onPress: () => {
              const wordsRead = article.content.split(' ').length;
              endReadingSession(wordsRead);
              archiveArticle(article.id);
              setShowActions(false);
              console.log('✅ Artículo archivado');
              router.back();
            }
          }
        ]
      );
    }
  }

  async function handleSaveNote() {
    if (!article) return;
    
    const trimmedNote = noteText.trim();
    
    if (!trimmedNote) {
      if (Platform.OS === 'web') {
        alert('Por favor escribe una nota antes de guardar');
      } else {
        Alert.alert("Atención", "Por favor escribe una nota antes de guardar");
      }
      return;
    }
    
    try {
      console.log('📝 Guardando nota:', trimmedNote.substring(0, 50));
      
      await addNoteToArticle(article.id, trimmedNote);
      
      if (Platform.OS === 'web') {
        alert('✅ Nota guardada correctamente');
      } else {
        Alert.alert("Éxito", "Nota guardada correctamente");
      }
      
      setNoteText("");
      setShowNoteModal(false);
    } catch (error) {
      console.error('Error guardando nota:', error);
      
      if (Platform.OS === 'web') {
        alert('❌ Error al guardar la nota');
      } else {
        Alert.alert("Error", "No se pudo guardar la nota");
      }
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!article) return;
    
    try {
      await removeNoteFromArticle(article.id, noteId);
      
      console.log('✅ Nota eliminada');
    } catch (error) {
      console.error('Error eliminando nota:', error);
      
      if (Platform.OS === 'web') {
        alert('Error al eliminar la nota');
      } else {
        Alert.alert("Error", "No se pudo eliminar la nota");
      }
    }
  }

  async function handleMoveToFolder(folderId: string | null) {
    if (!article) return;
    
    try {
      console.log(`📁 Moviendo artículo ${article.id} a carpeta:`, folderId || 'sin carpeta');
      
      await moveArticleToFolder(article.id, folderId);
      setShowFoldersModal(false);
      setShowNewFolderInput(false);
      setNewFolderName("");
      
      const message = folderId ? "Artículo movido a la carpeta" : "Artículo sin carpeta";
      console.log('✅', message);
      
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert("Éxito", message);
      }
    } catch (error) {
      console.error("❌ Failed to move article:", error);
      
      if (Platform.OS === 'web') {
        alert('No se pudo mover el artículo');
      } else {
        Alert.alert("Error", "No se pudo mover el artículo");
      }
    }
  }

  async function handleCreateFolder() {
    const trimmedName = newFolderName.trim();
    
    if (!trimmedName) {
      if (Platform.OS === 'web') {
        alert(t.reader.folders.enterFolderName);
      } else {
        Alert.alert(t.reader.folders.folderErrorTitle, t.reader.folders.enterFolderName);
      }
      return;
    }

    try {
      console.log('📁 Creando carpeta:', trimmedName);
      
      await addFolder(trimmedName);
      setNewFolderName("");
      setShowNewFolderInput(false);
      
      console.log('✅ Carpeta creada exitosamente');
      
      if (Platform.OS === 'web') {
        alert(t.reader.folders.folderCreated);
      } else {
        Alert.alert(t.reader.folders.folderCreatedTitle, t.reader.folders.folderCreated);
      }
    } catch (error) {
      console.error("❌ Failed to create folder:", error);
      
      if (Platform.OS === 'web') {
        alert(t.reader.folders.folderError);
      } else {
        Alert.alert(t.reader.folders.folderErrorTitle, t.reader.folders.folderError);
      }
    }
  }

  async function handleSaveTags() {
    if (!article) return;
    
    try {
      const trimmedTags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      console.log('🏷️ Guardando tags:', trimmedTags);
      
      await addTagsToArticle(article.id, trimmedTags);
      
      if (Platform.OS === 'web') {
        alert('✅ Tags guardadas correctamente');
      } else {
        Alert.alert("Éxito", "Tags guardadas correctamente");
      }
      
      setShowTagsModal(false);
    } catch (error) {
      console.error('Error guardando tags:', error);
      
      if (Platform.OS === 'web') {
        alert('❌ Error al guardar las tags');
      } else {
        Alert.alert("Error", "No se pudieron guardar las tags");
      }
    }
  }

  function convertMarkdownToHTML(markdown: string): string {
    let html = markdown;
    
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
    
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    return html;
  }

  async function handleExportToPDF() {
    if (!article) return;

    try {
      console.log('📄 Generando PDF del artículo:', article.title);

      const contentHTML = convertMarkdownToHTML(article.content);
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${article.title}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              
              .article-header {
                margin-bottom: 30px;
                border-bottom: 2px solid #e0e0e0;
                padding-bottom: 20px;
              }
              
              .article-title {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 15px;
                color: #1a1a1a;
                line-height: 1.3;
              }
              
              .article-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                font-size: 14px;
                color: #666;
              }
              
              .domain {
                color: #3b82f6;
                font-weight: 600;
              }
              
              .excerpt {
                font-size: 18px;
                color: #555;
                font-style: italic;
                margin-bottom: 30px;
                padding: 15px;
                background: #f9f9f9;
                border-left: 4px solid #3b82f6;
              }
              
              .article-content {
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 30px;
              }
              
              .article-content h1 { font-size: 28px; margin-top: 30px; margin-bottom: 15px; color: #1a1a1a; }
              .article-content h2 { font-size: 24px; margin-top: 25px; margin-bottom: 12px; color: #2a2a2a; }
              .article-content h3 { font-size: 20px; margin-top: 20px; margin-bottom: 10px; color: #3a3a3a; }
              .article-content p { margin-bottom: 15px; }
              .article-content ul, .article-content ol { margin-bottom: 15px; margin-left: 25px; }
              .article-content li { margin-bottom: 8px; }
              .article-content blockquote { border-left: 4px solid #e0e0e0; padding: 10px 20px; margin: 20px 0; background: #f9f9f9; font-style: italic; }
              .article-content code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 14px; }
              .article-content a { color: #3b82f6; text-decoration: none; }
              .article-content strong { font-weight: 700; color: #1a1a1a; }
              .article-content em { font-style: italic; }
              
              .highlights-section, .notes-section {
                margin-top: 40px;
                margin-bottom: 30px;
              }
              
              .highlights-section h3, .notes-section h3 {
                font-size: 20px;
                margin-bottom: 15px;
                color: #1a1a1a;
              }
              
              .highlight {
                background: #fffbeb;
                border-left: 4px solid #fbbf24;
                padding: 15px;
                margin-bottom: 12px;
              }
              
              .note {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                padding: 15px;
                margin-bottom: 12px;
                border-radius: 6px;
              }
              
              .note-date {
                font-size: 12px;
                color: #666;
                margin-top: 8px;
                display: block;
              }
              
              .tags-section {
                margin-top: 20px;
                margin-bottom: 20px;
                font-size: 14px;
                color: #555;
              }
              
              .source {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                font-size: 14px;
                color: #666;
              }
              
              .source a {
                color: #3b82f6;
                text-decoration: none;
                word-break: break-all;
              }
              
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="article-header">
              <h1 class="article-title">${article.title}</h1>
              <div class="article-meta">
                <span class="domain">${article.domain}</span>
                <span>${article.readingTime} min de lectura</span>
                <span>${new Date(article.savedAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}</span>
              </div>
            </div>
            
            ${article.excerpt ? `<p class="excerpt">${article.excerpt}</p>` : ''}
            
            <div class="article-content">
              ${contentHTML}
            </div>
            
            ${article.highlights && article.highlights.length > 0 ? `
              <div class="highlights-section">
                <h3>Resaltados</h3>
                ${article.highlights.map(h => `
                  <div class="highlight">
                    <p>${h.text}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${article.notes && article.notes.length > 0 ? `
              <div class="notes-section">
                <h3>Notas</h3>
                ${article.notes.map(n => `
                  <div class="note">
                    <p>${n.text}</p>
                    <span class="note-date">${new Date(n.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${article.tags && article.tags.length > 0 ? `
              <div class="tags-section">
                <strong>Tags:</strong> ${article.tags.join(', ')}
              </div>
            ` : ''}
            
            <div class="source">
              <strong>Fuente:</strong> <a href="${article.url}">${article.url}</a>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      console.log('✅ PDF generado:', uri);

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `${article.title.substring(0, 50)}.pdf`;
        link.click();
        alert('PDF descargado exitosamente');
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Compartir PDF',
            UTI: 'com.adobe.pdf',
          });
          console.log('✅ PDF compartido');
        } else {
          Alert.alert('Éxito', 'PDF generado exitosamente');
        }
      }
    } catch (error) {
      console.error('❌ Error exportando PDF:', error);
      if (Platform.OS === 'web') {
        alert('Error al generar el PDF');
      } else {
        Alert.alert('Error', 'No se pudo generar el PDF');
      }
    }
  }



  async function handlePrintArticle() {
    if (!article) return;

    try {
      console.log('🖨️ Imprimiendo artículo:', article.title);

      const contentHTML = convertMarkdownToHTML(article.content);
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${article.title}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              .article-header {
                margin-bottom: 30px;
                border-bottom: 2px solid #e0e0e0;
                padding-bottom: 20px;
              }
              .article-title {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 15px;
                color: #1a1a1a;
                line-height: 1.3;
              }
              .article-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                font-size: 14px;
                color: #666;
              }
              .domain {
                color: #3b82f6;
                font-weight: 600;
              }
              .excerpt {
                font-size: 18px;
                color: #555;
                font-style: italic;
                margin-bottom: 30px;
                padding: 15px;
                background: #f9f9f9;
                border-left: 4px solid #3b82f6;
              }
              .article-content {
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 30px;
              }
              .article-content h1 { font-size: 28px; margin-top: 30px; margin-bottom: 15px; color: #1a1a1a; }
              .article-content h2 { font-size: 24px; margin-top: 25px; margin-bottom: 12px; color: #2a2a2a; }
              .article-content h3 { font-size: 20px; margin-top: 20px; margin-bottom: 10px; color: #3a3a3a; }
              .article-content p { margin-bottom: 15px; }
              .article-content ul, .article-content ol { margin-bottom: 15px; margin-left: 25px; }
              .article-content li { margin-bottom: 8px; }
              .article-content blockquote { border-left: 4px solid #e0e0e0; padding: 10px 20px; margin: 20px 0; background: #f9f9f9; font-style: italic; }
              .article-content code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 14px; }
              .article-content a { color: #3b82f6; text-decoration: none; }
              .article-content strong { font-weight: 700; color: #1a1a1a; }
              .article-content em { font-style: italic; }
              .highlights-section, .notes-section { margin-top: 40px; margin-bottom: 30px; }
              .highlights-section h3, .notes-section h3 { font-size: 20px; margin-bottom: 15px; color: #1a1a1a; }
              .highlight { background: #fffbeb; border-left: 4px solid #fbbf24; padding: 15px; margin-bottom: 12px; }
              .note { background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; margin-bottom: 12px; border-radius: 6px; }
              .note-date { font-size: 12px; color: #666; margin-top: 8px; display: block; }
              .tags-section { margin-top: 20px; margin-bottom: 20px; font-size: 14px; color: #555; }
              .source { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #666; }
              .source a { color: #3b82f6; text-decoration: none; word-break: break-all; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="article-header">
              <h1 class="article-title">${article.title}</h1>
              <div class="article-meta">
                <span class="domain">${article.domain}</span>
                <span>${article.readingTime} min de lectura</span>
                <span>${new Date(article.savedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
            ${article.excerpt ? `<p class="excerpt">${article.excerpt}</p>` : ''}
            <div class="article-content">${contentHTML}</div>
            ${article.highlights && article.highlights.length > 0 ? `<div class="highlights-section"><h3>Resaltados</h3>${article.highlights.map(h => `<div class="highlight"><p>${h.text}</p></div>`).join('')}</div>` : ''}
            ${article.notes && article.notes.length > 0 ? `<div class="notes-section"><h3>Notas</h3>${article.notes.map(n => `<div class="note"><p>${n.text}</p><span class="note-date">${new Date(n.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>`).join('')}</div>` : ''}
            ${article.tags && article.tags.length > 0 ? `<div class="tags-section"><strong>Tags:</strong> ${article.tags.join(', ')}</div>` : ''}
            <div class="source"><strong>Fuente:</strong> <a href="${article.url}">${article.url}</a></div>
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 250);
        }
      } else {
        await Print.printAsync({ html });
      }
      
      console.log('✅ Enviado a impresión');
    } catch (error) {
      console.error('❌ Error imprimiendo:', error);
      if (Platform.OS === 'web') {
        alert('Error al imprimir');
      } else {
        Alert.alert('Error', 'No se pudo imprimir');
      }
    }
  }
}

const createMarkdownStyles = (theme: any, fontSize: number, lineHeight: number, fontFamily: string) => ({
  body: {
    fontSize,
    lineHeight: fontSize * lineHeight,
    color: theme.colors.text,
    fontFamily,
  },
  heading1: {
    fontSize: fontSize * 1.8,
    fontWeight: "700" as const,
    color: theme.colors.text,
    marginTop: 24,
    marginBottom: 12,
    lineHeight: fontSize * 1.8 * 1.3,
  },
  heading2: {
    fontSize: fontSize * 1.5,
    fontWeight: "700" as const,
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 10,
    lineHeight: fontSize * 1.5 * 1.3,
  },
  heading3: {
    fontSize: fontSize * 1.3,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    lineHeight: fontSize * 1.3 * 1.3,
  },
  heading4: {
    fontSize: fontSize * 1.1,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginTop: 14,
    marginBottom: 7,
  },
  heading5: {
    fontSize: fontSize * 1.05,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  heading6: {
    fontSize: fontSize,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    marginBottom: 14,
    fontSize,
    lineHeight: fontSize * lineHeight,
    color: theme.colors.text,
  },
  strong: {
    fontWeight: "700" as const,
    color: theme.colors.text,
  },
  em: {
    fontStyle: "italic" as const,
    color: theme.colors.text,
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: "underline" as const,
  },
  blockquote: {
    backgroundColor: theme.colors.cardBackground,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
  },
  code_inline: {
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: Platform.select({ ios: "Courier", android: "monospace", default: "monospace" }),
    fontSize: fontSize * 0.9,
  },
  code_block: {
    backgroundColor: theme.colors.inputBackground,
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    fontFamily: Platform.select({ ios: "Courier", android: "monospace", default: "monospace" }),
    fontSize: fontSize * 0.9,
  },
  fence: {
    backgroundColor: theme.colors.inputBackground,
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    fontFamily: Platform.select({ ios: "Courier", android: "monospace", default: "monospace" }),
    fontSize: fontSize * 0.9,
  },
  bullet_list: {
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  list_item: {
    flexDirection: "row" as const,
    marginBottom: 6,
  },
  bullet_list_icon: {
    marginRight: 8,
    color: theme.colors.text,
  },
  ordered_list_icon: {
    marginRight: 8,
    color: theme.colors.text,
  },
  table: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    marginVertical: 12,
    overflow: "hidden" as const,
  },
  thead: {
    backgroundColor: theme.colors.cardBackground,
  },
  tbody: {},
  th: {
    padding: 12,
    fontWeight: "600" as const,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  td: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  hr: {
    backgroundColor: theme.colors.border,
    height: 1,
    marginVertical: 16,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginVertical: 12,
    backgroundColor: theme.colors.cardBackground,
  },
});

const createStyles = (theme: any, fontSize: number, lineHeight: number, fontFamily: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: theme.colors.text,
    marginTop: 24,
    marginBottom: 16,
    lineHeight: 36,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  metaText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  articleContentContainer: {
    marginBottom: 32,
  },
  articleContent: {
    fontSize,
    lineHeight: fontSize * lineHeight,
    color: theme.colors.text,
    fontFamily,
  },
  imagesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 16,
  },
  imageContainer: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden" as const,
    backgroundColor: theme.colors.cardBackground,
  },
  articleImage: {
    width: "100%",
    minHeight: 250,
    maxHeight: 400,
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  imageCaption: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: "italic" as const,
    padding: 12,
    paddingTop: 8,
  },
  referencesSection: {
    marginBottom: 32,
  },
  referenceItem: {
    backgroundColor: theme.colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  referenceText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: theme.colors.text,
    marginBottom: 4,
  },
  referenceUrl: {
    fontSize: 13,
    color: theme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  settingsPanel: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: theme.colors.text,
  },
  settingRow: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: theme.colors.text,
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    minWidth: 50,
  },
  themeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.inputBackground,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  themeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "15",
  },
  fontButtons: {
    flexDirection: "row",
    gap: 12,
  },
  fontButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.inputBackground,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fontButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "15",
  },
  fontButtonText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  fontButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: "600" as const,
  },
  floatingActions: {
    position: "absolute",
    right: 16,
    bottom: 80,
    gap: 12,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  playButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  actionsPanel: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  actionsList: {
    gap: 4,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 16,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  notePanel: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  noteInput: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 120,
    marginBottom: 16,
  },
  saveNoteButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveNoteText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  foldersPanel: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  foldersList: {
    maxHeight: 400,
  },
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.inputBackground,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  folderIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  folderText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  newFolderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + "15",
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  newFolderButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: "600" as const,
  },
  newFolderContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  newFolderInput: {
    flex: 1,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  createFolderButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  createFolderText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  listPanel: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  itemsList: {
    maxHeight: 500,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  highlightBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  noteContent: {
    flex: 1,
  },
  noteText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: 6,
  },
  noteDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  tagsSection: {
    marginBottom: 32,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "500" as const,
  },
  tagsHelp: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  selectableText: {
    fontSize,
    lineHeight: fontSize * lineHeight,
    color: theme.colors.text,
    fontFamily,
  },
});