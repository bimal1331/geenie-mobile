import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { AppScreen } from '@/components/app-screen';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { useBundleDetail } from '@/features/bundles/hooks/use-bundle-detail';
import {
  removeBundleFromLibrary,
  saveBundleToLibrary,
} from '@/features/bundles/services/bundle-service';
import { usePlayerStore } from '@/features/player/store/player-store';
import { useTheme } from '@/hooks/use-theme';
import { Pressable, StyleSheet, View } from 'react-native';

type BundleDetailScreenProps = {
  slug: string | null;
};

export function BundleDetailScreen({ slug }: BundleDetailScreenProps) {
  const router = useRouter();
  const theme = useTheme();
  const { bundle, isLoading, error } = useBundleDetail(slug);
  const playBundle = usePlayerStore((state) => state.playBundle);
  const session = useAuthStore((state) => state.session);
  const authStatus = useAuthStore((state) => state.status);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setIsSaved(Boolean(bundle?.isSaved));
  }, [bundle?.id, bundle?.isSaved]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/explore');
  }

  async function handleToggleSaved() {
    if (!bundle) {
      return;
    }

    if (!session) {
      router.push('/profile');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      if (isSaved) {
        await removeBundleFromLibrary(bundle.slug);
        setIsSaved(false);
      } else {
        await saveBundleToLibrary(bundle.slug);
        setIsSaved(true);
      }
    } catch (caughtError) {
      setSaveError(
        caughtError instanceof Error ? caughtError.message : 'Unable to update your library.',
      );
    } finally {
      setIsSaving(false);
    }
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
        <ThemedView
          type="backgroundElement"
          style={[
            styles.stateCard,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft },
          ]}>
          <ThemedText themeColor="textSecondary">Loading bundle...</ThemedText>
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

      {!isLoading && !error && bundle?.items.length === 0 ? (
        <ThemedView
          type="backgroundElement"
          style={[
            styles.stateCard,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft },
          ]}>
          <ThemedText themeColor="textSecondary">
            This bundle does not have any affirmations yet.
          </ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && !error && bundle && bundle.items.length > 0 ? (
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => {
              playBundle(bundle);
              router.push(`/player/${bundle.slug}`);
            }}
            style={({ pressed }) => [styles.actionButtonPressable, pressed && styles.pressed]}>
            <ThemedView type="backgroundSelected" style={styles.startButton}>
              <ThemedText type="smallBold">Play</ThemedText>
            </ThemedView>
          </Pressable>

          <Pressable
            disabled={authStatus === 'loading' || isSaving}
            onPress={handleToggleSaved}
            style={({ pressed }) => [styles.actionButtonPressable, pressed && styles.pressed]}>
            <ThemedView
              type={isSaved ? 'backgroundSelected' : 'backgroundElement'}
              style={[
                styles.saveButton,
                isSaved
                  ? { backgroundColor: theme.backgroundSelected }
                  : {
                      backgroundColor: theme.surfaceElevatedStrong,
                      borderColor: theme.borderStrong,
                    },
              ]}>
              <ThemedText
                type="smallBold"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                style={styles.actionButtonLabel}>
                {!session
                  ? 'Sign in to save'
                  : isSaving
                    ? 'Saving...'
                    : isSaved
                      ? 'Remove from Library'
                      : 'Save to Library'}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </View>
      ) : null}

      {saveError ? (
        <ThemedView
          type="backgroundElement"
          style={[
            styles.stateCard,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft },
          ]}>
          <ThemedText themeColor="textSecondary">{saveError}</ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading &&
        !error &&
        bundle?.items.map((item) => (
          <ThemedView
            key={`${item.affirmationId}-${item.orderIndex}`}
            style={[
              styles.itemCard,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft },
            ]}>
            <ThemedText style={[styles.itemText, { color: theme.textDisplay }]}>
              {item.text}
            </ThemedText>
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
    borderWidth: 1,
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
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  actionButtonPressable: {
    flex: 1,
  },
  saveButton: {
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  itemCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderWidth: 1,
  },
  itemText: {
    fontSize: 18,
    lineHeight: 28,
  },
  actionButtonLabel: {
    textAlign: 'center',
  },
});
