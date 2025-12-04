import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./auth-provider";

export interface ReadingSession {
  id: string;
  articleId: string;
  startTime: string;
  endTime: string;
  duration: number;
  wordsRead: number;
  date: string;
}

export interface DailyStats {
  date: string;
  readingTime: number;
  articlesRead: number;
  appTime: number;
  pdfDownloads: number;
  wordsRead: number;
}

export interface UserStatistics {
  totalReadingTime: number;
  totalAppTime: number;
  totalArticlesRead: number;
  totalPdfDownloads: number;
  totalWordsRead: number;
  averageReadingSpeed: number;
  longestReadingSession: number;
  currentStreak: number;
  longestStreak: number;
  readingSessions: ReadingSession[];
  dailyStats: DailyStats[];
  lastActiveDate: string;
}

const initialStats: UserStatistics = {
  totalReadingTime: 0,
  totalAppTime: 0,
  totalArticlesRead: 0,
  totalPdfDownloads: 0,
  totalWordsRead: 0,
  averageReadingSpeed: 0,
  longestReadingSession: 0,
  currentStreak: 0,
  longestStreak: 0,
  readingSessions: [],
  dailyStats: [],
  lastActiveDate: new Date().toISOString().split('T')[0],
};

const useStatisticsValue = () => {
  const [statistics, setStatistics] = useState<UserStatistics>(initialStats);
  const [currentSession, setCurrentSession] = useState<{
    startTime: Date;
    articleId?: string;
  } | null>(null);
  const appStartTimeRef = useRef<Date>(new Date());
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";

  const calculateStreaks = useCallback((dailyStats: DailyStats[]) => {
    const today = new Date();
    const sortedStats = [...dailyStats].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let currentStreak = 0;
    for (let index = 0; index < sortedStats.length; index += 1) {
      const statDate = new Date(sortedStats[index].date);
      const daysDiff = Math.floor((today.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24));

      if (sortedStats[index].readingTime > 0) {
        if (daysDiff === index) {
          currentStreak += 1;
        } else {
          break;
        }
      }
    }

    let longestStreak = 0;
    let tempStreak = 0;
    const ascendingStats = [...sortedStats].reverse();

    for (const dayStat of ascendingStats) {
      if (dayStat.readingTime > 0) {
        tempStreak += 1;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak, longestStreak };
  }, []);

  const loadStatistics = useCallback(async () => {
    console.log("📈 Loading statistics for user:", userId);

    if (!user) {
      setStatistics(() => ({ ...initialStats }));
      return;
    }

    try {
      const [userStatsResult, dailyStatsResult, sessionsResult] = await Promise.all([
        supabase
          .from('user_statistics')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('daily_statistics')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(90),
        supabase
          .from('reading_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false })
          .limit(100),
      ]);

      const dailyStats: DailyStats[] = (dailyStatsResult.data || []).map((entry) => ({
        date: entry.date,
        readingTime: entry.reading_time,
        articlesRead: entry.articles_read,
        appTime: entry.app_time,
        pdfDownloads: entry.pdf_downloads,
        wordsRead: entry.words_read,
      }));

      const readingSessions: ReadingSession[] = (sessionsResult.data || []).map((session) => ({
        id: session.id,
        articleId: session.article_id,
        startTime: session.start_time,
        endTime: session.end_time,
        duration: session.duration,
        wordsRead: session.words_read,
        date: session.date,
      }));

      const streaks = calculateStreaks(dailyStats);

      if (userStatsResult.data) {
        const data = userStatsResult.data;
        setStatistics({
          totalReadingTime: data.total_reading_time,
          totalAppTime: data.total_app_time,
          totalArticlesRead: data.total_articles_read,
          totalPdfDownloads: data.total_pdf_downloads,
          totalWordsRead: data.total_words_read,
          averageReadingSpeed: data.average_reading_speed,
          longestReadingSession: data.longest_reading_session,
          currentStreak: streaks.currentStreak,
          longestStreak: Math.max(data.longest_streak, streaks.longestStreak),
          readingSessions,
          dailyStats,
          lastActiveDate: data.last_active_date || new Date().toISOString().split('T')[0],
        });
      } else {
        setStatistics({
          ...initialStats,
          readingSessions,
          dailyStats,
          currentStreak: streaks.currentStreak,
          longestStreak: streaks.longestStreak,
        });
      }

      console.log('✅ Statistics loaded successfully');
    } catch (error) {
      console.error("Failed to load statistics:", error);
    }
  }, [user, userId, calculateStreaks]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const startReadingSession = useCallback((articleId: string) => {
    if (!articleId?.trim()) {
      return;
    }
    console.log("Starting reading session for article:", articleId);
    setCurrentSession({
      startTime: new Date(),
      articleId,
    });
  }, []);

  const endReadingSession = useCallback(async (wordsRead: number = 0) => {
    if (!user || !currentSession) {
      return;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000);

    if (duration < 10) {
      setCurrentSession(null);
      return;
    }

    try {
      const date = endTime.toISOString().split('T')[0];

      const { error: sessionError } = await supabase
        .from('reading_sessions')
        .insert({
          user_id: user.id,
          article_id: currentSession.articleId || '',
          start_time: currentSession.startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration,
          words_read: wordsRead,
          date,
        });

      if (sessionError) {
        throw sessionError;
      }

      const { data: dailyStat } = await supabase
        .from('daily_statistics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single();

      if (dailyStat) {
        await supabase
          .from('daily_statistics')
          .update({
            reading_time: dailyStat.reading_time + duration,
            articles_read: dailyStat.articles_read + 1,
            words_read: dailyStat.words_read + wordsRead,
          })
          .eq('id', dailyStat.id);
      } else {
        await supabase
          .from('daily_statistics')
          .insert({
            user_id: user.id,
            date,
            reading_time: duration,
            articles_read: 1,
            app_time: 0,
            pdf_downloads: 0,
            words_read: wordsRead,
          });
      }

      const { data: userStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const newTotalReadingTime = (userStats?.total_reading_time || 0) + duration;
      const newTotalWordsRead = (userStats?.total_words_read || 0) + wordsRead;
      const newTotalArticlesRead = (userStats?.total_articles_read || 0) + 1;
      const newAverageReadingSpeed = newTotalWordsRead > 0 && newTotalReadingTime > 0
        ? Math.round(newTotalWordsRead / (newTotalReadingTime / 60))
        : 0;

      await supabase
        .from('user_statistics')
        .upsert({
          user_id: user.id,
          total_reading_time: newTotalReadingTime,
          total_articles_read: newTotalArticlesRead,
          total_words_read: newTotalWordsRead,
          average_reading_speed: newAverageReadingSpeed,
          longest_reading_session: Math.max(userStats?.longest_reading_session || 0, duration),
          last_active_date: date,
        });

      await loadStatistics();

      console.log("Reading session ended:", {
        duration: `${Math.floor(duration / 60)}m ${duration % 60}s`,
        wordsRead,
      });
    } catch (error) {
      console.error("Failed to end reading session:", error);
    } finally {
      setCurrentSession(null);
    }
  }, [user, currentSession, loadStatistics]);

  const trackAppTime = useCallback(async () => {
    if (!user) {
      return;
    }

    const now = new Date();
    const appTime = Math.floor((now.getTime() - appStartTimeRef.current.getTime()) / 1000);

    if (appTime < 5) {
      return;
    }

    try {
      const today = now.toISOString().split('T')[0];

      const { data: dailyStat } = await supabase
        .from('daily_statistics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (dailyStat) {
        await supabase
          .from('daily_statistics')
          .update({
            app_time: dailyStat.app_time + appTime,
          })
          .eq('id', dailyStat.id);
      } else {
        await supabase
          .from('daily_statistics')
          .insert({
            user_id: user.id,
            date: today,
            reading_time: 0,
            articles_read: 0,
            app_time: appTime,
            pdf_downloads: 0,
            words_read: 0,
          });
      }

      const { data: userStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      await supabase
        .from('user_statistics')
        .upsert({
          user_id: user.id,
          total_app_time: (userStats?.total_app_time || 0) + appTime,
        });

      await loadStatistics();
    } catch (error) {
      console.error("Failed to track app time:", error);
    }
  }, [user, loadStatistics]);

  const trackPdfDownload = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: dailyStat } = await supabase
        .from('daily_statistics')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (dailyStat) {
        await supabase
          .from('daily_statistics')
          .update({
            pdf_downloads: dailyStat.pdf_downloads + 1,
          })
          .eq('id', dailyStat.id);
      } else {
        await supabase
          .from('daily_statistics')
          .insert({
            user_id: user.id,
            date: today,
            reading_time: 0,
            articles_read: 0,
            app_time: 0,
            pdf_downloads: 1,
            words_read: 0,
          });
      }

      const { data: userStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      await supabase
        .from('user_statistics')
        .upsert({
          user_id: user.id,
          total_pdf_downloads: (userStats?.total_pdf_downloads || 0) + 1,
        });

      await loadStatistics();
    } catch (error) {
      console.error("Failed to track PDF download:", error);
    }
  }, [user, loadStatistics]);

  const getWeeklyStats = useCallback(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return statistics.dailyStats
      .filter((stat) => new Date(stat.date) >= weekAgo)
      .reduce((accumulator, stat) => ({
        readingTime: accumulator.readingTime + stat.readingTime,
        articlesRead: accumulator.articlesRead + stat.articlesRead,
        appTime: accumulator.appTime + stat.appTime,
        pdfDownloads: accumulator.pdfDownloads + stat.pdfDownloads,
        wordsRead: accumulator.wordsRead + stat.wordsRead,
      }), {
        readingTime: 0,
        articlesRead: 0,
        appTime: 0,
        pdfDownloads: 0,
        wordsRead: 0,
      });
  }, [statistics.dailyStats]);

  const getMonthlyStats = useCallback(() => {
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return statistics.dailyStats
      .filter((stat) => new Date(stat.date) >= monthAgo)
      .reduce((accumulator, stat) => ({
        readingTime: accumulator.readingTime + stat.readingTime,
        articlesRead: accumulator.articlesRead + stat.articlesRead,
        appTime: accumulator.appTime + stat.appTime,
        pdfDownloads: accumulator.pdfDownloads + stat.pdfDownloads,
        wordsRead: accumulator.wordsRead + stat.wordsRead,
      }), {
        readingTime: 0,
        articlesRead: 0,
        appTime: 0,
        pdfDownloads: 0,
        wordsRead: 0,
      });
  }, [statistics.dailyStats]);

  const resetStatistics = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      console.log('🗑️ Reseteando estadísticas del usuario...');

      await Promise.all([
        supabase.from('reading_sessions').delete().eq('user_id', user.id),
        supabase.from('daily_statistics').delete().eq('user_id', user.id),
        supabase.from('user_statistics').delete().eq('user_id', user.id),
      ]);

      setStatistics(() => ({ ...initialStats }));

      console.log('✅ Estadísticas reseteadas');
    } catch (error) {
      console.error("Failed to reset statistics:", error);
      throw error;
    }
  }, [user]);

  return useMemo(() => ({
    statistics,
    currentSession,
    startReadingSession,
    endReadingSession,
    trackAppTime,
    trackPdfDownload,
    getWeeklyStats,
    getMonthlyStats,
    resetStatistics,
  }), [
    statistics,
    currentSession,
    startReadingSession,
    endReadingSession,
    trackAppTime,
    trackPdfDownload,
    getWeeklyStats,
    getMonthlyStats,
    resetStatistics,
  ]);
};

export const [StatisticsProvider, useStatistics] = createContextHook(useStatisticsValue);
StatisticsProvider.displayName = "StatisticsProvider";
