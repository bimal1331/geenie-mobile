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
  queue: PlayerQueueItem[];
  currentIndex: number;
  isPlaying: boolean;
  isInAffirmationGap: boolean;
  playbackError: string | null;
  playbackRevision: number;
  selectedMusicTrack: MusicTrack | null;
};

type PlayerStoreActions = {
  playBundle: (bundle: BundleDetail, startIndex?: number) => void;
  playSingleAffirmation: (
    item: BundleDetailItem,
    options?: { bundleTitle?: string | null; bundleDescription?: string | null },
  ) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  togglePlayback: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  restartQueue: () => void;
  clearPlayer: () => void;
  setPlaybackError: (message: string | null) => void;
  setTrackEnded: () => void;
  setGapActive: (value: boolean) => void;
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

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  activeBundleSlug: null,
  bundleTitle: null,
  bundleDescription: null,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  isInAffirmationGap: false,
  playbackError: null,
  playbackRevision: 0,
  selectedMusicTrack: null,

  playBundle: (bundle, startIndex = 0) => {
    const queue = bundle.items.map(toQueueItem);
    const safeIndex = queue.length > 0 ? Math.max(0, Math.min(startIndex, queue.length - 1)) : 0;

    set({
      activeBundleSlug: bundle.slug,
      bundleTitle: bundle.title,
      bundleDescription: bundle.description,
      queue,
      currentIndex: safeIndex,
      isPlaying: queue.length > 0,
      isInAffirmationGap: false,
      playbackError: null,
      playbackRevision: 0,
    });
  },

  playSingleAffirmation: (item, options) => {
    set({
      activeBundleSlug: null,
      bundleTitle: options?.bundleTitle ?? 'Affirmation',
      bundleDescription: options?.bundleDescription ?? null,
      queue: [toQueueItem(item)],
      currentIndex: 0,
      isPlaying: true,
      isInAffirmationGap: false,
      playbackError: null,
      playbackRevision: 0,
    });
  },

  pausePlayback: () => {
    set({ isPlaying: false, isInAffirmationGap: false });
  },

  resumePlayback: () => {
    const { queue, currentIndex } = get();

    if (queue.length === 0) {
      return;
    }

    set({
      currentIndex: currentIndex >= queue.length - 1 ? 0 : currentIndex,
      isPlaying: true,
      isInAffirmationGap: false,
      playbackError: null,
      playbackRevision:
        currentIndex >= queue.length - 1 ? get().playbackRevision + 1 : get().playbackRevision,
    });
  },

  togglePlayback: () => {
    if (get().isPlaying) {
      get().pausePlayback();
      return;
    }

    get().resumePlayback();
  },

  goToNext: () => {
    const { queue, currentIndex } = get();

    if (queue.length === 0) {
      return;
    }

    set({
      currentIndex: Math.min(currentIndex + 1, queue.length - 1),
      isPlaying: true,
      isInAffirmationGap: false,
      playbackError: null,
    });
  },

  goToPrevious: () => {
    const { queue, currentIndex, isPlaying } = get();

    if (queue.length === 0) {
      return;
    }

    set({
      currentIndex: Math.max(currentIndex - 1, 0),
      isPlaying,
      isInAffirmationGap: false,
      playbackError: null,
    });
  },

  restartQueue: () => {
    const { queue } = get();

    set({
      currentIndex: 0,
      isPlaying: queue.length > 0,
      isInAffirmationGap: false,
      playbackError: null,
      playbackRevision: get().playbackRevision + 1,
    });
  },

  clearPlayer: () => {
    set({
      activeBundleSlug: null,
      bundleTitle: null,
      bundleDescription: null,
      queue: [],
      currentIndex: 0,
      isPlaying: false,
      isInAffirmationGap: false,
      playbackError: null,
      playbackRevision: 0,
    });
  },

  setPlaybackError: (message) => {
    set({ playbackError: message });
  },

  setTrackEnded: () => {
    const { queue, currentIndex } = get();

    if (queue.length === 0) {
      set({ isPlaying: false, isInAffirmationGap: false });
      return;
    }

    if (currentIndex >= queue.length - 1) {
      set({ isPlaying: false, isInAffirmationGap: false });
      return;
    }

    set({
      currentIndex: currentIndex + 1,
      isPlaying: true,
      isInAffirmationGap: false,
      playbackError: null,
    });
  },

  setGapActive: (value) => {
    set({
      isInAffirmationGap: value,
    });
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
