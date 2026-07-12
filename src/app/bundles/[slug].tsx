import { useLocalSearchParams } from 'expo-router';

import { BundleDetailScreen } from '@/features/bundles/screens/bundle-detail-screen';

export default function BundleDetailRoute() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug ?? null;

  return <BundleDetailScreen slug={slug} />;
}
