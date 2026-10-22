import type { BundleSummary } from '@/features/bundles/types';
import { apiGet } from '@/services/api/client';

export type ListeningHistoryDay = {
  date: string;
  plays: Array<{
    id: string;
    playedAt: string;
    bundle: BundleSummary;
  }>;
};

export async function getListeningHistory(from: string, to: string) {
  const response = await apiGet<{ days: ListeningHistoryDay[] }>(
    `/api/mobile/listening-history?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { auth: 'required' },
  );

  return response.days;
}
