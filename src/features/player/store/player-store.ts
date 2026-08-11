import { create } from 'zustand';

import { BundleDetail, BundleDetailItem } from '@/features/bundles/types';
import { MusicTrack } from '@/features/music/types';

export type PlayerQueueItem = {
  affirmationId: string;
  orderIndex: number;
  text: string;
  audioUrl: string | null;
  voiceId: string | null;
  voiceName: string | null;
};

type PlayerStoreState = {
  activeBundleSlug: string | null;
  bundleTitle: string | null;
  bundleDescription: string | null;
  bundleCoverImageUrl: string | null;
  queue: PlayerQueueItem[];
  sessionRevision: number;
  currentIndex: number;
  isPlaying: boolean;
  isInAffirmationGap: boolean;
  playbackError: string | null;
  selectedMusicTrack: MusicTrack | null;
};

type PlayerStoreActions = {
  playBundle: (bundle: BundleDetail, startIndex?: number) => void;
  playSingleAffirmation: (
    item: BundleDetailItem,
    options?: {
      bundleTitle?: string | null;
      bundleDescription?: string | null;
      bundleCoverImageUrl?: string | null;
    },
  ) => void;
  clearPlayer: () => void;
  setPlaybackError: (message: string | null) => void;
  setGapActive: (value: boolean) => void;
  syncPlaybackSnapshot: (snapshot: {
    currentIndex?: number;
    isPlaying?: boolean;
    playbackError?: string | null;
  }) => void;
  selectMusicTrack: (track: MusicTrack) => void;
  clearMusicTrack: () => void;
};

type PlayerStore = PlayerStoreState & PlayerStoreActions;

function toQueueItem(item: BundleDetailItem): PlayerQueueItem {
  return {
    affirmationId: item.affirmationId,
    orderIndex: item.orderIndex,
    text: item.text,
    audioUrl: item.audioUrl,
    voiceId: item.voiceId,
    voiceName: item.voiceName,
  };
}

function toPlayableQueue(items: BundleDetailItem[]) {
  return items
    .filter((item) => Boolean(item.audioUrl))
    .map(toQueueItem);
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  activeBundleSlug: null,
  bundleTitle: null,
  bundleDescription: null,
  bundleCoverImageUrl: null,
  queue: [],
  sessionRevision: 0,
  currentIndex: 0,
  isPlaying: false,
  isInAffirmationGap: false,
  playbackError: null,
  selectedMusicTrack: null,

  playBundle: (bundle, startIndex = 0) => {
    const queue = toPlayableQueue(bundle.items);
    const safeIndex = queue.length > 0 ? Math.max(0, Math.min(startIndex, queue.length - 1)) : 0;

    set((state) => ({
      activeBundleSlug: bundle.slug,
      bundleTitle: bundle.title,
      bundleDescription: bundle.description,
      bundleCoverImageUrl: bundle.coverImageUrl,
      queue,
      sessionRevision: state.sessionRevision + 1,
      currentIndex: safeIndex,
      isPlaying: queue.length > 0,
      isInAffirmationGap: false,
      playbackError: null,
    }));
  },

  playSingleAffirmation: (item, options) => {
    const queue = item.audioUrl ? [toQueueItem(item)] : [];

    set((state) => ({
      activeBundleSlug: null,
      bundleTitle: options?.bundleTitle ?? 'Affirmation',
      bundleDescription: options?.bundleDescription ?? null,
      bundleCoverImageUrl: options?.bundleCoverImageUrl ?? null,
      queue,
      sessionRevision: state.sessionRevision + 1,
      currentIndex: 0,
      isPlaying: queue.length > 0,
      isInAffirmationGap: false,
      playbackError: queue.length > 0 ? null : 'Audio is not available for this affirmation.',
    }));
  },

  clearPlayer: () => {
    set({
      activeBundleSlug: null,
      bundleTitle: null,
      bundleDescription: null,
      bundleCoverImageUrl: null,
      queue: [],
      sessionRevision: 0,
      currentIndex: 0,
      isPlaying: false,
      isInAffirmationGap: false,
      playbackError: null,
    });
  },

  setPlaybackError: (message) => {
    set({ playbackError: message });
  },

  setGapActive: (value) => {
    set({
      isInAffirmationGap: value,
    });
  },

  syncPlaybackSnapshot: (snapshot) => {
    set((state) => ({
      currentIndex: snapshot.currentIndex ?? state.currentIndex,
      isPlaying: snapshot.isPlaying ?? state.isPlaying,
      playbackError:
        typeof snapshot.playbackError === 'undefined'
          ? state.playbackError
          : snapshot.playbackError,
    }));
  },

  selectMusicTrack: (track) => {
    set({
      selectedMusicTrack: track,
    });
  },

  clearMusicTrack: () => {
    set({
      selectedMusicTrack: null,
    });
  },
}));
