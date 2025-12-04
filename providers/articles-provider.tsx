import { useState, useEffect, useCallback, useMemo } from "react";
import { Platform } from "react-native";
import createContextHook from "@nkzw/create-context-hook";
import { Article, Folder, ArticleImage, ArticleReference, Highlight, Note } from "@/types/article";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./auth-provider";
import { z } from "zod";
import { trpcClient, trpcConfig } from "@/lib/trpc";
import { loadToolkitModule } from "@/lib/rorkToolkit";

const DIRECT_FETCH_TIMEOUT_MS = 30000;

const ARTICLE_FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Cache-Control": "max-age=0",
} as const;

const resolveEnvVar = (key: string): string | undefined => {
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key] ?? undefined;
  }

  const globalProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } })?.process;
  return globalProcess?.env?.[key] ?? undefined;
};

export const [ArticlesProvider, useArticles] = createContextHook(() => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadData = useCallback(async () => {
    try {
      if (!user) {
        setArticles([]);
        setFolders([]);
        setIsLoading(false);
        return;
      }
      
      if (!supabase) {
        console.error('⚠️ Supabase no está inicializado');
        setIsLoading(false);
        return;
      }
      
      const loadTimeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Data load timeout')), 10000)
      );
      
      const dataPromise = Promise.all([
        supabase
          .from('articles')
          .select('*')
          .eq('user_id', user.id)
          .order('saved_at', { ascending: false }),
        supabase
          .from('folders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);
      
      let results;
      try {
        results = await Promise.race([dataPromise, loadTimeout]);
      } catch {
        console.warn('⏱️ Timeout cargando datos, continuando con datos vacíos');
        setArticles([]);
        setFolders([]);
        setIsLoading(false);
        return;
      }
      
      const [articlesResult, foldersResult] = results;

      if (articlesResult.error) throw articlesResult.error;
      if (foldersResult.error) throw foldersResult.error;

      const mappedArticles: Article[] = (articlesResult.data || []).map(a => ({
        id: a.id,
        url: a.url,
        title: a.title,
        excerpt: a.excerpt || '',
        content: a.content,
        domain: a.domain,
        imageUrl: a.image_url || undefined,
        images: (a.images || []) as ArticleImage[],
        references: (a.references || []) as ArticleReference[],
        highlights: (a.highlights || []) as Highlight[],
        notes: (a.notes || []) as Note[],
        tags: (a.tags || []) as string[],
        readingTime: a.reading_time,
        savedAt: a.saved_at,
        bookmarked: a.bookmarked,
        archived: a.archived,
        folderId: a.folder_id || undefined,
        isVideo: a.is_video || false,
        videoId: a.video_id || undefined,
      }));

      const mappedFolders: Folder[] = (foldersResult.data || []).map(f => ({
        id: f.id,
        name: f.name,
        createdAt: f.created_at,
      }));

      setArticles(mappedArticles);
      setFolders(mappedFolders);
    } catch (error: any) {
      const errorMessage = error?.message || JSON.stringify(error) || 'Unknown error';
      console.error("Failed to load data:", errorMessage);
      setArticles([]);
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateReferenceImage = useCallback(async (title: string, excerpt: string): Promise<string | null> => {
    try {
      console.log('🎨 Generando imagen de referencia para:', title.substring(0, 50));
      
      const imagePrompt = `Crea una imagen profesional y relevante para un artículo llamado "${title}". ${excerpt ? `El artículo trata sobre: ${excerpt.substring(0, 150)}` : ''}`;
      
      const response = await fetch('https://toolkit.rork.com/images/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          size: '1024x1024'
        }),
      });

      if (!response.ok) {
        console.error('❌ Error generando imagen:', response.status);
        return null;
      }

      const data = await response.json();
      const base64Image = `data:${data.image.mimeType};base64,${data.image.base64Data}`;
      
      console.log('✅ Imagen de referencia generada exitosamente');
      return base64Image;
    } catch (error) {
      console.error('❌ Error generando imagen de referencia:', error);
      return null;
    }
  }, []);

  const stripHTML = useCallback((html: string): string => {
    let text = html;
    
    text = text.replace(/<script[^>]*>.*?<\/script>/gis, '');
    text = text.replace(/<style[^>]*>.*?<\/style>/gis, '');
    text = text.replace(/<iframe[^>]*>.*?<\/iframe>/gis, '');
    text = text.replace(/<noscript[^>]*>.*?<\/noscript>/gis, '');
    text = text.replace(/<svg[^>]*>.*?<\/svg>/gis, '');
    text = text.replace(/<!--.*?-->/gis, '');
    
    text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gis, '\n\n# $1\n\n');
    text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gis, '\n\n## $1\n\n');
    text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gis, '\n\n### $1\n\n');
    text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gis, '\n\n#### $1\n\n');
    text = text.replace(/<h5[^>]*>(.*?)<\/h5>/gis, '\n\n##### $1\n\n');
    text = text.replace(/<h6[^>]*>(.*?)<\/h6>/gis, '\n\n###### $1\n\n');
    
    text = text.replace(/<div[^>]*>(.*?)<\/div>/gis, '$1\n');
    text = text.replace(/<section[^>]*>(.*?)<\/section>/gis, '$1\n');
    text = text.replace(/<article[^>]*>(.*?)<\/article>/gis, '$1\n');
    text = text.replace(/<main[^>]*>(.*?)<\/main>/gis, '$1\n');
    text = text.replace(/<header[^>]*>(.*?)<\/header>/gis, '');
    text = text.replace(/<footer[^>]*>(.*?)<\/footer>/gis, '');
    text = text.replace(/<nav[^>]*>(.*?)<\/nav>/gis, '');
    text = text.replace(/<aside[^>]*>(.*?)<\/aside>/gis, '');
    
    text = text.replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    
    text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gis, '**$1**');
    text = text.replace(/<b[^>]*>(.*?)<\/b>/gis, '**$1**');
    text = text.replace(/<em[^>]*>(.*?)<\/em>/gis, '*$1*');
    text = text.replace(/<i[^>]*>(.*?)<\/i>/gis, '*$1*');
    text = text.replace(/<u[^>]*>(.*?)<\/u>/gis, '$1');
    
    text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gis, '[$2]($1)');
    
    text = text.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match: string, content: string) => {
      return '\n' + content.replace(/<li[^>]*>(.*?)<\/li>/gis, (m: string, li: string) => {
        const cleaned = li.replace(/<[^>]+>/g, '').trim();
        return cleaned ? `- ${cleaned}\n` : '';
      });
    });
    text = text.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match: string, content: string) => {
      let counter = 1;
      return '\n' + content.replace(/<li[^>]*>(.*?)<\/li>/gis, (m: string, li: string) => {
        const cleaned = li.replace(/<[^>]+>/g, '').trim();
        return cleaned ? `${counter++}. ${cleaned}\n` : '';
      });
    });
    
    text = text.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
      const cleaned = content.replace(/<[^>]+>/g, '').trim();
      return '\n> ' + cleaned + '\n\n';
    });
    
    text = text.replace(/<code[^>]*>(.*?)<\/code>/gis, '`$1`');
    text = text.replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```\n');
    
    text = text.replace(/<img[^>]*>/gi, '');
    text = text.replace(/<figure[^>]*>.*?<\/figure>/gis, '');
    text = text.replace(/<picture[^>]*>.*?<\/picture>/gis, '');
    text = text.replace(/<video[^>]*>.*?<\/video>/gis, '');
    text = text.replace(/<audio[^>]*>.*?<\/audio>/gis, '');
    text = text.replace(/<canvas[^>]*>.*?<\/canvas>/gis, '');
    
    text = text.replace(/<table[^>]*>.*?<\/table>/gis, '');
    text = text.replace(/<form[^>]*>.*?<\/form>/gis, '');
    text = text.replace(/<button[^>]*>.*?<\/button>/gis, '');
    text = text.replace(/<input[^>]*>/gi, '');
    text = text.replace(/<select[^>]*>.*?<\/select>/gis, '');
    text = text.replace(/<textarea[^>]*>.*?<\/textarea>/gis, '');
    
    text = text.replace(/<span[^>]*>(.*?)<\/span>/gis, '$1');
    text = text.replace(/<[^>]+>/g, '');
    
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&#x27;/g, "'");
    text = text.replace(/&mdash;/g, '—');
    text = text.replace(/&ndash;/g, '–');
    text = text.replace(/&hellip;/g, '...');
    text = text.replace(/&ldquo;/g, '"');
    text = text.replace(/&rdquo;/g, '"');
    text = text.replace(/&lsquo;/g, "'");
    text = text.replace(/&rsquo;/g, "'");
    text = text.replace(/&#\d+;/g, '');
    text = text.replace(/&[a-zA-Z]+;/g, '');
    
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.replace(/[ \t]+/g, ' ');
    text = text.split('\n').map(line => line.trim()).join('\n');
    text = text.trim();
    
    return text;
  }, []);

  const convertHTMLToMarkdown = useCallback(async (html: string): Promise<string> => {
    try {
      console.log('🔄 Convirtiendo HTML a Markdown limpio...');
      let cleanText = stripHTML(html);
      
      cleanText = cleanText.replace(/\*\*\s*\*\*/g, '');
      cleanText = cleanText.replace(/\*\s*\*/g, '');
      cleanText = cleanText.replace(/\[\s*\]\(\s*\)/g, '');
      
      cleanText = cleanText.replace(/^\s*[-*]\s*$/gm, '');
      
      cleanText = cleanText.replace(/\n{3,}/g, '\n\n');
      cleanText = cleanText.trim();
      
      console.log(`✅ HTML convertido: ${cleanText.length} caracteres`);
      return cleanText;
    } catch (error) {
      console.error('Failed to convert HTML to Markdown:', error);
      return html.replace(/<[^>]*>/g, '').trim();
    }
  }, [stripHTML]);

  const fetchArticleHtml = useCallback(async (url: string): Promise<string> => {
    let lastError: Error | null = null;

    if (trpcConfig.isConfigured) {
      try {
        const backendResult = await trpcClient.articles.fetchUrl.query({ url });
        console.log(`✅ Backend fetcheó ${backendResult.html.length} caracteres`);
        return backendResult.html;
      } catch (error: any) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error('❌ Error en backend fetch:', lastError.message);
      }
    } else {
      console.warn('⚠️ Backend TRPC no configurado, se intentará fetch directo.');
    }

    if (Platform.OS !== "web") {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DIRECT_FETCH_TIMEOUT_MS);
      try {
        const response = await fetch(url, {
          headers: ARTICLE_FETCH_HEADERS,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        console.log(`✅ Fetch directo obtuvo ${html.length} caracteres`);
        return html;
      } catch (error: any) {
        const formattedError = error instanceof Error ? error : new Error(String(error));
        console.error('❌ Fetch directo falló:', formattedError.message);
        lastError = formattedError;
      } finally {
        clearTimeout(timeoutId);
      }
    } else {
      console.warn('⚠️ Fetch directo no disponible en web por CORS. Configura backend remoto.');
    }

    if (lastError) {
      throw lastError;
    }

    throw new Error('No se pudo obtener el artículo desde ninguna fuente.');
  }, []);

  const extractWithRapidAPI = useCallback(async (url: string): Promise<{
    title: string;
    excerpt: string;
    content: string;
    imageUrl: string | null;
    images: ArticleImage[];
    references: ArticleReference[];
  }> => {
    const apiKey = resolveEnvVar("EXPO_PUBLIC_X-RapidAPI-Key")?.trim()
      ?? resolveEnvVar("EXPO_PUBLIC_x-rapidapi-key")?.trim();
    const apiHost = resolveEnvVar("EXPO_PUBLIC_X-RapidAPI-Host")?.trim()
      ?? resolveEnvVar("EXPO_PUBLIC_x-rapidapi-host")?.trim()
      ?? 'article-extractor-and-summarizer.p.rapidapi.com';

    if (!apiKey) {
      throw new Error('RapidAPI credentials not configured');
    }

    console.log('Trying RapidAPI extractor...');

    const response = await fetch(`https://${apiHost}/extract?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost,
      },
    });

    if (!response.ok) {
      throw new Error(`RapidAPI error: ${response.status}`);
    }

    const data = await response.json();
    console.log('RapidAPI extraction result:', data);

    const images: ArticleImage[] = [];
    if (data.image) {
      images.push({
        url: data.image,
        alt: data.title || 'Article image',
        caption: undefined,
      });
    }

    if (data.images && Array.isArray(data.images)) {
      data.images.forEach((imgUrl: string) => {
        if (imgUrl && imgUrl !== data.image) {
          images.push({
            url: imgUrl,
            alt: 'Article image',
            caption: undefined,
          });
        }
      });
    }

    const references: ArticleReference[] = [{
      text: 'Artículo original',
      url: url,
    }];

    if (data.links && Array.isArray(data.links)) {
      data.links.forEach((link: any) => {
        if (link.url && link.text && link.url !== url) {
          references.push({
            text: link.text,
            url: link.url,
          });
        }
      });
    }

    console.log(`✅ RapidAPI extracted ${images.length} images`);

    let content = data.text || data.content || '';

    if (data.html || data.content_html) {
      console.log('Converting HTML to Markdown format...');
      const htmlContent = data.html || data.content_html;
      content = await convertHTMLToMarkdown(htmlContent);
    }

    return {
      title: data.title || 'Untitled Article',
      excerpt: data.excerpt || data.description || '',
      content,
      imageUrl: data.image || null,
      images,
      references,
    };
  }, [convertHTMLToMarkdown]);

  const extractWithDirectFetch = useCallback(async (url: string): Promise<{
    title: string;
    excerpt: string;
    content: string;
    imageUrl: string | null;
    images: ArticleImage[];
    references: ArticleReference[];
  }> => {
    console.log('🌐 Iniciando extracción avanzada de artículo...');

    let html: string;
    try {
      html = await fetchArticleHtml(url);
      console.log(`✅ Fuente HTML lista con ${html.length} caracteres, extrayendo contenido con IA...`);
    } catch (fetchError: any) {
      console.error('❌ Error al obtener el HTML del artículo:', fetchError);
      throw new Error(`Backend fetch failed: ${fetchError?.message || fetchError}`);
    }

    const origin = new URL(url).origin;

    const schema = z.object({
      title: z.string().describe('El título del artículo'),
      description: z.string().describe('Una descripción corta del artículo (máximo 300 caracteres)'),
      mainImageUrl: z.string().nullable().describe('La URL de la imagen principal del artículo (og:image o primera imagen grande). IMPORTANTE: Convierte URLs relativas a absolutas agregando el dominio. Si es relativa como /img/foto.jpg convierte a URL absoluta'),
      content: z.string().describe('El contenido del artículo en formato markdown limpio. Incluye títulos, subtítulos, párrafos completos y listas. NO incluyas HTML ni etiquetas. Convierte todo a markdown puro con # para títulos, ## para subtítulos, **negrita**, *cursiva*, listas con -, etc.'),
    });

    let extractedData;
    try {
      console.log('🤖 Llamando a IA para extraer contenido...');
      const { generateObject } = await loadToolkitModule();
      extractedData = await generateObject({
        schema,
        messages: [{
          role: 'user',
          content: `Extrae el contenido principal de este artículo web.

URL: ${url}
Dominio base: ${origin}

⚠️ IMPORTANTE: RESPETA EL IDIOMA ORIGINAL DEL ARTÍCULO. NO TRADUZCAS NADA.
Si el artículo está en inglés, mantén todo en inglés.
Si el artículo está en español, mantén todo en español.
Si el artículo está en otro idioma, manténlo en ese idioma.

INSTRUCCIONES:
1. Extrae el TÍTULO del artículo (en su idioma original)
2. Extrae una DESCRIPCIÓN corta (máximo 300 caracteres, en su idioma original)
3. Extrae la IMAGEN PRINCIPAL:
   - Busca en <meta property="og:image">
   - Busca en <meta name="twitter:image">
   - Busca la primera <img> grande en el contenido
   - Si la URL es relativa (empieza con /), conviértela a absoluta: ${origin}/ruta
   - Si empieza con //, conviértela a: https://ruta

4. Extrae el CONTENIDO COMPLETO en MARKDOWN (EN SU IDIOMA ORIGINAL):
   - Convierte <h1> a # Título
   - Convierte <h2> a ## Subtítulo
   - Convierte <h3> a ### Subtítulo
   - Convierte <strong> o <b> a **texto**
   - Convierte <em> o <i> a *texto*
   - Convierte <ul><li> a listas con -
   - Convierte <ol><li> a listas numeradas
   - Separa párrafos con líneas en blanco
   - NO incluyas HTML, solo markdown limpio
   - NO incluyas navegación, menús, footers, anuncios
   - NO TRADUZCAS: mantén el idioma original del contenido
   - SOLO el contenido principal del artículo

HTML (primeros 100000 caracteres):
${html.substring(0, 100000)}`
        }]
      });
    } catch (aiError: any) {
      console.error('❌ Error en extracción con IA:', aiError);
      throw new Error(`No se pudo extraer el artículo. Por favor intenta con otra URL.`);
    }

    console.log(`✅ Artículo extraído:`);
    console.log(`   - Título: ${extractedData.title}`);
    console.log(`   - Contenido: ${extractedData.content.length} caracteres`);
    console.log(`   - Imagen principal: ${extractedData.mainImageUrl ? 'Sí' : 'No'}`);

    let mainImageUrl = extractedData.mainImageUrl;
    
    if (mainImageUrl && !mainImageUrl.startsWith('http')) {
      if (mainImageUrl.startsWith('//')) {
        mainImageUrl = 'https:' + mainImageUrl;
      } else if (mainImageUrl.startsWith('/')) {
        mainImageUrl = origin + mainImageUrl;
      } else {
        mainImageUrl = origin + '/' + mainImageUrl;
      }
      console.log(`🔗 URL de imagen convertida a absoluta: ${mainImageUrl}`);
    }

    const images: ArticleImage[] = [];
    if (mainImageUrl) {
      images.push({
        url: mainImageUrl,
        alt: extractedData.title,
        caption: undefined,
      });
    }

    if (images.length === 0) {
      console.log('⚠️ No se encontró imagen, generando una...');
      const generatedImage = await generateReferenceImage(extractedData.title, extractedData.description);
      if (generatedImage) {
        images.push({
          url: generatedImage,
          alt: `Imagen para: ${extractedData.title}`,
          caption: 'Imagen generada por IA',
        });
        mainImageUrl = generatedImage;
      }
    }

    const references: ArticleReference[] = [
      { text: 'Artículo original', url }
    ];

    return {
      title: extractedData.title,
      excerpt: extractedData.description.substring(0, 300),
      content: extractedData.content,
      imageUrl: mainImageUrl,
      images,
      references,
    };
  }, [fetchArticleHtml, generateReferenceImage]);

  const extractYouTubeId = useCallback((url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }, []);

  const addYouTubeVideo = useCallback(async (url: string, videoId: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      console.log('Adding YouTube video:', videoId);

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      const videoTitle = `Video de YouTube: ${videoId}`;
      const videoExcerpt = 'Video guardado de YouTube. Haz clic para reproducir en YouTube.';
      const videoContent = `# Video de YouTube\n\n[Ver video en YouTube](${url})\n\nID del video: ${videoId}`;

      const newArticle = {
        user_id: user.id,
        url,
        title: videoTitle,
        excerpt: videoExcerpt,
        content: videoContent,
        domain: 'youtube.com',
        image_url: thumbnailUrl,
        images: [{
          url: thumbnailUrl,
          alt: videoTitle,
          caption: 'Miniatura del video de YouTube',
        }],
        references: [{ text: 'Ver en YouTube', url }],
        reading_time: 0,
        bookmarked: false,
        archived: false,
        saved_at: new Date().toISOString(),
        is_video: true,
        video_id: videoId,
      };

      const { data, error } = await supabase
        .from('articles')
        .insert(newArticle)
        .select()
        .single();

      if (error) throw error;

      const mappedArticle: Article = {
        id: data.id,
        url: data.url,
        title: data.title,
        excerpt: data.excerpt || '',
        content: data.content,
        domain: data.domain,
        imageUrl: data.image_url || undefined,
        images: (data.images || []) as ArticleImage[],
        references: (data.references || []) as ArticleReference[],
        highlights: (data.highlights || []) as Highlight[],
        notes: (data.notes || []) as Note[],
        tags: (data.tags || []) as string[],
        readingTime: data.reading_time,
        savedAt: data.saved_at,
        bookmarked: data.bookmarked,
        archived: data.archived,
        folderId: data.folder_id || undefined,
        isVideo: data.is_video || false,
        videoId: data.video_id || undefined,
      };

      setArticles(prev => [mappedArticle, ...prev]);
      console.log('✅ YouTube video added successfully:', mappedArticle.id);
    } catch (error) {
      console.error("Failed to add YouTube video:", error);
      throw error;
    }
  }, [user]);

  const addArticle = useCallback(async (url: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const youtubeId = extractYouTubeId(url);
      if (youtubeId) {
        await addYouTubeVideo(url, youtubeId);
        return;
      }

      console.log('Extracting article from:', url);
      
      const domain = new URL(url).hostname;
      let articleData: {
        title: string;
        excerpt: string;
        content: string;
        imageUrl: string | null;
        images: ArticleImage[];
        references: ArticleReference[];
      };

      try {
        articleData = await extractWithDirectFetch(url);
        console.log('✅ Article extracted with AI:', articleData.title);
      } catch (directFetchError: any) {
        console.error('❌ Direct fetch failed:', directFetchError.message);
        
        try {
          articleData = await extractWithRapidAPI(url);
          console.log('✅ Article extracted with RapidAPI fallback:', articleData.title);
          
          if (articleData.images.length === 0) {
            console.log('⚠️ RapidAPI no encontró imágenes, generando una de referencia...');
            const generatedImage = await generateReferenceImage(articleData.title, articleData.excerpt);
            if (generatedImage) {
              articleData.images.push({
                url: generatedImage,
                alt: `Imagen generada para: ${articleData.title}`,
                caption: 'Imagen de referencia generada por IA',
              });
              articleData.imageUrl = generatedImage;
            }
          }
        } catch (rapidAPIError: any) {
          console.error('❌ RapidAPI also failed:', rapidAPIError.message);
          throw new Error('Error de conexión. Verifica tu internet e intenta de nuevo.');
        }
      }
      
      const wordCount = articleData.content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));
      
      let finalImageUrl = articleData.imageUrl;
      let finalImages = articleData.images || [];

      if (!finalImageUrl && finalImages.length === 0) {
        console.log('⚠️ No hay imágenes, generando una de referencia final...');
        const generatedImage = await generateReferenceImage(articleData.title, articleData.excerpt);
        if (generatedImage) {
          finalImages = [{
            url: generatedImage,
            alt: `Imagen generada para: ${articleData.title}`,
            caption: 'Imagen de referencia generada por IA',
          }];
          finalImageUrl = generatedImage;
        } else {
          finalImageUrl = `https://picsum.photos/seed/${domain}/800/400`;
        }
      } else if (!finalImageUrl && finalImages.length > 0) {
        finalImageUrl = finalImages[0].url;
      }
      
      const newArticle = {
        user_id: user.id,
        url,
        title: articleData.title || `Artículo de ${domain}`,
        excerpt: articleData.excerpt || '',
        content: articleData.content || '',
        domain,
        image_url: finalImageUrl,
        images: finalImages,
        references: articleData.references || [{ text: 'Artículo original', url }],
        reading_time: readingTime,
        bookmarked: false,
        archived: false,
        saved_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('articles')
        .insert(newArticle)
        .select()
        .single();

      if (error) throw error;

      const mappedArticle: Article = {
        id: data.id,
        url: data.url,
        title: data.title,
        excerpt: data.excerpt || '',
        content: data.content,
        domain: data.domain,
        imageUrl: data.image_url || undefined,
        images: (data.images || []) as ArticleImage[],
        references: (data.references || []) as ArticleReference[],
        highlights: (data.highlights || []) as Highlight[],
        notes: (data.notes || []) as Note[],
        tags: (data.tags || []) as string[],
        readingTime: data.reading_time,
        savedAt: data.saved_at,
        bookmarked: data.bookmarked,
        archived: data.archived,
        folderId: data.folder_id || undefined,
        isVideo: data.is_video || false,
        videoId: data.video_id || undefined,
      };

      setArticles(prev => [mappedArticle, ...prev]);
      console.log('✅ Article added successfully:', mappedArticle.id);
    } catch (error) {
      console.error("Failed to add article:", error);
      throw error;
    }
  }, [user, extractYouTubeId, addYouTubeVideo, extractWithDirectFetch, extractWithRapidAPI, generateReferenceImage]);

  const deleteArticle = useCallback(async (id: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Failed to delete article:", error);
      throw error;
    }
  }, [user]);

  const archiveArticle = useCallback(async (id: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const { error } = await supabase
        .from('articles')
        .update({ archived: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setArticles(prev => prev.map(a => 
        a.id === id ? { ...a, archived: true } : a
      ));
    } catch (error) {
      console.error("Failed to archive article:", error);
      throw error;
    }
  }, [user]);

  const unarchiveArticle = useCallback(async (id: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const { error } = await supabase
        .from('articles')
        .update({ archived: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setArticles(prev => prev.map(a => 
        a.id === id ? { ...a, archived: false } : a
      ));
    } catch (error) {
      console.error("Failed to unarchive article:", error);
      throw error;
    }
  }, [user]);

  const toggleBookmark = useCallback(async (id: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const article = articles.find(a => a.id === id);
      if (!article) return;

      const { error } = await supabase
        .from('articles')
        .update({ bookmarked: !article.bookmarked })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setArticles(prev => prev.map(a => 
        a.id === id ? { ...a, bookmarked: !a.bookmarked } : a
      ));
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      throw error;
    }
  }, [user, articles]);

  const addFolder = useCallback(async (name: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          user_id: user.id,
          name,
        })
        .select()
        .single();

      if (error) throw error;

      const newFolder: Folder = {
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
      };

      setFolders(prev => [...prev, newFolder]);
    } catch (error) {
      console.error("Failed to add folder:", error);
      throw error;
    }
  }, [user]);

  const deleteFolder = useCallback(async (id: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setFolders(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error("Failed to delete folder:", error);
      throw error;
    }
  }, [user]);

  const moveArticleToFolder = useCallback(async (articleId: string, folderId: string | null) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const { error } = await supabase
        .from('articles')
        .update({ folder_id: folderId })
        .eq('id', articleId)
        .eq('user_id', user.id);

      if (error) throw error;

      setArticles(prev => prev.map(a => 
        a.id === articleId ? { ...a, folderId: folderId || undefined } : a
      ));
    } catch (error) {
      console.error("Failed to move article to folder:", error);
      throw error;
    }
  }, [user]);

  const getArticleById = useCallback((id: string) => {
    return articles.find(a => a.id === id);
  }, [articles]);

  const getArticlesByFolder = useCallback((folderId: string) => {
    return articles.filter(a => a.folderId === folderId);
  }, [articles]);

  const refreshArticles = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const clearAllData = useCallback(async () => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      console.log('🗑️ Borrando todos los datos del usuario...');
      
      await Promise.all([
        supabase.from('articles').delete().eq('user_id', user.id),
        supabase.from('folders').delete().eq('user_id', user.id),
        supabase.from('reading_sessions').delete().eq('user_id', user.id),
        supabase.from('daily_statistics').delete().eq('user_id', user.id),
        supabase.from('user_statistics').delete().eq('user_id', user.id),
      ]);

      setArticles([]);
      setFolders([]);
      
      console.log('✅ Todos los datos borrados exitosamente');
    } catch (error) {
      console.error("Failed to clear data:", error);
      throw error;
    }
  }, [user]);

  const addHighlightToArticle = useCallback(async (
    articleId: string,
    text: string,
    color: string = '#FFEB3B',
  ): Promise<Highlight> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const article = articles.find(a => a.id === articleId);
      if (!article) throw new Error('Artículo no encontrado');

      const newHighlight: Highlight = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        color,
        createdAt: new Date().toISOString(),
      };

      const updatedHighlights = [...(article.highlights || []), newHighlight];

      const { error } = await supabase
        .from('articles')
        .update({ highlights: updatedHighlights })
        .eq('id', articleId)
        .eq('user_id', user.id);

      if (error) throw error;

      setArticles(prev =>
        prev.map(a => (a.id === articleId ? { ...a, highlights: updatedHighlights } : a)),
      );

      console.log('✅ Resaltado guardado:', text.substring(0, 50));
      return newHighlight;
    } catch (error) {
      console.error('Failed to add highlight:', error);
      throw error;
    }
  }, [user, articles]);

  const removeHighlightFromArticle = useCallback(async (articleId: string, highlightId: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const article = articles.find(a => a.id === articleId);
      if (!article) throw new Error('Artículo no encontrado');

      const updatedHighlights = (article.highlights || []).filter(h => h.id !== highlightId);

      const { error } = await supabase
        .from('articles')
        .update({ highlights: updatedHighlights })
        .eq('id', articleId)
        .eq('user_id', user.id);

      if (error) throw error;

      setArticles(prev => prev.map(a => 
        a.id === articleId ? { ...a, highlights: updatedHighlights } : a
      ));

      console.log('✅ Resaltado eliminado');
    } catch (error) {
      console.error("Failed to remove highlight:", error);
      throw error;
    }
  }, [user, articles]);

  const addNoteToArticle = useCallback(async (articleId: string, noteText: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const article = articles.find(a => a.id === articleId);
      if (!article) throw new Error('Artículo no encontrado');

      const newNote: Note = {
        id: Date.now().toString(),
        text: noteText,
        createdAt: new Date().toISOString(),
      };

      const updatedNotes = [...(article.notes || []), newNote];

      const { error } = await supabase
        .from('articles')
        .update({ notes: updatedNotes })
        .eq('id', articleId)
        .eq('user_id', user.id);

      if (error) throw error;

      setArticles(prev => prev.map(a => 
        a.id === articleId ? { ...a, notes: updatedNotes } : a
      ));

      console.log('✅ Nota guardada:', noteText.substring(0, 50));
    } catch (error) {
      console.error("Failed to add note:", error);
      throw error;
    }
  }, [user, articles]);

  const removeNoteFromArticle = useCallback(async (articleId: string, noteId: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const article = articles.find(a => a.id === articleId);
      if (!article) throw new Error('Artículo no encontrado');

      const updatedNotes = (article.notes || []).filter(n => n.id !== noteId);

      const { error } = await supabase
        .from('articles')
        .update({ notes: updatedNotes })
        .eq('id', articleId)
        .eq('user_id', user.id);

      if (error) throw error;

      setArticles(prev => prev.map(a => 
        a.id === articleId ? { ...a, notes: updatedNotes } : a
      ));

      console.log('✅ Nota eliminada');
    } catch (error) {
      console.error("Failed to remove note:", error);
      throw error;
    }
  }, [user, articles]);

  const addTagsToArticle = useCallback(async (articleId: string, tags: string[]) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const article = articles.find(a => a.id === articleId);
      if (!article) throw new Error('Artículo no encontrado');

      const { error } = await supabase
        .from('articles')
        .update({ tags })
        .eq('id', articleId)
        .eq('user_id', user.id);

      if (error) throw error;

      setArticles(prev => prev.map(a => 
        a.id === articleId ? { ...a, tags } : a
      ));

      console.log('✅ Tags actualizados:', tags.join(', '));
    } catch (error) {
      console.error("Failed to update tags:", error);
      throw error;
    }
  }, [user, articles]);

  const addTranscribedArticle = useCallback(async (data: {
    title: string;
    content: string;
    excerpt: string;
    imageUrl: string;
  }) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      console.log('💾 Guardando artículo transcrito:', data.title);

      const wordCount = data.content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      const newArticle = {
        user_id: user.id,
        url: `transcribed://${Date.now()}`,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        domain: 'transcribed',
        image_url: data.imageUrl,
        images: [
          {
            url: data.imageUrl,
            alt: 'Imagen capturada',
            caption: 'Imagen original capturada',
          },
        ],
        references: [],
        reading_time: readingTime,
        bookmarked: false,
        archived: false,
        saved_at: new Date().toISOString(),
      };

      const { data: insertedData, error } = await supabase
        .from('articles')
        .insert(newArticle)
        .select()
        .single();

      if (error) throw error;

      const mappedArticle: Article = {
        id: insertedData.id,
        url: insertedData.url,
        title: insertedData.title,
        excerpt: insertedData.excerpt || '',
        content: insertedData.content,
        domain: insertedData.domain,
        imageUrl: insertedData.image_url || undefined,
        images: (insertedData.images || []) as ArticleImage[],
        references: (insertedData.references || []) as ArticleReference[],
        highlights: (insertedData.highlights || []) as Highlight[],
        notes: (insertedData.notes || []) as Note[],
        tags: (insertedData.tags || []) as string[],
        readingTime: insertedData.reading_time,
        savedAt: insertedData.saved_at,
        bookmarked: insertedData.bookmarked,
        archived: insertedData.archived,
        folderId: insertedData.folder_id || undefined,
        isVideo: insertedData.is_video || false,
        videoId: insertedData.video_id || undefined,
      };

      setArticles(prev => [mappedArticle, ...prev]);
      console.log('✅ Artículo transcrito guardado:', mappedArticle.id);
    } catch (error) {
      console.error("Failed to add transcribed article:", error);
      throw error;
    }
  }, [user]);

  return useMemo(() => ({
    articles,
    folders,
    isLoading,
    addArticle,
    addTranscribedArticle,
    deleteArticle,
    archiveArticle,
    unarchiveArticle,
    toggleBookmark,
    addFolder,
    deleteFolder,
    moveArticleToFolder,
    getArticleById,
    getArticlesByFolder,
    refreshArticles,
    clearAllData,
    addHighlightToArticle,
    removeHighlightFromArticle,
    addNoteToArticle,
    removeNoteFromArticle,
    addTagsToArticle,
  }), [
    articles,
    folders,
    isLoading,
    addArticle,
    addTranscribedArticle,
    deleteArticle,
    archiveArticle,
    unarchiveArticle,
    toggleBookmark,
    addFolder,
    deleteFolder,
    moveArticleToFolder,
    getArticleById,
    getArticlesByFolder,
    refreshArticles,
    clearAllData,
    addHighlightToArticle,
    removeHighlightFromArticle,
    addNoteToArticle,
    removeNoteFromArticle,
    addTagsToArticle,
  ]);
});
