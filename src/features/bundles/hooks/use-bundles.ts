import { useEffect, useState } from 'react';

import { listBundleCatalog } from '@/features/bundles/services/bundle-service';
import { BundleSummary } from '@/features/bundles/types';

type UseBundlesState = {
  bundles: BundleSummary[];
  isLoading: boolean;
};

export function useBundles() {
  const [state, setState] = useState<UseBundlesState>({
    bundles: [],
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadBundles() {
      const bundles = await listBundleCatalog();

      if (!isMounted) {
        return;
      }

      setState({
        bundles,
        isLoading: false,
      });
    }

    void loadBundles();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
