import { create } from 'zustand';

import { BundleDetail, BundleDetailItem } from '@/features/bundles/types';

const PLAYER_ADVANCE_MS = 4000;

let playbackTimer: ReturnType<typeof setTimeout> | null = null;

export type PlayerQueueItem = {
  affirmationId: string;
  orderIndex: number;
  text: string;
};

type PlayerStoreState = {
  activeBundleSlug: string | null;
  bundleTitle: string | null;
  bundleDescription: string | null;
  queue: PlayerQueueItem[];
  currentIndex: number;
  isPlaying: boolean;
};

type PlayerStoreActions = {
  playBundle: (bundle: BundleDetail, startIndex?: number) => void;
  playSingleAffirmation: (item: BundleDetailItem, options?: { bundleTitle?: string | null }) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  togglePlayback: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  restartQueue: () => void;
  clearPlayer: () => void;
};

type PlayerStore = PlayerStoreState & PlayerStoreActions;

function toQueueItem(item: BundleDetailItem): PlayerQueueItem {
  return {
    affirmationId: item.affirmationId,
    orderIndex: item.orderIndex,
    text: item.text,
  };
}

function clearPlaybackTimer() {
  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
}

export const usePlayerStore = create<PlayerStore>((set, get) => {
  const scheduleAdvance = () => {
    clearPlaybackTimer();

    const { isPlaying, queue, currentIndex } = get();

    if (!isPlaying || queue.length === 0) {
      return;
    }

    if (currentIndex >= queue.length - 1) {
      set({ isPlaying: false });
      return;
    }

    playbackTimer = setTimeout(() => {
      const state = get();
      const nextIndex = Math.min(state.currentIndex + 1, state.queue.length - 1);
      const isLastItem = nextIndex >= state.queue.length - 1;

      set({
        currentIndex: nextIndex,
        isPlaying: !isLastItem,
      });

      if (!isLastItem) {
        scheduleAdvance();
      }
    }, PLAYER_ADVANCE_MS);
  };

  const syncPlayback = () => {
    if (get().isPlaying) {
      scheduleAdvance();
      return;
    }

    clearPlaybackTimer();
  };

  return {
    activeBundleSlug: null,
    bundleTitle: null,
    bundleDescription: null,
    queue: [],
    currentIndex: 0,
    isPlaying: false,

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
      });

      syncPlayback();
    },

    playSingleAffirmation: (item, options) => {
      set({
        activeBundleSlug: null,
        bundleTitle: options?.bundleTitle ?? 'Affirmation',
        bundleDescription: null,
        queue: [toQueueItem(item)],
        currentIndex: 0,
        isPlaying: true,
      });

      syncPlayback();
    },

    pausePlayback: () => {
      set({ isPlaying: false });
      syncPlayback();
    },

    resumePlayback: () => {
      const { queue, currentIndex } = get();

      if (queue.length === 0) {
        return;
      }

      if (currentIndex >= queue.length - 1) {
        set({
          currentIndex: 0,
          isPlaying: true,
        });
      } else {
        set({ isPlaying: true });
      }

      syncPlayback();
    },

    togglePlayback: () => {
      if (get().isPlaying) {
        get().pausePlayback();
        return;
      }

      get().resumePlayback();
    },

    goToNext: () => {
      const { queue, currentIndex, isPlaying } = get();

      if (queue.length === 0) {
        return;
      }

      const nextIndex = Math.min(currentIndex + 1, queue.length - 1);
      const isLastItem = nextIndex >= queue.length - 1;

      set({
        currentIndex: nextIndex,
        isPlaying: isPlaying && !isLastItem,
      });

      syncPlayback();
    },

    goToPrevious: () => {
      const { queue, currentIndex, isPlaying } = get();

      if (queue.length === 0) {
        return;
      }

      set({
        currentIndex: Math.max(currentIndex - 1, 0),
        isPlaying,
      });

      syncPlayback();
    },

    restartQueue: () => {
      const { queue } = get();

      set({
        currentIndex: 0,
        isPlaying: queue.length > 0,
      });

      syncPlayback();
    },

    clearPlayer: () => {
      clearPlaybackTimer();
      set({
        activeBundleSlug: null,
        bundleTitle: null,
        bundleDescription: null,
        queue: [],
        currentIndex: 0,
        isPlaying: false,
      });
    },
  };
});
