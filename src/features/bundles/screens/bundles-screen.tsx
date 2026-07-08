import { AppScreen, SectionCard } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { BundleListCard } from '@/features/bundles/components/bundle-list-card';
import { useBundles } from '@/features/bundles/hooks/use-bundles';

export function BundlesScreen() {
  const { bundles, isLoading } = useBundles();

  return (
    <AppScreen
      eyebrow="Curated audio"
      title="Bundles"
      description="Editorially assembled affirmation sets will live here, with a clean path into detail, playback, and a more personal listening rhythm.">
      <SectionCard
        title="Featured right now"
        description="This first mobile slice is intentionally organized like a real feature: route at the edge, feature code in one place, and a service layer ready for the eventual API.">
        <ThemedText themeColor="textSecondary">
          {isLoading
            ? 'Loading bundle catalog...'
            : 'These are still mock bundles, but the structure is now ready for published mobile data.'}
        </ThemedText>
      </SectionCard>

      {bundles.map((bundle) => (
        <BundleListCard key={bundle.id} bundle={bundle} />
      ))}
    </AppScreen>
  );
}
