import { apiGet } from '@/services/api/client';

import { BundleDetail, BundleSummary } from '@/features/bundles/types';

export async function listBundleCatalog(): Promise<BundleSummary[]> {
  const response = await apiGet<{ bundles: BundleSummary[] }>('/api/mobile/bundles');
  return response.bundles;
}

export async function getBundleDetail(slug: string): Promise<BundleDetail> {
  const response = await apiGet<{ bundle: BundleDetail }>(
    `/api/mobile/bundles/${encodeURIComponent(slug)}`,
  );
  return response.bundle;
}
