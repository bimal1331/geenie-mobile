import { apiGet } from '@/services/api/client';

import { BundleDetail, BundleSummary } from '@/features/bundles/types';
import {
  BundlePlaybackSelection,
  DEFAULT_BUNDLE_PLAYBACK_SELECTION,
} from '@/features/player/config';

export async function listBundleCatalog(): Promise<BundleSummary[]> {
  const response = await apiGet<{ bundles: BundleSummary[] }>('/api/mobile/bundles');
  return response.bundles;
}

export async function getBundleDetail(
  slug: string,
  selection: BundlePlaybackSelection = DEFAULT_BUNDLE_PLAYBACK_SELECTION,
): Promise<BundleDetail> {
  const searchParams = new URLSearchParams({
    languageCode: selection.languageCode,
    variantKey: selection.variantKey,
    providerVoiceId: selection.providerVoiceId,
  });
  const response = await apiGet<{ bundle: BundleDetail }>(
    `/api/mobile/bundles/${encodeURIComponent(slug)}?${searchParams.toString()}`,
  );
  return response.bundle;
}
