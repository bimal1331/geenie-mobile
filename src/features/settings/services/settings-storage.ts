import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

function resolveKey(key: string) {
  return `geenie_settings_${key}`.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export const playbackSettingsStorage: StateStorage = {
  async getItem(name) {
    return SecureStore.getItemAsync(resolveKey(name));
  },
  async setItem(name, value) {
    await SecureStore.setItemAsync(resolveKey(name), value);
  },
  async removeItem(name) {
    await SecureStore.deleteItemAsync(resolveKey(name));
  },
};
