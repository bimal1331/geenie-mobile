import { apiGet } from '@/services/api/client';
import { normalizeMediaUrl } from '@/services/media/url';

import { MusicCategory } from '@/features/music/types';

function getSupabaseStorageBaseUrl() {
  return process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? null;
}

export async function listMusicCategories(): Promise<MusicCategory[]> {
  const response = await apiGet<{ categories: MusicCategory[] }>('/api/mobile/music');

  return response.categories.map((category) => ({
    ...category,
    tracks: category.tracks.map((track) => ({
      ...track,
      audioUrl: normalizeMediaUrl(track.audioUrl, {
        fallbackBaseUrl: getSupabaseStorageBaseUrl(),
      })!,
    })),
  }));
}
