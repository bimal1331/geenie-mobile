import type { MusicTrack } from '@/features/music/types';
import type { PlayerQueueItem } from '@/features/player/store/player-store';

export type PlayerSessionSnapshot = {
  activeBundleSlug: string | null;
  bundleTitle: string | null;
  bundleCoverImageUrl: string | null;
  queue: PlayerQueueItem[];
  sessionRevision: number;
  currentIndex: number;
  isPlaying: boolean;
};

export type PlayerAudioSettingsSnapshot = {
  affirmationGapMs: number;
  loopBundleForever: boolean;
  voiceVolume: number;
  musicVolume: number;
};

export type MusicSelectionSnapshot = {
  selectedTrack: MusicTrack | null;
  shouldKeepPlaying: boolean;
};
