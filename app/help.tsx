import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/theme-provider";
import { useLanguage } from "@/providers/language-provider";
import { 
  HelpCircle,
  Mail,
  BookOpen,
  Settings,
  Download,
  Archive,
  Search,
  Folder,
  Eye,
  Volume2
} from "lucide-react-native";

export default function HelpScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = createStyles(theme);

  const faqData = [
    {
      question: t.help.faq.questions.howToSave.question,
      answer: t.help.faq.questions.howToSave.answer,
      icon: BookOpen
    },
    {
      question: t.help.faq.questions.howToOrganize.question,
      answer: t.help.faq.questions.howToOrganize.answer,
      icon: Folder
    },
    {
      question: t.help.faq.questions.offline.question,
      answer: t.help.faq.questions.offline.answer,
      icon: Download
    },
    {
      question: t.help.faq.questions.customize.question,
      answer: t.help.faq.questions.customize.answer,
      icon: Settings
    },
    {
      question: t.help.faq.questions.readingFeatures.question,
      answer: t.help.faq.questions.readingFeatures.answer,
      icon: Eye
    },
    {
      question: t.help.faq.questions.audio.question,
      answer: t.help.faq.questions.audio.answer,
      icon: Volume2
    },
    {
      question: t.help.faq.questions.search.question,
      answer: t.help.faq.questions.search.answer,
      icon: Search
    },
    {
      question: t.help.faq.questions.archived.question,
      answer: t.help.faq.questions.archived.answer,
      icon: Archive
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.help.title}</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIcon}>
            <HelpCircle size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.welcomeTitle}>{t.help.welcome.title}</Text>
          <Text style={styles.welcomeText}>
            {t.help.welcome.description}
          </Text>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.help.faq.title}</Text>
          {faqData.map((faq, index) => {
            const IconComponent = faq.icon;
            return (
              <View key={index} style={styles.faqCard}>
                <View style={styles.faqHeader}>
                  <View style={styles.faqIconContainer}>
                    <IconComponent size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                </View>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            );
          })}
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.help.contact.title}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.contactRow}>
              <View style={styles.contactIcon}>
                <Mail size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{t.help.contact.email.title}</Text>
                <Text style={styles.contactDetail}>{t.help.contact.email.detail}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.help.tips.title}</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>{t.help.tips.organization.title}</Text>
              <Text style={styles.tipText}>
                {t.help.tips.organization.text}
              </Text>
            </View>
            
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>{t.help.tips.quickReading.title}</Text>
              <Text style={styles.tipText}>
                {t.help.tips.quickReading.text}
              </Text>
            </View>
            
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>{t.help.tips.statistics.title}</Text>
              <Text style={styles.tipText}>
                {t.help.tips.statistics.text}
              </Text>
            </View>
          </View>
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
  welcomeSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary + '20',
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
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
  faqCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  faqIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '20',
    alignItems: "center",
    justifyContent: "center",
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.colors.text,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginLeft: 44,
  },
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 16,
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
});