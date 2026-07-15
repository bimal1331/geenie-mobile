import { BundlePlaybackVariantKey } from '@/features/bundles/types';

export type PlaybackVoiceOption = {
  providerVoiceId: string;
  label: string;
  languageCode: string;
  variantKey: BundlePlaybackVariantKey;
};

export type PlaybackSettings = {
  affirmationGapMs: number;
  musicVolume: number;
  voiceVolume: number;
  loopBundleForever: boolean;
  selectedVoice: PlaybackVoiceOption;
};
