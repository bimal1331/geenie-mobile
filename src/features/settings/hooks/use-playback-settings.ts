import { useMemo } from 'react';

import { useSettingsStore } from '@/features/settings/store/settings-store';

export function usePlaybackSettings() {
  const hasHydrated = useSettingsStore((state) => state.hasHydrated);
  const affirmationGapMs = useSettingsStore((state) => state.affirmationGapMs);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const voiceVolume = useSettingsStore((state) => state.voiceVolume);
  const loopBundleForever = useSettingsStore((state) => state.loopBundleForever);
  const selectedVoice = useSettingsStore((state) => state.selectedVoice);

  return useMemo(
    () => ({
      hasHydrated,
      affirmationGapMs,
      musicVolume,
      voiceVolume,
      loopBundleForever,
      selectedVoice,
    }),
    [affirmationGapMs, hasHydrated, loopBundleForever, musicVolume, selectedVoice, voiceVolume],
  );
}
