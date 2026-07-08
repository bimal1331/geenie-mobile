import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { BundleSummary } from '@/features/bundles/types';

type BundleListCardProps = {
  bundle: BundleSummary;
};

export function BundleListCard({ bundle }: BundleListCardProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.headerRow}>
        <ThemedView type="backgroundSelected" style={styles.badge}>
          <ThemedText type="smallBold">{bundle.mood}</ThemedText>
        </ThemedView>
        {bundle.isPremium ? (
          <ThemedView type="backgroundSelected" style={styles.badge}>
            <ThemedText type="smallBold">Premium</ThemedText>
          </ThemedView>
        ) : null}
      </View>

      <ThemedText type="subtitle" style={styles.title}>
        {bundle.title}
      </ThemedText>

      <ThemedText themeColor="textSecondary" style={styles.description}>
        {bundle.description}
      </ThemedText>

      <View style={styles.metaRow}>
        <ThemedText type="small" themeColor="textSecondary">
          {bundle.durationLabel}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {bundle.affirmationCount} affirmations
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
