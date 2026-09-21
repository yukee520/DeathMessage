import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silent fail — storage is best effort
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Silent fail
  }
}

export async function getAllKeys(): Promise<string[]> {
  try {
    return await AsyncStorage.getAllKeys();
  } catch {
    return [];
  }
}

export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch {
    // Silent fail
  }
}

export const StorageKeys = {
  PLAYER_PROFILE: '@dm/player_profile',
  GAME_STATE_PREFIX: '@dm/game_state/',
  DOWNLOADED_CASES: '@dm/downloaded_cases',
  SETTINGS: '@dm/settings',
  THEME: '@dm/theme',
} as const;