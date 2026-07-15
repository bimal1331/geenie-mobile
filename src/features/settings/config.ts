import type { PlaybackSettings, PlaybackVoiceOption } from '@/features/settings/types';

export const AVAILABLE_PLAYBACK_VOICES: PlaybackVoiceOption[] = [
  {
    providerVoiceId: 'UBykp1rVQYqEYqCegiej',
    label: 'Calm Indian',
    languageCode: 'en',
    variantKey: 'default',
  },
];

export const DEFAULT_PLAYBACK_SETTINGS: PlaybackSettings = {
  affirmationGapMs: 3000,
  musicVolume: 0.35,
  voiceVolume: 1,
  loopBundleForever: false,
  selectedVoice: AVAILABLE_PLAYBACK_VOICES[0],
};
