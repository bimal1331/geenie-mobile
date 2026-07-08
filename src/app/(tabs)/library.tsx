import { AppScreen, SectionCard } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';

export default function LibraryScreen() {
  return (
    <AppScreen
      eyebrow="Your saved space"
      title="Library"
      description="Saved affirmations, downloaded audio, recent listens, and any future favorites or playlists can gather here in one durable personal library.">
      <SectionCard
        title="Designed for longevity"
        description="Library is where we can grow user-specific state without cluttering the main discovery flow.">
        <ThemedText themeColor="textSecondary">
          Likely future sections: saved bundles, liked affirmations, downloads, and recent
          sessions.
        </ThemedText>
      </SectionCard>
    </AppScreen>
  );
}
