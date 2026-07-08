import { AppScreen, SectionCard } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';

export default function ProfileScreen() {
  return (
    <AppScreen
      eyebrow="Account and settings"
      title="Profile"
      description="Profile will hold account preferences, playback defaults, notification choices, and any membership or subscription details that shape the listening experience.">
      <SectionCard
        title="A steady control center"
        description="This is the right home for identity, settings, and other personal controls that should stay separate from discovery and playback.">
        <ThemedText themeColor="textSecondary">
          Once auth is in place, we can layer preferences and account actions onto this screen.
        </ThemedText>
      </SectionCard>
    </AppScreen>
  );
}
