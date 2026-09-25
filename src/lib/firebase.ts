import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import type { RepoResponse } from '../types';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAs-iUG08iU_jT4jqJegS5jsRfVPX7N7bU',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'modern-night-4t8c4.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'modern-night-4t8c4',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'modern-night-4t8c4.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '17758601016',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:17758601016:web:3a2f8883e997c287df0bcd',
};

// Initialize Firebase once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { onAuthStateChanged, getRedirectResult, type User };

/**
 * Sign in using Google OAuth Popup, falling back to Redirect if popup is blocked
 */
export async function signInWithGoogle(preferRedirect = false): Promise<User | null> {
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  if (preferRedirect) {
    await signInWithRedirect(auth, googleProvider);
    return null;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    // If popup was blocked by browser, seamlessly switch to redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      console.warn('[Auth] Popup blocked by browser, falling back to redirect flow...');
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

/**
 * Sign out current authenticated user
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

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

/**
 * Save an analyzed repository to user's personal Firestore history with localStorage fallback
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

  // 1. Store in localStorage mirror for offline & local development
  try {
    const localKey = `codesage_history_${userId}`;
    const raw = localStorage.getItem(localKey);
    const existing: UserRepoHistoryItem[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((item) => item.repositoryId !== historyItem.repositoryId);
    filtered.unshift(historyItem);
    localStorage.setItem(localKey, JSON.stringify(filtered.slice(0, 20)));
  } catch (err) {
    // ignore localStorage storage quota errors
  }

  // 2. Persist to Firestore
  try {
    const userHistoryRef = collection(db, 'users', userId, 'history');
    const docRef = doc(userHistoryRef, repoData.repository_id);

    await setDoc(
      docRef,
      {
        ...historyItem,
        repo: repoData.overview.repo,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('[Firebase] Could not save repo to Firestore (cached locally):', error);
  }
}

/**
 * Load user's recent repositories from Firestore with localStorage fallback
 */
export async function getUserRepositoryHistory(
  userId: string,
  maxItems = 10
): Promise<UserRepoHistoryItem[]> {
  // 1. Try fetching from Firestore
  try {
    const userHistoryRef = collection(db, 'users', userId, 'history');
    const q = query(userHistoryRef, orderBy('analyzedAt', 'desc'), limit(maxItems));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const items: UserRepoHistoryItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          repositoryId: data.repositoryId || docSnap.id,
          name: data.name,
          owner: data.owner,
          url: data.url,
          primaryLang: data.primaryLang || 'Code',
          analyzedAt: data.analyzedAt || Date.now(),
          filesCount: data.filesCount || 0,
        });
      });
      return items;
    }
  } catch (error) {
    console.warn('[Firebase] Firestore history unavailable, falling back to local storage cache:', error);
  }

  // 2. Fallback to localStorage
  try {
    const localKey = `codesage_history_${userId}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const parsed: UserRepoHistoryItem[] = JSON.parse(raw);
      return parsed.slice(0, maxItems);
    }
  } catch (err) {
    // ignore
  }

  return [];
}
