import { AVAILABLE_PLAYBACK_VOICES, DEFAULT_PLAYBACK_SETTINGS } from '@/features/settings/config';
import type { PlaybackSettings, PlaybackVoiceOption } from '@/features/settings/types';
import { getSupabaseClient } from '@/services/supabase/client';

type UserSettingsRow = {
  user_id: string;
  affirmation_gap: number;
  music_volume: number;
  voice_volume: number;
  loop_bundle: boolean;
  selected_voice_provider_id: string;
};

function clampUnitValue(value: number) {
  return Math.max(0, Math.min(1, value));
}

function resolveSelectedVoice(option: PlaybackVoiceOption): PlaybackVoiceOption {
  return (
    AVAILABLE_PLAYBACK_VOICES.find(
      (voice) =>
        voice.providerVoiceId === option.providerVoiceId &&
        voice.languageCode === option.languageCode &&
        voice.variantKey === option.variantKey,
    ) ??
    AVAILABLE_PLAYBACK_VOICES.find((voice) => voice.providerVoiceId === option.providerVoiceId) ??
    DEFAULT_PLAYBACK_SETTINGS.selectedVoice
  );
}

function resolveSelectedVoiceByProviderId(providerVoiceId: string): PlaybackVoiceOption {
  return (
    AVAILABLE_PLAYBACK_VOICES.find((voice) => voice.providerVoiceId === providerVoiceId) ??
    DEFAULT_PLAYBACK_SETTINGS.selectedVoice
  );
}

export function normalizePlaybackSettings(settings: PlaybackSettings): PlaybackSettings {
  return {
    affirmationGapMs: Math.max(0, Math.min(30000, Math.round(settings.affirmationGapMs))),
    musicVolume: clampUnitValue(settings.musicVolume),
    voiceVolume: clampUnitValue(settings.voiceVolume),
    loopBundleForever: settings.loopBundleForever,
    selectedVoice: resolveSelectedVoice(settings.selectedVoice),
  };
}

function mapRowToPlaybackSettings(row: UserSettingsRow): PlaybackSettings {
  return normalizePlaybackSettings({
    affirmationGapMs: row.affirmation_gap,
    musicVolume: row.music_volume,
    voiceVolume: row.voice_volume,
    loopBundleForever: row.loop_bundle,
    selectedVoice: resolveSelectedVoiceByProviderId(row.selected_voice_provider_id),
  });
}

function mapPlaybackSettingsToRow(userId: string, settings: PlaybackSettings): UserSettingsRow {
  const normalized = normalizePlaybackSettings(settings);

  return {
    user_id: userId,
    affirmation_gap: normalized.affirmationGapMs,
    music_volume: normalized.musicVolume,
    voice_volume: normalized.voiceVolume,
    loop_bundle: normalized.loopBundleForever,
    selected_voice_provider_id: normalized.selectedVoice.providerVoiceId,
  };
}

export async function fetchUserPlaybackSettings(userId: string): Promise<PlaybackSettings | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_settings')
    .select(`
      user_id,
      affirmation_gap,
      music_volume,
      voice_volume,
      loop_bundle,
      selected_voice_provider_id
    `)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const row = (data ?? null) as UserSettingsRow | null;

  if (!row) {
    return null;
  }

  return mapRowToPlaybackSettings(row);
}

export async function upsertUserPlaybackSettings(userId: string, settings: PlaybackSettings) {
  const supabase = getSupabaseClient();
  const payload = mapPlaybackSettingsToRow(userId, settings);
  const { error } = await supabase.from('user_settings').upsert(payload, {
    onConflict: 'user_id',
  });

  if (error) {
    throw error;
  }
}
