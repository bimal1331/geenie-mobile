import { useLocalSearchParams } from 'expo-router';

import { ExploreCategoryScreen } from '@/features/bundles/screens/explore-category-screen';

export default function ExploreCategoryRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const categoryId = Array.isArray(params.id) ? params.id[0] : params.id ?? null;

  return <ExploreCategoryScreen categoryId={categoryId} />;
}
