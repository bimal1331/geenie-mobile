import { createAudioPlayer, type AudioPlayer, type AudioStatus } from 'expo-audio';
import type { EventSubscription } from 'expo-modules-core';

import type { PlayerQueueItem } from '@/features/player/store/player-store';

type VoiceTrackContext = {
  bundleTitle: string | null;
  bundleCoverImageUrl: string | null;
};

/**
 * VoiceTrackEngine owns a single spoken-affirmation player.
 *
 * We intentionally keep this to one player and one track at a time.
 * That gives the app full control over:
 * - when the next affirmation should load
 * - how long the gap between affirmations should be
 * - which affirmation the UI should display
 *
 * This is more predictable for Geenie than delegating bundle progression
 * to a native playlist object.
 */
export class VoiceTrackEngine {
  private readonly player: AudioPlayer = createAudioPlayer(null);
  private currentTrackKey: string | null = null;
  private statusSubscription: EventSubscription | null = null;

  get playing() {
    return this.player.playing;
  }

  setVolume(volume: number) {
    this.player.volume = volume;
  }

  subscribe(onStatusChange: (status: AudioStatus) => void) {
    this.statusSubscription?.remove();
    this.statusSubscription = this.player.addListener('playbackStatusUpdate', onStatusChange);
  }

  async loadTrack(
    item: PlayerQueueItem,
    context: VoiceTrackContext,
    options?: {
      forceReload?: boolean;
    },
  ) {
    if (!item.audioUrl) {
      await this.clearTrack();
      return;
    }

    const nextTrackKey = `${item.affirmationId}:${item.audioUrl}`;
    const shouldReload = options?.forceReload || this.currentTrackKey !== nextTrackKey;

    if (shouldReload) {
      await this.player.replace({ uri: item.audioUrl });
      this.currentTrackKey = nextTrackKey;
    }

    this.player.setActiveForLockScreen(true, {
      title: item.text,
      artist: item.voiceName ?? 'Geenie',
      albumTitle: context.bundleTitle ?? 'Geenie',
      artworkUrl: context.bundleCoverImageUrl ?? undefined,
    });

    // Every freshly selected affirmation should start from the beginning.
    await this.player.seekTo(0);
  }

  async play() {
    if (!this.currentTrackKey) {
      return;
    }

    await this.player.play();
  }

  pause() {
    this.player.pause();
  }

  async clearTrack() {
    this.currentTrackKey = null;
    this.player.pause();
    this.player.clearLockScreenControls();
  }

  destroy() {
    this.statusSubscription?.remove();
    this.player.remove();
  }
}
