import AsyncStorage from '@react-native-async-storage/async-storage';

function resolveKey(namespace: string, key: string) {
  return `${namespace}_${key}`.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function createLocalStorage(namespace: string) {
  return {
    async getItem(key: string) {
      return AsyncStorage.getItem(resolveKey(namespace, key));
    },
    async setItem(key: string, value: string) {
      await AsyncStorage.setItem(resolveKey(namespace, key), value);
    },
    async removeItem(key: string) {
      await AsyncStorage.removeItem(resolveKey(namespace, key));
    },
  };
}
