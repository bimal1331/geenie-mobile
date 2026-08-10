import { useRouter } from 'expo-router';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { BundleListCard } from '@/features/bundles/components/bundle-list-card';
import { useSavedBundles } from '@/features/bundles/hooks/use-saved-bundles';
import { useTheme } from '@/hooks/use-theme';
import { Pressable, StyleSheet } from 'react-native';

export default function LibraryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const session = useAuthStore((state) => state.session);
  const authStatus = useAuthStore((state) => state.status);
  const { bundles, isLoading, error } = useSavedBundles();

  return (
    <AppScreen
      eyebrow="Your saved space"
      title="Library"
      description="Your saved bundles live here so you can come back to them without searching again.">
      {authStatus === 'ready' && !session ? (
        <ThemedView
          type="backgroundElement"
          style={[
            styles.stateCard,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft },
          ]}>
          <ThemedText type="subtitle" style={styles.stateTitle}>
            Sign in to build your library
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Guests can keep exploring, but saved bundles only stay with signed-in accounts.
          </ThemedText>
          <Pressable onPress={() => router.push('/profile')} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView type="backgroundSelected" style={styles.signInButton}>
              <ThemedText type="smallBold">Go to profile</ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>
      ) : null}

      {session && isLoading ? (
        <ThemedView
          type="backgroundElement"
          style={[
            styles.stateCard,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft },
          ]}>
          <ThemedText themeColor="textSecondary">Loading your saved bundles...</ThemedText>
        </ThemedView>
      ) : null}

      {session && !isLoading && error ? (
        <ThemedView
          type="backgroundElement"
          style={[
            styles.stateCard,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft },
          ]}>
          <ThemedText themeColor="textSecondary">{error}</ThemedText>
        </ThemedView>
      ) : null}

      {session && !isLoading && !error && bundles.length === 0 ? (
        <ThemedView
          type="backgroundElement"
          style={[
            styles.stateCard,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft },
          ]}>
          <ThemedText themeColor="textSecondary">
            You have not saved any bundles yet.
          </ThemedText>
        </ThemedView>
      ) : null}

      {session &&
        !isLoading &&
        !error &&
        bundles.map((bundle) => (
          <BundleListCard
            key={bundle.id}
            bundle={bundle}
            onPress={() => router.push(`/bundles/${bundle.slug}`)}
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
    gap: Spacing.three,
    borderWidth: 1,
  },
  stateTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  signInButton: {
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.82,
  },
});
