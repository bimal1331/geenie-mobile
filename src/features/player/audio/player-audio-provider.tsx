import { useEffect } from 'react';

import { useMusicLibrary } from '@/features/music/hooks/use-music-library';
import {
  disposePlayerAudioCoordinator,
  getPlayerAudioCoordinator,
} from '@/features/player/audio/player-audio-coordinator';
import { usePlayerStore } from '@/features/player/store/player-store';
import { usePlaybackSettings } from '@/features/settings/hooks/use-playback-settings';
import { useSettingsStore } from '@/features/settings/store/settings-store';

export function PlayerAudioProvider() {
  const coordinator = getPlayerAudioCoordinator();
  const activeBundleSlug = usePlayerStore((state) => state.activeBundleSlug);
  const bundleTitle = usePlayerStore((state) => state.bundleTitle);
  const bundleCoverImageUrl = usePlayerStore((state) => state.bundleCoverImageUrl);
  const queue = usePlayerStore((state) => state.queue);
  const sessionRevision = usePlayerStore((state) => state.sessionRevision);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const isInAffirmationGap = usePlayerStore((state) => state.isInAffirmationGap);
  const selectedMusicTrack = usePlayerStore((state) => state.selectedMusicTrack);
  const selectMusicTrack = usePlayerStore((state) => state.selectMusicTrack);
  const clearMusicTrack = usePlayerStore((state) => state.clearMusicTrack);
  const setSelectedMusicTrackId = useSettingsStore((state) => state.setSelectedMusicTrackId);
  const {
    affirmationGapMs,
    musicVolume,
    voiceVolume,
    loopBundleForever,
    selectedMusicTrackId,
  } = usePlaybackSettings();
  const { categories: musicCategories } = useMusicLibrary();

  useEffect(() => {
    coordinator.initialize();

    return () => {
      disposePlayerAudioCoordinator();
    };
  }, [coordinator]);

  // Keep the voice player aligned with the current bundle session stored in Zustand.
  useEffect(() => {
    coordinator.syncSession({
      activeBundleSlug,
      bundleTitle,
      bundleCoverImageUrl,
      queue,
      sessionRevision,
      currentIndex,
      isPlaying,
    });
  }, [activeBundleSlug, bundleCoverImageUrl, bundleTitle, coordinator, currentIndex, isPlaying, queue, sessionRevision]);

  // Player-level settings affect both the spoken-voice player and the background music engine.
  useEffect(() => {
    coordinator.syncSettings({
      affirmationGapMs,
      loopBundleForever,
      voiceVolume,
      musicVolume,
    });
  }, [affirmationGapMs, coordinator, loopBundleForever, musicVolume, voiceVolume]);

  // Background music should continue during the configured gap between affirmations.
  useEffect(() => {
    coordinator.syncMusicSelection({
      selectedTrack: selectedMusicTrack,
      shouldKeepPlaying: Boolean(selectedMusicTrack) && queue.length > 0 && (isPlaying || isInAffirmationGap),
    });
  }, [coordinator, isInAffirmationGap, isPlaying, queue.length, selectedMusicTrack]);

  // Restore the persisted track selection once the music catalog has loaded.
  useEffect(() => {
    if (!selectedMusicTrackId) {
      if (selectedMusicTrack) {
        clearMusicTrack();
      }

      return;
    }

    const restoredTrack = musicCategories
      .flatMap((category) => category.tracks)
      .find((track) => track.id === selectedMusicTrackId);

    if (!restoredTrack) {
      return;
    }

    if (selectedMusicTrack?.id === restoredTrack.id) {
      return;
    }

    selectMusicTrack(restoredTrack);
  }, [
    clearMusicTrack,
    musicCategories,
    selectMusicTrack,
    selectedMusicTrack,
    selectedMusicTrackId,
  ]);

  // If a saved music track no longer exists in the fetched catalog, clear the stale setting.
  useEffect(() => {
    if (!selectedMusicTrack) {
      return;
    }

    if (selectedMusicTrackId === selectedMusicTrack.id) {
      return;
    }

    setSelectedMusicTrackId(null);
  }, [selectedMusicTrack, selectedMusicTrackId, setSelectedMusicTrackId]);

  return null;
}
