import { useLocalSearchParams } from 'expo-router';

import { BundlePlayerScreen } from '@/features/player/screens/bundle-player-screen';

export default function BundlePlayerRoute() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug ?? null;

  return <BundlePlayerScreen slug={slug} />;
}
