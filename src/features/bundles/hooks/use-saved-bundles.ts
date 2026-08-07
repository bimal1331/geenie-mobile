import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { listSavedBundles } from '@/features/bundles/services/bundle-service';
import { BundleSummary } from '@/features/bundles/types';
import { useAuthStore } from '@/features/auth/store/auth-store';

type UseSavedBundlesState = {
  bundles: BundleSummary[];
  isLoading: boolean;
  error: string | null;
};

export function useSavedBundles() {
  const session = useAuthStore((state) => state.session);
  const authStatus = useAuthStore((state) => state.status);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<UseSavedBundlesState>({
    bundles: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSavedBundles() {
      if (authStatus !== 'ready') {
        return;
      }

      if (!session) {
        setState({
          bundles: [],
          isLoading: false,
          error: null,
        });
        return;
      }

      setState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));

      try {
        const bundles = await listSavedBundles();

        if (!isMounted) {
          return;
        }

        setState({
          bundles,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (__DEV__) {
          console.error('[useSavedBundles] Unable to load saved bundles', {
            error,
          });
        }

        setState({
          bundles: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unable to load your library.',
        });
      }
    }

    void loadSavedBundles();

    return () => {
      isMounted = false;
    };
  }, [authStatus, reloadKey, session]);

  useFocusEffect(
    useCallback(() => {
      setReloadKey((current) => current + 1);
    }, []),
  );

  return {
    bundles: state.bundles,
    isLoading: state.isLoading,
    error: state.error,
    refresh: () => setReloadKey((current) => current + 1),
  };
}
