import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { BundleListCard } from '@/features/bundles/components/bundle-list-card';
import { useBundles } from '@/features/bundles/hooks/use-bundles';
import { StyleSheet } from 'react-native';

export function BundlesScreen() {
  const { bundles, isLoading, error } = useBundles();

  return (
    <AppScreen
      eyebrow="Curated audio"
      title="Explore"
      description="Discover curated affirmation bundles with a clean path into detail, playback, and a more personal listening rhythm.">
      {isLoading ? (
        <ThemedView type="backgroundElement" style={styles.stateCard}>
          <ThemedText themeColor="textSecondary">Loading collections...</ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && error ? (
        <ThemedView type="backgroundElement" style={styles.stateCard}>
          <ThemedText themeColor="textSecondary">{error}</ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && !error && bundles.length === 0 ? (
        <ThemedView type="backgroundElement" style={styles.stateCard}>
          <ThemedText themeColor="textSecondary">
            Nothing is available to explore right now.
          </ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading &&
        !error &&
        bundles.map((bundle) => (
          <BundleListCard key={bundle.id} bundle={bundle} />
        ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  stateCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
});
