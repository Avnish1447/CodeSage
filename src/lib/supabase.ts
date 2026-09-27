import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { RepoResponse } from '../types';

export interface UserRepoHistoryItem {
  id: string;
  repositoryId: string;
  name: string;
  owner: string;
  url: string;
  primaryLang: string;
  analyzedAt: number;
  filesCount: number;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Save an analyzed repository to user's history with Supabase cloud sync & localStorage offline mirror
 */
export async function saveRepositoryToUserHistory(
  userId: string,
  repoData: RepoResponse
): Promise<void> {
  const languages = repoData.facts.languages || {};
  const topLang = Object.keys(languages)[0] || 'Unknown';
  const historyItem: UserRepoHistoryItem = {
    id: repoData.repository_id,
    repositoryId: repoData.repository_id,
    name: `${repoData.overview.owner}/${repoData.overview.repo}`,
    owner: repoData.overview.owner,
    url: repoData.facts.url || repoData.overview.normalized_url,
    primaryLang: topLang,
    filesCount: repoData.overview.files || repoData.facts.stats.file_count,
    analyzedAt: Date.now(),
  };

  // 1. Always mirror to localStorage for offline, instant, zero-latency caching
  try {
    const localKey = `codesage_history_${userId}`;
    const raw = localStorage.getItem(localKey);
    const existing: UserRepoHistoryItem[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((item) => item.repositoryId !== historyItem.repositoryId);
    filtered.unshift(historyItem);
    localStorage.setItem(localKey, JSON.stringify(filtered.slice(0, 20)));
  } catch (err) {
    // ignore quota errors
  }

  // 2. Persist to Supabase if credentials are provided
  if (supabase) {
    try {
      const recordId = `${userId}_${repoData.repository_id}`;
      const { error } = await supabase.from('user_repo_history').upsert(
        {
          id: recordId,
          user_id: userId,
          repository_id: repoData.repository_id,
          name: historyItem.name,
          owner: historyItem.owner,
          repo: repoData.overview.repo,
          url: historyItem.url,
          primary_lang: historyItem.primaryLang,
          files_count: historyItem.filesCount,
          analyzed_at: new Date(historyItem.analyzedAt).toISOString(),
        },
        { onConflict: 'id' }
      );

      if (error) {
        console.warn('[Supabase] Failed to sync repo history to cloud:', error.message);
      }
    } catch (error) {
      console.warn('[Supabase] Network error during history sync (cached locally):', error);
    }
  }
}

/**
 * Load user's recent repositories from Supabase with localStorage fallback
 */
export async function getUserRepositoryHistory(
  userId: string,
  maxItems = 10
): Promise<UserRepoHistoryItem[]> {
  // 1. Try fetching from Supabase if configured
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('user_repo_history')
        .select('*')
        .eq('user_id', userId)
        .order('analyzed_at', { ascending: false })
        .limit(maxItems);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          id: row.repository_id || row.id,
          repositoryId: row.repository_id || row.id,
          name: row.name,
          owner: row.owner,
          url: row.url,
          primaryLang: row.primary_lang || 'Code',
          analyzedAt: row.analyzed_at ? new Date(row.analyzed_at).getTime() : Date.now(),
          filesCount: row.files_count || 0,
        }));
      }
    } catch (error) {
      console.warn('[Supabase] Cloud history query failed, falling back to local storage cache:', error);
    }
  }

  // 2. Fallback to localStorage
  try {
    const localKey = `codesage_history_${userId}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const parsed: UserRepoHistoryItem[] = JSON.parse(raw);
      return parsed.slice(0, maxItems);
    }
  } catch {
    // ignore
  }

  return [];
}
