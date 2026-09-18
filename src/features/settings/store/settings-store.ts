import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  AVAILABLE_PLAYBACK_VOICES,
  DEFAULT_PLAYBACK_SETTINGS,
} from '@/features/settings/config';
import { playbackSettingsStorage } from '@/features/settings/services/settings-storage';
import {
  normalizeBundleRepeatDurationMinutes,
  normalizePlaybackSettings,
} from '@/features/settings/services/user-settings-service';
import type {
  BundleRepeatDurationMinutes,
  PlaybackSettings,
  PlaybackVoiceOption,
} from '@/features/settings/types';

type SettingsStoreState = {
  // True once persisted local settings have been restored into the store.
  hasHydrated: boolean;
  affirmationGapMs: number;
  musicVolume: number;
  voiceVolume: number;
  bundleRepeatDurationMinutes: BundleRepeatDurationMinutes;
  selectedVoice: PlaybackVoiceOption;
  selectedMusicTrackId: string | null;
  setAffirmationGapMs: (value: number) => void;
  setMusicVolume: (value: number) => void;
  setVoiceVolume: (value: number) => void;
  setBundleRepeatDurationMinutes: (value: BundleRepeatDurationMinutes) => void;
  setSelectedVoice: (value: PlaybackVoiceOption) => void;
  setSelectedMusicTrackId: (value: string | null) => void;
  replaceSettings: (value: PlaybackSettings) => void;
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
      bundleRepeatDurationMinutes: DEFAULT_PLAYBACK_SETTINGS.bundleRepeatDurationMinutes,
      selectedVoice: DEFAULT_PLAYBACK_SETTINGS.selectedVoice,
      selectedMusicTrackId: DEFAULT_PLAYBACK_SETTINGS.selectedMusicTrackId,
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
      setBundleRepeatDurationMinutes: (value) => {
        set({
          bundleRepeatDurationMinutes: normalizeBundleRepeatDurationMinutes(value),
        });
      },
      setSelectedVoice: (value) => {
        set({
          selectedVoice: resolveSelectedVoice(value),
        });
      },
      setSelectedMusicTrackId: (value) => {
        set({
          selectedMusicTrackId: value?.trim() || null,
        });
      },
      replaceSettings: (value) => {
        const normalized = normalizePlaybackSettings(value);

        set({
          affirmationGapMs: normalized.affirmationGapMs,
          musicVolume: normalized.musicVolume,
          voiceVolume: normalized.voiceVolume,
          bundleRepeatDurationMinutes: normalized.bundleRepeatDurationMinutes,
          selectedVoice: normalized.selectedVoice,
          selectedMusicTrackId: normalized.selectedMusicTrackId,
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
        bundleRepeatDurationMinutes: state.bundleRepeatDurationMinutes,
        selectedVoice: state.selectedVoice,
        selectedMusicTrackId: state.selectedMusicTrackId,
      }),
      // Mark hydration complete after Zustand loads the saved local snapshot.
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
