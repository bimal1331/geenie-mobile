import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { AppScreen } from '@/components/app-screen';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useBundleDetail } from '@/features/bundles/hooks/use-bundle-detail';
import { usePlayerStore } from '@/features/player/store/player-store';
import { useTheme } from '@/hooks/use-theme';
import { Pressable, StyleSheet } from 'react-native';

type BundleDetailScreenProps = {
  slug: string | null;
};

export function BundleDetailScreen({ slug }: BundleDetailScreenProps) {
  const router = useRouter();
  const theme = useTheme();
  const { bundle, isLoading, error } = useBundleDetail(slug);
  const playBundle = usePlayerStore((state) => state.playBundle);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/explore');
  }

  return (
    <AppScreen
      headerLeft={
        <Pressable onPress={handleBack} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundElement" style={styles.backButton}>
            <SymbolView name="chevron.left" tintColor={theme.text} size={18} />
          </ThemedView>
        </Pressable>
      }
      eyebrow="Bundle"
      title={bundle?.title ?? 'Bundle'}
      description={
        bundle?.description ??
        'Affirmations in this bundle are arranged as a guided listening sequence.'
      }>
      {isLoading ? (
        <ThemedView type="backgroundElement" style={styles.stateCard}>
          <ThemedText themeColor="textSecondary">Loading bundle...</ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && error ? (
        <ThemedView type="backgroundElement" style={styles.stateCard}>
          <ThemedText themeColor="textSecondary">{error}</ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && !error && bundle?.items.length === 0 ? (
        <ThemedView type="backgroundElement" style={styles.stateCard}>
          <ThemedText themeColor="textSecondary">
            This bundle does not have any affirmations yet.
          </ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && !error && bundle && bundle.items.length > 0 ? (
        <Pressable
          onPress={() => {
            playBundle(bundle);
            router.push(`/player/${bundle.slug}`);
          }}
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundSelected" style={styles.startButton}>
            <ThemedText type="smallBold">Play</ThemedText>
          </ThemedView>
        </Pressable>
      ) : null}

      {!isLoading &&
        !error &&
        bundle?.items.map((item) => (
          <ThemedView key={`${item.affirmationId}-${item.orderIndex}`} type="backgroundElement" style={styles.itemCard}>
            <ThemedText style={styles.itemText}>{item.text}</ThemedText>
          </ThemedView>
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
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  startButton: {
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    alignSelf: 'flex-start',
  },
  itemCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  itemText: {
    fontSize: 18,
    lineHeight: 28,
  },
});
