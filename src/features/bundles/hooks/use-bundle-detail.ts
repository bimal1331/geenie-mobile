import { useEffect, useState } from 'react';

import { getBundleDetail } from '@/features/bundles/services/bundle-service';
import { BundleDetail } from '@/features/bundles/types';
import { usePlaybackSettings } from '@/features/settings/hooks/use-playback-settings';

type UseBundleDetailState = {
  bundle: BundleDetail | null;
  isLoading: boolean;
  error: string | null;
};

export function useBundleDetail(slug: string | null) {
  const { selectedVoice } = usePlaybackSettings();
  const [state, setState] = useState<UseBundleDetailState>({
    bundle: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadBundle() {
      if (!slug) {
        setState({
          bundle: null,
          isLoading: false,
          error: 'Bundle slug is missing.',
        });
        return;
      }

      try {
        const bundle = await getBundleDetail(slug, {
          languageCode: selectedVoice.languageCode,
          variantKey: selectedVoice.variantKey,
          providerVoiceId: selectedVoice.providerVoiceId,
        });

        if (!isMounted) {
          return;
        }

        setState({
          bundle,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (__DEV__) {
          console.error('[useBundleDetail] Unable to load bundle detail', {
            slug,
            error,
          });
        }

        setState({
          bundle: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unable to load bundle.',
        });
      }
    }

    void loadBundle();

    return () => {
      isMounted = false;
    };
  }, [selectedVoice.languageCode, selectedVoice.providerVoiceId, selectedVoice.variantKey, slug]);

  return state;
}
