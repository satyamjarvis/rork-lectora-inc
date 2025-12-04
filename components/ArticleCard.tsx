import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/providers/theme-provider";
import { Article } from "@/types/article";
import { Clock, BookmarkCheck, Tag, Youtube } from "lucide-react-native";

interface ArticleCardProps {
  article: Article;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function ArticleCard({ article, onPress, onLongPress }: ArticleCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
      {article.imageUrl && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: article.imageUrl }} 
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          {article.isVideo && (
            <View style={styles.videoOverlay}>
              <View style={styles.playButton}>
                <Youtube size={32} color="#FFFFFF" />
              </View>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.domain}>{article.domain}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.excerpt} numberOfLines={2}>
          {article.excerpt}
        </Text>
        
        {article.tags && article.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {article.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Tag size={10} color={theme.colors.primary} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {article.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{article.tags.length - 3}</Text>
            )}
          </View>
        )}
        
        <View style={styles.footer}>
          <View style={styles.metadata}>
            <Clock size={14} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{article.readingTime} min</Text>
          </View>
          
          {article.bookmarked && (
            <BookmarkCheck size={16} color={theme.colors.primary} />
          )}
        </View>
      </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageContainer: {
    position: "relative" as const,
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: theme.colors.inputBackground,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  domain: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  excerpt: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primary + "10",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary + "40",
  },
  tagText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: "500" as const,
  },
  moreTagsText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: "500" as const,
    alignSelf: "center",
  },
});