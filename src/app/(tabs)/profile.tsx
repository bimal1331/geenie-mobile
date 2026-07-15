import { AppScreen, SectionCard } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { ProfileAuthPanel } from '@/features/auth/components/profile-auth-panel';

export default function ProfileScreen() {
  return (
    <AppScreen
      eyebrow="Account and settings"
      title="Profile"
      description="Profile will hold account preferences, playback defaults, notification choices, and any membership or subscription details that shape the listening experience.">
      <ProfileAuthPanel />
      <SectionCard
        title="A steady control center"
        description="This is where we can keep identity, playback defaults, notifications, membership, and other personal controls separate from discovery and playback.">
        <ThemedText themeColor="textSecondary">
          Guests can keep exploring freely. Signed-in features will grow here over time.
        </ThemedText>
      </SectionCard>
    </AppScreen>
  );
}
