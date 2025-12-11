import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

if (__DEV__) {
  console.log('🔧 Supabase config check...');
  console.log('🔗 URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET');
  console.log('🔑 Key:', supabaseAnonKey ? 'SET (' + supabaseAnonKey.length + ' chars)' : 'NOT SET');
}

const isValidUrl = (url: string): boolean => {
  try {
    if (!url || url.length < 10) return false;
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.includes('supabase');
  } catch {
    return false;
  }
};

const isValidKey = (key: string): boolean => {
  return !!key && key.length > 20 && key.includes('.');
};

const urlValid = isValidUrl(supabaseUrl);
const keyValid = isValidKey(supabaseAnonKey);

const missingVariables: string[] = [];
if (!urlValid) {
  missingVariables.push('EXPO_PUBLIC_SUPABASE_URL');
}
if (!keyValid) {
  missingVariables.push('EXPO_PUBLIC_SUPABASE_KEY');
}

if (__DEV__) {
  if (missingVariables.length > 0) {
    console.warn('⚠️ Supabase config issues detected');
    console.warn('Variables con problemas:', missingVariables.join(', '));
  } else {
    console.log('✅ Supabase configurado correctamente');
  }
}

export const supabaseConfig = {
  isConfigured: missingVariables.length === 0,
  missingVariables,
  urlValid,
  keyValid,
};

const safeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeKey = supabaseAnonKey || 'public-anon-key';

export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-client-info': 'rork-app',
    },
  },
});

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          user_id: string;
          folder_id: string | null;
          url: string;
          title: string;
          excerpt: string | null;
          content: string;
          domain: string;
          image_url: string | null;
          reading_time: number;
          bookmarked: boolean;
          archived: boolean;
          saved_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          folder_id?: string | null;
          url: string;
          title: string;
          excerpt?: string | null;
          content: string;
          domain: string;
          image_url?: string | null;
          reading_time?: number;
          bookmarked?: boolean;
          archived?: boolean;
          saved_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          folder_id?: string | null;
          url?: string;
          title?: string;
          excerpt?: string | null;
          content?: string;
          domain?: string;
          image_url?: string | null;
          reading_time?: number;
          bookmarked?: boolean;
          archived?: boolean;
          saved_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reading_sessions: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          start_time: string;
          end_time: string;
          duration: number;
          words_read: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          start_time: string;
          end_time: string;
          duration: number;
          words_read?: number;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          words_read?: number;
          date?: string;
          created_at?: string;
        };
      };
      daily_statistics: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          reading_time: number;
          articles_read: number;
          app_time: number;
          pdf_downloads: number;
          words_read: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          reading_time?: number;
          articles_read?: number;
          app_time?: number;
          pdf_downloads?: number;
          words_read?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          reading_time?: number;
          articles_read?: number;
          app_time?: number;
          pdf_downloads?: number;
          words_read?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_statistics: {
        Row: {
          user_id: string;
          total_reading_time: number;
          total_app_time: number;
          total_articles_read: number;
          total_pdf_downloads: number;
          total_words_read: number;
          average_reading_speed: number;
          longest_reading_session: number;
          current_streak: number;
          longest_streak: number;
          last_active_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          total_reading_time?: number;
          total_app_time?: number;
          total_articles_read?: number;
          total_pdf_downloads?: number;
          total_words_read?: number;
          average_reading_speed?: number;
          longest_reading_session?: number;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          total_reading_time?: number;
          total_app_time?: number;
          total_articles_read?: number;
          total_pdf_downloads?: number;
          total_words_read?: number;
          average_reading_speed?: number;
          longest_reading_session?: number;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

