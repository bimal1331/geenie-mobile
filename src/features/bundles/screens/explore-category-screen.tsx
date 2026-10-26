import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { BundleListCard } from '@/features/bundles/components/bundle-list-card';
import { useBundles } from '@/features/bundles/hooks/use-bundles';
import { groupBundlesForExplore } from '@/features/bundles/services/explore-bundle-groups';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  categoryId: string | null;
};

export function ExploreCategoryScreen({ categoryId }: Props) {
  const router = useRouter();
  const theme = useTheme();
  const { bundles, error, isLoading } = useBundles();
  const category = useMemo(
    () => groupBundlesForExplore(bundles).find((group) => group.id === categoryId) ?? null,
    [bundles, categoryId],
  );

  return (
    <AppScreen
      headerLeft={
        <Pressable accessibilityLabel="Back to Explore" onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={22} tintColor={theme.text} />
        </Pressable>
      }
      title={category?.name ?? 'Category'}
      description={category ? `${category.bundles.length} curated bundles` : undefined}
    >
      {isLoading ? <StateCard message="Loading bundles..." /> : null}
      {!isLoading && error ? <StateCard message={error} /> : null}
      {!isLoading && !error && !category ? (
        <StateCard message="This category is no longer available." />
      ) : null}

      {!isLoading &&
        !error &&
        category?.bundles.map((bundle) => (
          <BundleListCard
            bundle={bundle}
            key={bundle.id}
            onPress={() => router.push(`/bundles/${bundle.slug}`)}
            variant="imageStrip"
          />
        ))}
    </AppScreen>
  );
}

function StateCard({ message }: { message: string }) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.stateCard,
        { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft },
      ]}
    >
      <ThemedText themeColor="textSecondary">{message}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  stateCard: {
    borderRadius: Spacing.four,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
});
