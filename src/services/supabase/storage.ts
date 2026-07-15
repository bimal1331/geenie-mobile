import * as SecureStore from 'expo-secure-store';

const SESSION_KEY_PREFIX = 'geenie-auth';

function resolveKey(key: string) {
  return `${SESSION_KEY_PREFIX}_${key}`.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export const secureStoreAdapter = {
  async getItem(key: string) {
    return SecureStore.getItemAsync(resolveKey(key));
  },
  async setItem(key: string, value: string) {
    await SecureStore.setItemAsync(resolveKey(key), value);
  },
  async removeItem(key: string) {
    await SecureStore.deleteItemAsync(resolveKey(key));
  },
};
