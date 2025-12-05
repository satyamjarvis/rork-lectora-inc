import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/providers/theme-provider";
import { useArticles } from "@/providers/articles-provider";
import { useLanguage } from "@/providers/language-provider";
import { Plus, FolderOpen, ChevronRight } from "lucide-react-native";

export default function FoldersScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const { folders, addFolder, deleteFolder, getArticlesByFolder } = useArticles();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName("");
      setShowAddModal(false);
    }
  };

  const handleFolderOptions = (folderId: string, folderName: string) => {
    Alert.alert(
      t.folders.folderOptions.title,
      folderName,
      [
        {
          text: t.folders.folderOptions.delete,
          onPress: () => {
            Alert.alert(
              t.folders.folderOptions.deleteConfirmTitle,
              t.folders.folderOptions.deleteConfirmMessage,
              [
                { text: t.folders.folderOptions.cancel, style: "cancel" },
                { text: t.folders.folderOptions.delete, onPress: () => deleteFolder(folderId), style: "destructive" },
              ]
            );
          },
          style: "destructive",
        },
        {
          text: t.folders.folderOptions.cancel,
          style: "cancel",
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Plus size={20} color={theme.colors.primary} />
        <Text style={styles.addButtonText}>{t.folders.createNewFolder}</Text>
      </TouchableOpacity>

      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const articleCount = getArticlesByFolder(item.id).length;
          return (
            <TouchableOpacity 
              style={styles.folderItem}
              onPress={() => router.push(`/folder/${item.id}`)}
              onLongPress={() => handleFolderOptions(item.id, item.name)}
            >
              <View style={styles.folderIcon}>
                <FolderOpen size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.folderInfo}>
                <Text style={styles.folderName}>{item.name}</Text>
                <Text style={styles.folderCount}>
                  {articleCount} {articleCount === 1 ? t.folders.articleCount.single : t.folders.articleCount.multiple}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FolderOpen size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>{t.folders.emptyState.title}</Text>
            <Text style={styles.emptyText}>
              {t.folders.emptyState.description}
            </Text>
          </View>
        }
      />

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.folders.createFolderModal.title}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t.folders.createFolderModal.placeholder}
              placeholderTextColor={theme.colors.textSecondary}
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonCancel}
                onPress={() => {
                  setNewFolderName("");
                  setShowAddModal(false);
                }}
              >
                <Text style={styles.modalButtonCancelText}>{t.folders.createFolderModal.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonConfirm}
                onPress={handleAddFolder}
              >
                <Text style={styles.modalButtonConfirmText}>{t.folders.createFolderModal.create}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    padding: 16,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: "dashed" as const,
  },
  addButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: "500" as const,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  folderIcon: {
    marginRight: 12,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 4,
  },
  folderCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  modalButtonCancelText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "500" as const,
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  modalButtonConfirmText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },
});