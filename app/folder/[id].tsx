import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useTheme } from "@/providers/theme-provider";
import { useArticles } from "@/providers/articles-provider";
import { useLanguage } from "@/providers/language-provider";
import ArticleCard from "@/components/ArticleCard";
import { FileText, ArrowUpDown } from "lucide-react-native";

export default function FolderArticlesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const { folders, getArticlesByFolder, deleteArticle, archiveArticle } = useArticles();
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");

  const folder = folders.find(f => f.id === id);
  const articlesRaw = getArticlesByFolder(id!);

  const articles = useMemo(() => {
    const sorted = [...articlesRaw].sort((a, b) => {
      const dateA = new Date(a.savedAt).getTime();
      const dateB = new Date(b.savedAt).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [articlesRaw, sortOrder]);

  const handleArticleOptions = (articleId: string) => {
    Alert.alert(
      t.folderArticles.articleOptions.title,
      "",
      [
        {
          text: t.folderArticles.articleOptions.archive,
          onPress: () => archiveArticle(articleId),
        },
        {
          text: t.folderArticles.articleOptions.delete,
          onPress: () => {
            Alert.alert(
              t.folderArticles.articleOptions.deleteConfirmTitle,
              t.folderArticles.articleOptions.deleteConfirmMessage,
              [
                { text: t.folderArticles.articleOptions.cancel, style: "cancel" },
                { text: t.folderArticles.articleOptions.delete, onPress: () => deleteArticle(articleId), style: "destructive" },
              ]
            );
          },
          style: "destructive",
        },
        {
          text: t.folderArticles.articleOptions.cancel,
          style: "cancel",
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <>
      <Stack.Screen 
        options={{
          title: folder?.name || "Folder",
          headerStyle: {
            backgroundColor: theme.colors.cardBackground,
          },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setSortOrder(prev => prev === "recent" ? "oldest" : "recent")}
              style={styles.sortButton}
            >
              <ArrowUpDown size={20} color={theme.colors.text} />
              <Text style={styles.sortText}>
                {sortOrder === "recent" ? t.folderArticles.sortRecent : t.folderArticles.sortOldest}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ArticleCard
              article={item}
              onPress={() => router.push(`/reader/${item.id}`)}
              onLongPress={() => handleArticleOptions(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FileText size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>{t.folderArticles.emptyState.title}</Text>
              <Text style={styles.emptyText}>
                {t.folderArticles.emptyState.description}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
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
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  sortText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: theme.colors.text,
  },
});
