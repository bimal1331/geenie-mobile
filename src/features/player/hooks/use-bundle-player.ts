import { useEffect, useMemo } from 'react';

import { useBundleDetail } from '@/features/bundles/hooks/use-bundle-detail';
import { usePlayerStore } from '@/features/player/store/player-store';
import { BundlePlayerSession } from '@/features/player/types';

export function useBundlePlayer(slug: string | null) {
  const { bundle, isLoading, error } = useBundleDetail(slug);
  const activeBundleSlug = usePlayerStore((state) => state.activeBundleSlug);
  const bundleTitle = usePlayerStore((state) => state.bundleTitle);
  const bundleDescription = usePlayerStore((state) => state.bundleDescription);
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playbackError = usePlayerStore((state) => state.playbackError);
  const playBundle = usePlayerStore((state) => state.playBundle);
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const goToNext = usePlayerStore((state) => state.goToNext);
  const goToPrevious = usePlayerStore((state) => state.goToPrevious);
  const restartQueue = usePlayerStore((state) => state.restartQueue);

  useEffect(() => {
    if (!bundle) {
      return;
    }

    const hasMatchingQueue =
      activeBundleSlug === bundle.slug &&
      queue.length === bundle.items.length &&
      queue.every((item, index) => {
        const bundleItem = bundle.items[index];

        return (
          item.affirmationId === bundleItem?.affirmationId &&
          item.audioUrl === bundleItem?.audioUrl
        );
      });

    if (hasMatchingQueue) {
      return;
    }

    playBundle(bundle, currentIndex);
  }, [activeBundleSlug, bundle, currentIndex, playBundle, queue]);

  const totalAffirmations = queue.length;

  const session = useMemo<BundlePlayerSession>(() => {
    const safeIndex = totalAffirmations > 0 ? Math.min(currentIndex, totalAffirmations - 1) : 0;
    const currentItem = queue[safeIndex] ?? null;
    const progressRatio = totalAffirmations > 0 ? (safeIndex + 1) / totalAffirmations : 0;

    return {
      bundleTitle: bundleTitle ?? bundle?.title ?? 'Bundle player',
      bundleDescription: bundleDescription ?? bundle?.description ?? null,
      totalAffirmations,
      currentIndex: safeIndex,
      isPlaying,
      currentText: currentItem?.text ?? null,
      progressLabel:
        totalAffirmations > 0 ? `${safeIndex + 1} of ${totalAffirmations}` : '0 of 0',
      progressRatio,
    };
  }, [bundle, bundleDescription, bundleTitle, currentIndex, isPlaying, queue, totalAffirmations]);

  return {
    isLoading: queue.length === 0 ? isLoading : false,
    error: playbackError ?? (queue.length === 0 ? error : null),
    session,
    canGoPrevious: session.currentIndex > 0,
    canGoNext: session.currentIndex < Math.max(session.totalAffirmations - 1, 0),
    togglePlayback,
    goToNext,
    goToPrevious,
    restartBundle: restartQueue,
  };
}
