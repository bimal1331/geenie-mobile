import type { StateStorage } from 'zustand/middleware';

import { createLocalStorage } from '@/services/storage/local-storage';

export const playbackSettingsStorage: StateStorage = createLocalStorage('geenie-settings');
