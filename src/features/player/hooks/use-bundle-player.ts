import { useEffect, useMemo, useState } from 'react';

import { useBundleDetail } from '@/features/bundles/hooks/use-bundle-detail';
import { BundlePlayerSession } from '@/features/player/types';

const AFFIRMATION_ADVANCE_MS = 4000;

export function useBundlePlayer(slug: string | null) {
  const { bundle, isLoading, error } = useBundleDetail(slug);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [slug, bundle?.id]);

  const totalAffirmations = bundle?.items.length ?? 0;

  useEffect(() => {
    if (totalAffirmations === 0) {
      setIsPlaying(false);
      return;
    }

    setCurrentIndex(0);
    setIsPlaying(true);
  }, [bundle?.id, totalAffirmations]);

  useEffect(() => {
    if (totalAffirmations === 0) {
      return;
    }

    setCurrentIndex((current) => Math.min(current, totalAffirmations - 1));
  }, [totalAffirmations]);

  useEffect(() => {
    if (!isPlaying || totalAffirmations === 0) {
      return;
    }

    if (currentIndex >= totalAffirmations - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex((current) => {
        const nextIndex = Math.min(current + 1, totalAffirmations - 1);

        if (nextIndex >= totalAffirmations - 1) {
          setIsPlaying(false);
        }

        return nextIndex;
      });
    }, AFFIRMATION_ADVANCE_MS);

    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying, totalAffirmations]);

  const session = useMemo<BundlePlayerSession>(() => {
    const safeIndex = totalAffirmations > 0 ? Math.min(currentIndex, totalAffirmations - 1) : 0;
    const currentItem = bundle?.items[safeIndex] ?? null;
    const progressRatio =
      totalAffirmations > 0 ? (safeIndex + 1) / totalAffirmations : 0;

    return {
      bundleTitle: bundle?.title ?? 'Bundle player',
      bundleDescription: bundle?.description ?? null,
      totalAffirmations,
      currentIndex: safeIndex,
      isPlaying,
      currentText: currentItem?.text ?? null,
      progressLabel:
        totalAffirmations > 0 ? `${safeIndex + 1} of ${totalAffirmations}` : '0 of 0',
      progressRatio,
      advanceMs: AFFIRMATION_ADVANCE_MS,
    };
  }, [bundle, currentIndex, isPlaying, totalAffirmations]);

  function togglePlayback() {
    if (totalAffirmations === 0) {
      return;
    }

    if (!isPlaying && currentIndex >= totalAffirmations - 1) {
      setCurrentIndex(0);
      setIsPlaying(true);
      return;
    }

    setIsPlaying((current) => !current);
  }

  function goToNext() {
    if (totalAffirmations === 0) {
      return;
    }

    setCurrentIndex((current) => Math.min(current + 1, totalAffirmations - 1));
  }

  function goToPrevious() {
    if (totalAffirmations === 0) {
      return;
    }

    setCurrentIndex((current) => Math.max(current - 1, 0));
  }

  function restartBundle() {
    setCurrentIndex(0);
    setIsPlaying(false);
  }

  return {
    bundle,
    isLoading,
    error,
    session,
    canGoPrevious: session.currentIndex > 0,
    canGoNext: session.currentIndex < Math.max(session.totalAffirmations - 1, 0),
    togglePlayback,
    goToNext,
    goToPrevious,
    restartBundle,
  };
}
