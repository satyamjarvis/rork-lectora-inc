import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

const lightTheme = {
  colors: {
    primary: "#007AFF",
    background: "#FFFFFF",
    cardBackground: "#FFFFFF",
    inputBackground: "#F5F5F7",
    text: "#000000",
    textSecondary: "#6B7280",
    border: "#E5E5EA",
    error: "#FF3B30",
    success: "#10B981",
  },
};

const darkTheme = {
  colors: {
    primary: "#0A84FF",
    background: "#000000",
    cardBackground: "#1C1C1E",
    inputBackground: "#2C2C2E",
    text: "#FFFFFF",
    textSecondary: "#8E8E93",
    border: "#38383A",
    error: "#FF453A",
    success: "#10B981",
  },
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem("theme");
      if (stored === "dark") {
        setIsDarkMode(true);
      }
    } catch (error) {
      console.error("Failed to load theme preference:", error);
      setIsDarkMode(false);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem("theme", newMode ? "dark" : "light");
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  return {
    theme,
    isDarkMode,
    toggleTheme,
  };
});