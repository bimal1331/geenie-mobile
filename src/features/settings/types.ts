import { BundlePlaybackVariantKey } from '@/features/bundles/types';

export type PlaybackVoiceOption = {
  providerVoiceId: string;
  label: string;
  languageCode: string;
  variantKey: BundlePlaybackVariantKey;
};

// 0 means play once. A positive value is a repeat duration in minutes.
// Null means repeat indefinitely.
export type BundleRepeatDurationMinutes = number | null;

export type PlaybackSettings = {
  affirmationGapMs: number;
  musicVolume: number;
  voiceVolume: number;
  bundleRepeatDurationMinutes: BundleRepeatDurationMinutes;
  selectedVoice: PlaybackVoiceOption;
  selectedMusicTrackId: string | null;
};
