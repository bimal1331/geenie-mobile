import { AppScreen, SectionCard } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
  return (
    <AppScreen
      eyebrow="Daily practice"
      title="Welcome to Geenie"
      description="A calm home for affirmation practice, curated bundles, and a personal listening rhythm that can travel with you through the day.">
      <SectionCard
        title="Today’s flow"
        description="This home surface will become the launch point for your next bundle, your current streak, and the moments you want to revisit.">
        <ThemedText themeColor="textSecondary">
          We&apos;ll wire the real data next. For now, the shell is ready for Home, Bundles,
          Library, and Profile to grow into the app.
        </ThemedText>
      </SectionCard>
    </AppScreen>
  );
}
