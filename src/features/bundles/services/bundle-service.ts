import { apiGet } from '@/services/api/client';

import { BundleSummary } from '@/features/bundles/types';

export async function listBundleCatalog(): Promise<BundleSummary[]> {
  const response = await apiGet<{ bundles: BundleSummary[] }>('/api/mobile/bundles');
  return response.bundles;
}
