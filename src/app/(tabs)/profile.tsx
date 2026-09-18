import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';

import { AppScreen, SectionCard } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ProfileAuthPanel } from '@/features/auth/components/profile-auth-panel';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

type ProfilePlaceholderRowProps = {
  title: string;
  description: string;
  isLast?: boolean;
};

function ProfilePlaceholderRow({ title, description, isLast = false }: ProfilePlaceholderRowProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.placeholderRow,
        !isLast && { borderBottomColor: theme.dividerSoft, borderBottomWidth: 1 },
      ]}>
      <View style={styles.placeholderCopy}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {description}
        </ThemedText>
      </View>
      <ThemedView type="backgroundSelected" style={styles.comingSoonBadge}>
        <ThemedText type="smallBold">Soon</ThemedText>
      </ThemedView>
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <AppScreen
      eyebrow="Your space"
      title="Profile"
      description="A quiet place to manage your account and return to the bundles you have saved.">
      <ProfileAuthPanel />

      {!isLoading && !isAuthenticated ? (
        <SectionCard
          title="Listen your way"
          description="Everything in Explore is available to guests. Create an account whenever you want your saved bundles and preferences to follow you.">
          <ThemedView type="background" style={styles.guestNote}>
            <ThemedText type="smallBold">Your playback controls stay close to listening.</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Choose voice, music, pauses, and repeat duration from the player screen.
            </ThemedText>
          </ThemedView>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Help & legal"
        description="Important app information and a direct way to reach us will live here.">
        <ProfilePlaceholderRow
          title="Privacy policy"
          description="How Geenie handles your account and listening data."
        />
        <ProfilePlaceholderRow
          title="Terms & conditions"
          description="The terms for using Geenie."
        />
        <ProfilePlaceholderRow
          title="Contact support"
          description="Get help with your account or listening experience."
          isLast
        />
      </SectionCard>

      {isAuthenticated ? (
        <SectionCard
          title="Account management"
          description="Controls for your account will be kept clear and easy to find.">
          <ProfilePlaceholderRow
            title="Delete account"
            description="Permanently remove your account and associated data."
            isLast
          />
        </SectionCard>
      ) : null}

      <SectionCard title="About Geenie" description="A calm space for returning to your words.">
        <View style={[styles.aboutRow, { borderTopColor: theme.dividerSoft }]}>
          <ThemedText type="smallBold">App version</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {appVersion}
          </ThemedText>
        </View>
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  guestNote: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: Spacing.one,
    paddingTop: Spacing.three,
  },
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  placeholderCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  comingSoonBadge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
});
