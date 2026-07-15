import { BundlePlaybackVariantKey } from '@/features/bundles/types';
import { DEFAULT_PLAYBACK_SETTINGS } from '@/features/settings/config';

export type BundlePlaybackSelection = {
  languageCode: string;
  variantKey: BundlePlaybackVariantKey;
  providerVoiceId: string;
};

export const DEFAULT_BUNDLE_PLAYBACK_SELECTION: BundlePlaybackSelection = {
  languageCode: DEFAULT_PLAYBACK_SETTINGS.selectedVoice.languageCode,
  variantKey: DEFAULT_PLAYBACK_SETTINGS.selectedVoice.variantKey,
  providerVoiceId: DEFAULT_PLAYBACK_SETTINGS.selectedVoice.providerVoiceId,
};
