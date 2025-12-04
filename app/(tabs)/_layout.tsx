import { Tabs, router } from "expo-router";
import { Home, Folder, Settings, Camera } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/providers/theme-provider";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/language-provider";
import { ActivityIndicator, View, TouchableOpacity } from "react-native";
import CameraModal from "@/components/CameraModal";
import { useArticles } from "@/providers/articles-provider";

export default function TabLayout() {
  const { theme } = useTheme();
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const { addArticle } = useArticles();
  const [showCameraModal, setShowCameraModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          headerTitle: "Lectora",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          headerRight: () => (
            <>
              <TouchableOpacity
                onPress={() => setShowCameraModal(true)}
                style={{
                  marginRight: 16,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Camera size={24} color="#3B82F6" />
              </TouchableOpacity>
              <CameraModal
                visible={showCameraModal}
                onClose={() => setShowCameraModal(false)}
                onAdd={addArticle}
              />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          title: t.tabs.folders,
          tabBarIcon: ({ color }) => <Folder size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}