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
import { Stack, useRouter } from "expo-router";
import { useTheme } from "@/providers/theme-provider";
import { useArticles } from "@/providers/articles-provider";
import { useLanguage } from "@/providers/language-provider";
import ArticleCard from "@/components/ArticleCard";
import { FileText, ArrowUpDown } from "lucide-react-native";

export default function ArchivedArticlesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const { articles, deleteArticle, unarchiveArticle } = useArticles();
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");

  const archivedArticles = useMemo(() => {
    const filtered = articles.filter(a => a.archived);
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.savedAt).getTime();
      const dateB = new Date(b.savedAt).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [articles, sortOrder]);

  const handleArticleOptions = (articleId: string) => {
    Alert.alert(
      t.archived.articleOptions.title,
      "",
      [
        {
          text: t.archived.articleOptions.unarchive,
          onPress: () => unarchiveArticle(articleId),
        },
        {
          text: t.archived.articleOptions.delete,
          onPress: () => {
            Alert.alert(
              t.archived.articleOptions.deleteConfirmTitle,
              t.archived.articleOptions.deleteConfirmMessage,
              [
                { text: t.archived.articleOptions.cancel, style: "cancel" },
                { text: t.archived.articleOptions.delete, onPress: () => deleteArticle(articleId), style: "destructive" },
              ]
            );
          },
          style: "destructive",
        },
        {
          text: t.archived.articleOptions.cancel,
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
          title: t.archived.title,
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
                {sortOrder === "recent" ? t.archived.sortRecent : t.archived.sortOldest}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <FlatList
          data={archivedArticles}
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
              <Text style={styles.emptyTitle}>{t.archived.emptyState.title}</Text>
              <Text style={styles.emptyText}>
                {t.archived.emptyState.description}
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
