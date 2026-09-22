import { useEffect, useState } from 'react';

import { listBundleCatalog } from '@/features/bundles/services/bundle-service';
import { BundleSummary } from '@/features/bundles/types';
import { useAuthStore } from '@/features/auth/store/auth-store';

type UseBundlesState = {
  bundles: BundleSummary[];
  isLoading: boolean;
  error: string | null;
};

export function useBundles() {
  const authStatus = useAuthStore((state) => state.status);
  const session = useAuthStore((state) => state.session);
  const [state, setState] = useState<UseBundlesState>({
    bundles: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadBundles() {
      try {
        const bundles = await listBundleCatalog();

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
          console.error('[useBundles] Unable to load bundle catalog', error);
        }

        setState({
          bundles: [],
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Unable to load bundle catalog.',
        });
      }
    }

    void loadBundles();

    return () => {
      isMounted = false;
    };
  }, [authStatus, session?.userId]);

  return state;
}
