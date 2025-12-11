import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import { useTheme } from "@/providers/theme-provider";
import { useArticles } from "@/providers/articles-provider";
import { useLanguage } from "@/providers/language-provider";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { 
  ArrowLeft, 
  FileText, 
  Printer,
  Download,
  Check,
  Folder as FolderIcon,
  ChevronRight,
} from "lucide-react-native";
import { Article } from "@/types/article";

export default function ExportPDFScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { articles, folders, getArticlesByFolder } = useArticles();
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  
  const styles = createStyles(theme);

  const activeArticles = selectedFolderId 
    ? getArticlesByFolder(selectedFolderId).filter(a => !a.archived)
    : articles.filter(a => !a.archived);

  const toggleArticleSelection = (articleId: string) => {
    setSelectedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedArticles.size === activeArticles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(activeArticles.map(a => a.id)));
    }
  };

  const convertMarkdownToHTML = (markdown: string): string => {
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
  };

  const generateHTML = (articlesToExport: Article[]): string => {
    const articlesHTML = articlesToExport.map(article => {
      const contentHTML = convertMarkdownToHTML(article.content);
      
      return `
        <div class="article">
          <div class="article-header">
            <h1 class="article-title">${article.title}</h1>
            <div class="article-meta">
              <span class="domain">${article.domain}</span>
              <span class="reading-time">${article.readingTime} min de lectura</span>
              <span class="date">${new Date(article.savedAt).toLocaleDateString('es-ES', {
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
                <div class="highlight" style="border-left-color: ${h.color};">
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
        </div>
        
        <div class="page-break"></div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Artículos Exportados</title>
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
            
            .article {
              margin-bottom: 60px;
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
            
            .article-meta span {
              display: inline-block;
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
            
            .article-content h1 {
              font-size: 28px;
              margin-top: 30px;
              margin-bottom: 15px;
              color: #1a1a1a;
            }
            
            .article-content h2 {
              font-size: 24px;
              margin-top: 25px;
              margin-bottom: 12px;
              color: #2a2a2a;
            }
            
            .article-content h3 {
              font-size: 20px;
              margin-top: 20px;
              margin-bottom: 10px;
              color: #3a3a3a;
            }
            
            .article-content p {
              margin-bottom: 15px;
            }
            
            .article-content ul,
            .article-content ol {
              margin-bottom: 15px;
              margin-left: 25px;
            }
            
            .article-content li {
              margin-bottom: 8px;
            }
            
            .article-content blockquote {
              border-left: 4px solid #e0e0e0;
              padding: 10px 20px;
              margin: 20px 0;
              background: #f9f9f9;
              font-style: italic;
            }
            
            .article-content code {
              background: #f5f5f5;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 14px;
            }
            
            .article-content a {
              color: #3b82f6;
              text-decoration: none;
            }
            
            .article-content a:hover {
              text-decoration: underline;
            }
            
            .article-content strong {
              font-weight: 700;
              color: #1a1a1a;
            }
            
            .article-content em {
              font-style: italic;
            }
            
            .highlights-section,
            .notes-section {
              margin-top: 40px;
              margin-bottom: 30px;
            }
            
            .highlights-section h3,
            .notes-section h3 {
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
            
            .highlight p {
              margin: 0;
            }
            
            .note {
              background: #f0f9ff;
              border: 1px solid #bae6fd;
              padding: 15px;
              margin-bottom: 12px;
              border-radius: 6px;
            }
            
            .note p {
              margin-bottom: 8px;
            }
            
            .note-date {
              font-size: 12px;
              color: #666;
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
            
            .page-break {
              page-break-after: always;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .article {
                page-break-inside: avoid;
              }
              
              .page-break {
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          ${articlesHTML}
        </body>
      </html>
    `;
  };

  const handleExportPDF = async () => {
    if (selectedArticles.size === 0) {
      if (Platform.OS === 'web') {
        alert(t.exportPDF.selectAtLeastOne + ' exportar');
      } else {
        Alert.alert(t.exportPDF.attention, t.exportPDF.selectAtLeastOne + ' exportar');
      }
      return;
    }

    setIsExporting(true);

    try {
      const articlesToExport = activeArticles.filter(a => selectedArticles.has(a.id));
      const html = generateHTML(articlesToExport);

      console.log(`📄 ${t.exportPDF.exportingPDF}`, articlesToExport.length, 'artículos');

      const { uri } = await Print.printToFileAsync({ html });
      console.log('✅ PDF generado:', uri);

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `articulos_${Date.now()}.pdf`;
        link.click();
        alert(t.exportPDF.pdfDownloaded);
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: t.exportPDF.sharePDF,
            UTI: 'com.adobe.pdf',
          });
          console.log('✅ PDF compartido');
        } else {
          Alert.alert(t.exportPDF.sharePDF, t.exportPDF.pdfGenerated + ' ' + uri);
        }
      }
    } catch (error) {
      console.error('❌ Error exportando PDF:', error);
      if (Platform.OS === 'web') {
        alert(t.exportPDF.errorGeneratingPDF);
      } else {
        Alert.alert(t.exportPDF.error, t.exportPDF.errorGeneratingPDF);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    if (selectedArticles.size === 0) {
      if (Platform.OS === 'web') {
        alert(t.exportPDF.selectAtLeastOne + ' imprimir');
      } else {
        Alert.alert(t.exportPDF.attention, t.exportPDF.selectAtLeastOne + ' imprimir');
      }
      return;
    }

    setIsExporting(true);

    try {
      const articlesToExport = activeArticles.filter(a => selectedArticles.has(a.id));
      const html = generateHTML(articlesToExport);

      console.log(`🖨️ ${t.exportPDF.printingArticles}`, articlesToExport.length, 'artículos');

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
      
      console.log(`✅ ${t.exportPDF.sentToPrint}`);
    } catch (error) {
      console.error('❌ Error imprimiendo:', error);
      if (Platform.OS === 'web') {
        alert(t.exportPDF.errorPrinting);
      } else {
        Alert.alert(t.exportPDF.error, t.exportPDF.errorPrinting);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: t.settings.content.exportPrint,
          headerBackTitle: t.archived.articleOptions.cancel,
        }} 
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.exportPDF.title}</Text>
            <Text style={styles.subtitle}>
              {t.exportPDF.subtitle}
            </Text>
          </View>

          <View style={styles.filtersSection}>
            <Text style={styles.sectionTitle}>{t.exportPDF.filterByFolder}</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.foldersScroll}
            >
              <TouchableOpacity
                style={[
                  styles.folderChip,
                  selectedFolderId === null && styles.folderChipActive,
                ]}
                onPress={() => setSelectedFolderId(null)}
              >
                <FileText 
                  size={16} 
                  color={selectedFolderId === null ? "#FFFFFF" : theme.colors.text} 
                />
                <Text 
                  style={[
                    styles.folderChipText,
                    selectedFolderId === null && styles.folderChipTextActive,
                  ]}
                >
                  {t.exportPDF.all} ({articles.filter(a => !a.archived).length})
                </Text>
              </TouchableOpacity>

              {folders.map(folder => {
                const count = getArticlesByFolder(folder.id).filter(a => !a.archived).length;
                return (
                  <TouchableOpacity
                    key={folder.id}
                    style={[
                      styles.folderChip,
                      selectedFolderId === folder.id && styles.folderChipActive,
                    ]}
                    onPress={() => setSelectedFolderId(folder.id)}
                  >
                    <FolderIcon 
                      size={16} 
                      color={selectedFolderId === folder.id ? "#FFFFFF" : theme.colors.text} 
                    />
                    <Text 
                      style={[
                        styles.folderChipText,
                        selectedFolderId === folder.id && styles.folderChipTextActive,
                      ]}
                    >
                      {folder.name} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={selectAll}
            >
              <Check 
                size={18} 
                color={theme.colors.primary} 
              />
              <Text style={styles.selectAllText}>
                {selectedArticles.size === activeArticles.length ? t.exportPDF.deselectAll : t.exportPDF.selectAll}
              </Text>
            </TouchableOpacity>
            <Text style={styles.selectedCount}>
              {selectedArticles.size} {t.exportPDF.selected}
            </Text>
          </View>

          <View style={styles.articlesSection}>
            {activeArticles.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyStateText}>
                  {t.exportPDF.noArticlesInFolder}
                </Text>
              </View>
            ) : (
              activeArticles.map(article => (
                <TouchableOpacity
                  key={article.id}
                  style={[
                    styles.articleCard,
                    selectedArticles.has(article.id) && styles.articleCardSelected,
                  ]}
                  onPress={() => toggleArticleSelection(article.id)}
                >
                  <View style={styles.checkboxContainer}>
                    <View 
                      style={[
                        styles.checkbox,
                        selectedArticles.has(article.id) && styles.checkboxChecked,
                      ]}
                    >
                      {selectedArticles.has(article.id) && (
                        <Check size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.articleInfo}>
                    <Text style={styles.articleTitle} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <View style={styles.articleMeta}>
                      <Text style={styles.articleDomain}>{article.domain}</Text>
                      <Text style={styles.articleReadingTime}>
                        {article.readingTime} {t.exportPDF.minutes}
                      </Text>
                      {article.highlights && article.highlights.length > 0 && (
                        <Text style={styles.articleBadge}>
                          {article.highlights.length} {t.exportPDF.highlights}
                        </Text>
                      )}
                      {article.notes && article.notes.length > 0 && (
                        <Text style={styles.articleBadge}>
                          {article.notes.length} {t.exportPDF.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {selectedArticles.size > 0 && (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.exportButton]}
              onPress={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Download size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>{t.exportPDF.exportButton}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.printButton]}
              onPress={handlePrint}
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <>
                  <Printer size={20} color={theme.colors.primary} />
                  <Text style={[styles.actionButtonText, styles.printButtonText]}>
                    {t.exportPDF.printButton}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: theme.colors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  foldersScroll: {
    flexDirection: "row" as const,
  },
  folderChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  folderChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  folderChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: theme.colors.text,
  },
  folderChipTextActive: {
    color: "#FFFFFF",
  },
  actionsBar: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.cardBackground,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  selectAllButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: theme.colors.primary,
  },
  selectedCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: "500" as const,
  },
  articlesSection: {
    paddingHorizontal: 20,
  },
  articleCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  articleCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + "10",
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  articleMeta: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  articleDomain: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "500" as const,
  },
  articleReadingTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  articleBadge: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.inputBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  bottomActions: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row" as const,
    gap: 12,
    padding: 20,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  exportButton: {
    backgroundColor: theme.colors.primary,
  },
  printButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  printButtonText: {
    color: theme.colors.primary,
  },
});
