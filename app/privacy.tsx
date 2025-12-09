import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/theme-provider";
import { useLanguage } from "@/providers/language-provider";
import { 
  Shield,
  Lock,
  Eye,
  Database,
  Share2,
  Settings,
  AlertCircle,
  Mail
} from "lucide-react-native";

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = createStyles(theme);

  const sections = [
    {
      title: t.privacy.sections.dataCollection.title,
      icon: Database,
      content: t.privacy.sections.dataCollection.content
    },
    {
      title: t.privacy.sections.dataUsage.title,
      icon: Settings,
      content: t.privacy.sections.dataUsage.content
    },
    {
      title: t.privacy.sections.dataSharing.title,
      icon: Share2,
      content: t.privacy.sections.dataSharing.content
    },
    {
      title: t.privacy.sections.dataSecurity.title,
      icon: Lock,
      content: t.privacy.sections.dataSecurity.content
    },
    {
      title: t.privacy.sections.userRights.title,
      icon: Eye,
      content: t.privacy.sections.userRights.content
    },
    {
      title: t.privacy.sections.dataRetention.title,
      icon: Database,
      content: t.privacy.sections.dataRetention.content
    },
    {
      title: t.privacy.sections.cookies.title,
      icon: Settings,
      content: t.privacy.sections.cookies.content
    },
    {
      title: t.privacy.sections.policyChanges.title,
      icon: AlertCircle,
      content: t.privacy.sections.policyChanges.content
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.privacy.title}</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerIcon}>
            <Shield size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.headerTitle}>{t.privacy.header.title}</Text>
          <Text style={styles.headerText}>
            {t.privacy.header.description}
          </Text>
          <Text style={styles.lastUpdated}>
            {t.privacy.header.lastUpdated}
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <View key={index} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <IconComponent size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          );
        })}

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>{t.privacy.contact.title}</Text>
          <Text style={styles.contactText}>
            {t.privacy.contact.description}
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => {
              const email = t.privacy.contact.email;
              const subject = encodeURIComponent('Privacy Policy Inquiry');
              const body = encodeURIComponent('Hello,\n\nI have a question about the privacy policy.\n\n');
              const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
              Linking.openURL(mailtoUrl).catch((err) => {
                console.error('Failed to open email client:', err);
              });
            }}
          >
            <Mail size={20} color={theme.colors.primary} />
            <Text style={styles.contactButtonText}>{t.privacy.contact.email}</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Notice */}
        <View style={styles.legalSection}>
          <Text style={styles.legalTitle}>{t.privacy.legal.title}</Text>
          <Text style={styles.legalText}>
            {t.privacy.legal.text}
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  title: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: theme.colors.text,
  },
  headerSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary + '20',
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  headerText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: "italic" as const,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '20',
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: theme.colors.text,
    flex: 1,
  },
  sectionContent: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginLeft: 44,
  },
  contactSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  contactText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.cardBackground,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: "500" as const,
  },
  legalSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 8,
  },
  legalText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 32,
  },
});