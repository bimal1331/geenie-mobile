import { BundlePlaybackVariantKey } from '@/features/bundles/types';

export type BundlePlaybackSelection = {
  languageCode: string;
  variantKey: BundlePlaybackVariantKey;
  providerVoiceId: string;
};

export const DEFAULT_BUNDLE_PLAYBACK_SELECTION: BundlePlaybackSelection = {
  languageCode: 'en',
  variantKey: 'male',
  providerVoiceId: 'UBykp1rVQYqEYqCegiej',
};
