import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  AVAILABLE_PLAYBACK_VOICES,
  DEFAULT_PLAYBACK_SETTINGS,
} from '@/features/settings/config';
import { playbackSettingsStorage } from '@/features/settings/services/settings-storage';
import type { PlaybackVoiceOption } from '@/features/settings/types';

type SettingsStoreState = {
  hasHydrated: boolean;
  affirmationGapMs: number;
  musicVolume: number;
  voiceVolume: number;
  loopBundleForever: boolean;
  selectedVoice: PlaybackVoiceOption;
  setAffirmationGapMs: (value: number) => void;
  setMusicVolume: (value: number) => void;
  setVoiceVolume: (value: number) => void;
  setLoopBundleForever: (value: boolean) => void;
  setSelectedVoice: (value: PlaybackVoiceOption) => void;
  setHasHydrated: (value: boolean) => void;
};

function clampUnitValue(value: number) {
  return Math.max(0, Math.min(1, value));
}

function resolveSelectedVoice(option: PlaybackVoiceOption) {
  return (
    AVAILABLE_PLAYBACK_VOICES.find(
      (voice) => voice.providerVoiceId === option.providerVoiceId,
    ) ?? DEFAULT_PLAYBACK_SETTINGS.selectedVoice
  );
}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      affirmationGapMs: DEFAULT_PLAYBACK_SETTINGS.affirmationGapMs,
      musicVolume: DEFAULT_PLAYBACK_SETTINGS.musicVolume,
      voiceVolume: DEFAULT_PLAYBACK_SETTINGS.voiceVolume,
      loopBundleForever: DEFAULT_PLAYBACK_SETTINGS.loopBundleForever,
      selectedVoice: DEFAULT_PLAYBACK_SETTINGS.selectedVoice,
      setAffirmationGapMs: (value) => {
        set({
          affirmationGapMs: Math.max(0, Math.round(value)),
        });
      },
      setMusicVolume: (value) => {
        set({
          musicVolume: clampUnitValue(value),
        });
      },
      setVoiceVolume: (value) => {
        set({
          voiceVolume: clampUnitValue(value),
        });
      },
      setLoopBundleForever: (value) => {
        set({
          loopBundleForever: value,
        });
      },
      setSelectedVoice: (value) => {
        set({
          selectedVoice: resolveSelectedVoice(value),
        });
      },
      setHasHydrated: (value) => {
        set({
          hasHydrated: value,
        });
      },
    }),
    {
      name: 'playback-settings',
      storage: createJSONStorage(() => playbackSettingsStorage),
      partialize: (state) => ({
        affirmationGapMs: state.affirmationGapMs,
        musicVolume: state.musicVolume,
        voiceVolume: state.voiceVolume,
        loopBundleForever: state.loopBundleForever,
        selectedVoice: state.selectedVoice,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      version: 1,
    },
  ),
);
