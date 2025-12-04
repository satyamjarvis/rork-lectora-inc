import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/theme-provider";
import { useArticles } from "@/providers/articles-provider";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/language-provider";
import { router } from "expo-router";
import { Plus, Search, Filter, Sun, Sunset, Moon } from "lucide-react-native";
import ArticleCard from "@/components/ArticleCard";
import AddArticleModal from "@/components/AddArticleModal";

import { Article, SortOption } from "@/types/article";

const getTimeBasedGreeting = (t: any) => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: t.home.greeting.goodMorning, icon: Sun };
  } else if (hour >= 12 && hour < 18) {
    return { greeting: t.home.greeting.goodAfternoon, icon: Sun };
  } else if (hour >= 18 && hour < 22) {
    return { greeting: t.home.greeting.goodEvening, icon: Sunset };
  } else {
    return { greeting: t.home.greeting.goodNight, icon: Moon };
  }
};

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { articles, addArticle, deleteArticle, archiveArticle, refreshArticles } = useArticles();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const addButtonScale = useRef(new Animated.Value(1)).current;
  const addButtonRotate = useRef(new Animated.Value(0)).current;

  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles.filter(article => 
      !article.archived && (
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.domain.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    switch (sortBy) {
      case "date":
        return filtered.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
      case "length":
        return filtered.sort((a, b) => b.readingTime - a.readingTime);
      case "title":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case "shuffle":
        return filtered.sort(() => Math.random() - 0.5);
      default:
        return filtered;
    }
  }, [articles, searchQuery, sortBy]);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(addButtonScale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(addButtonScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (filteredAndSortedArticles.length === 0 && !refreshing) {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
      addButtonScale.setValue(1);
    }

    return () => pulseAnimation.stop();
  }, [filteredAndSortedArticles.length, refreshing]);

  const handleAddPress = () => {
    Animated.sequence([
      Animated.timing(addButtonRotate, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(addButtonRotate, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    setShowAddModal(true);
  };

  const rotateInterpolate = addButtonRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshArticles();
    setRefreshing(false);
  };

  const handleArticlePress = (article: Article) => {
    router.push(`/reader/${article.id}`);
  };

  const handleArticleOptions = (article: Article) => {
    Alert.alert(
      t.home.articleOptions.title,
      "",
      [
        {
          text: t.home.articleOptions.archive,
          onPress: () => archiveArticle(article.id),
        },
        {
          text: t.home.articleOptions.delete,
          onPress: () => {
            Alert.alert(
              t.home.articleOptions.deleteConfirmTitle,
              t.home.articleOptions.deleteConfirmMessage,
              [
                { text: t.home.articleOptions.cancel, style: "cancel" },
                { text: t.home.articleOptions.delete, onPress: () => deleteArticle(article.id), style: "destructive" },
              ]
            );
          },
          style: "destructive",
        },
        {
          text: t.home.articleOptions.cancel,
          style: "cancel",
        },
      ]
    );
  };

  const { greeting, icon: GreetingIcon } = getTimeBasedGreeting(t);
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.welcomeSection}>
        <View style={styles.greetingContainer}>
          <GreetingIcon size={24} color={theme.colors.primary} />
          <View style={styles.greetingText}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{user?.name || "Usuario"}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.home.searchPlaceholder}
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <Filter size={20} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Animated.View
            style={{
              transform: [
                { scale: addButtonScale },
                { rotate: rotateInterpolate },
              ],
            }}
          >
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddPress}
            >
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {showSortMenu && (
        <View style={styles.sortMenu}>
          <TouchableOpacity 
            style={styles.sortOption}
            onPress={() => { setSortBy("date"); setShowSortMenu(false); }}
          >
            <Text style={[styles.sortOptionText, sortBy === "date" && styles.sortOptionActive]}>
              {t.home.sortBy.recent}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sortOption}
            onPress={() => { setSortBy("length"); setShowSortMenu(false); }}
          >
            <Text style={[styles.sortOptionText, sortBy === "length" && styles.sortOptionActive]}>
              {t.home.sortBy.readingTime}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sortOption}
            onPress={() => { setSortBy("title"); setShowSortMenu(false); }}
          >
            <Text style={[styles.sortOptionText, sortBy === "title" && styles.sortOptionActive]}>
              {t.home.sortBy.title}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sortOption}
            onPress={() => { setSortBy("shuffle"); setShowSortMenu(false); }}
          >
            <Text style={[styles.sortOptionText, sortBy === "shuffle" && styles.sortOptionActive]}>
              {t.home.sortBy.shuffle}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredAndSortedArticles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => handleArticlePress(item)}
            onLongPress={() => handleArticleOptions(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t.home.emptyState.title}</Text>
            <Text style={styles.emptyText}>
              {t.home.emptyState.description}
            </Text>
          </View>
        }
      />

      <AddArticleModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addArticle}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: theme.colors.text,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterButton: {
    padding: 8,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 8,
  },
  sortMenu: {
    backgroundColor: theme.colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  sortOptionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  sortOptionActive: {
    color: theme.colors.primary,
    fontWeight: "600" as const,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});