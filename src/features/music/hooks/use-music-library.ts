import { useEffect, useMemo, useState } from 'react';

import { listMusicCategories } from '@/features/music/services/music-service';
import { MusicCategory } from '@/features/music/types';

export function useMusicLibrary(isEnabled = true) {
  const [state, setState] = useState<{
    categories: MusicCategory[];
    isLoading: boolean;
    error: string | null;
  }>({
    categories: [],
    isLoading: isEnabled,
    error: null,
  });

  useEffect(() => {
    if (!isEnabled) {
      setState((current) => ({
        ...current,
        isLoading: false,
      }));
      return;
    }

    let isMounted = true;

    async function loadCategories() {
      setState({
        categories: [],
        isLoading: true,
        error: null,
      });

      try {
        const categories = await listMusicCategories();

        if (!isMounted) {
          return;
        }

        setState({
          categories,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (__DEV__) {
          console.error('[useMusicLibrary] Unable to load music categories', {
            error,
          });
        }

        setState({
          categories: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unable to load music categories.',
        });
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, [isEnabled]);

  const hasAnyCategories = useMemo(() => state.categories.length > 0, [state.categories.length]);

  return {
    categories: state.categories,
    isLoading: state.isLoading,
    error: state.error,
    hasAnyCategories,
  };
}
