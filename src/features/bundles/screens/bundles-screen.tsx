import { useRouter } from 'expo-router';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ExploreCategoryListCard } from '@/features/bundles/components/explore-category-list-card';
import { useBundles } from '@/features/bundles/hooks/use-bundles';
import { groupBundlesForExplore } from '@/features/bundles/services/explore-bundle-groups';
import { useTheme } from '@/hooks/use-theme';
import { StyleSheet } from 'react-native';

export function BundlesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { bundles, isLoading, error } = useBundles();
  const bundleGroups = groupBundlesForExplore(bundles);

  return (
    <AppScreen
      title="Explore"
      description="Choose a focus for the moment you want to create.">
      {isLoading ? (
        <ThemedView
          type="backgroundElement"
          style={[
            styles.stateCard,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft },
          ]}>
          <ThemedText themeColor="textSecondary">Loading collections...</ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && error ? (
        <ThemedView
          type="backgroundElement"
          style={[
            styles.stateCard,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft },
          ]}>
          <ThemedText themeColor="textSecondary">{error}</ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && !error && bundles.length === 0 ? (
        <ThemedView
          type="backgroundElement"
          style={[
            styles.stateCard,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft },
          ]}>
          <ThemedText themeColor="textSecondary">
            Nothing is available to explore right now.
          </ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading &&
        !error &&
        bundles.length > 0 &&
        bundleGroups.map((group) => (
          <ExploreCategoryListCard
            category={group}
            key={group.id}
            onPress={() => router.push(`/categories/${group.id}`)}
          />
        ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  stateCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderWidth: 1,
  },
});
