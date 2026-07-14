import { apiGet } from '@/services/api/client';

import { MusicCategory } from '@/features/music/types';

export async function listMusicCategories(): Promise<MusicCategory[]> {
  const response = await apiGet<{ categories: MusicCategory[] }>('/api/mobile/music');
  return response.categories;
}
