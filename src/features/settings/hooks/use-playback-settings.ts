import { useMemo } from 'react';

import { useSettingsStore } from '@/features/settings/store/settings-store';

export function usePlaybackSettings() {
  const hasHydrated = useSettingsStore((state) => state.hasHydrated);
  const affirmationGapMs = useSettingsStore((state) => state.affirmationGapMs);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const voiceVolume = useSettingsStore((state) => state.voiceVolume);
  const bundleRepeatDurationMinutes = useSettingsStore(
    (state) => state.bundleRepeatDurationMinutes,
  );
  const selectedVoice = useSettingsStore((state) => state.selectedVoice);
  const selectedMusicTrackId = useSettingsStore((state) => state.selectedMusicTrackId);

  return useMemo(
    () => ({
      hasHydrated,
      affirmationGapMs,
      musicVolume,
      voiceVolume,
      bundleRepeatDurationMinutes,
      selectedVoice,
      selectedMusicTrackId,
    }),
    [
      affirmationGapMs,
      hasHydrated,
      bundleRepeatDurationMinutes,
      musicVolume,
      selectedMusicTrackId,
      selectedVoice,
      voiceVolume,
    ],
  );
}
