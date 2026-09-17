import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Spacing } from '@/constants/theme';
import { BundleSummary } from '@/features/bundles/types';
import { useTheme } from '@/hooks/use-theme';

type BundleListCardProps = {
  bundle: BundleSummary;
  onPress?: () => void;
  variant?: 'card' | 'imageStrip';
};

export function BundleListCard({ bundle, onPress, variant = 'card' }: BundleListCardProps) {
  const theme = useTheme();

  if (variant === 'imageStrip') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${bundle.title}`}
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}>
        <ThemedView
          type="backgroundElement"
          style={[
            styles.stripCard,
            {
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.borderSoft,
              shadowColor: theme.shadowWarm,
            },
          ]}>
          {bundle.coverImageUrl ? (
            <Image
              contentFit="cover"
              source={{ uri: bundle.coverImageUrl }}
              style={styles.stripImage}
            />
          ) : (
            <ThemedView type="backgroundSelected" style={styles.stripFallback}>
              <ThemedText type="smallBold">Bundle</ThemedText>
            </ThemedView>
          )}

          <View style={styles.stripContent}>
            <ThemedText type="subtitle" style={[styles.stripTitle, { color: theme.textDisplay }]}>
              {bundle.title}
            </ThemedText>
            <ThemedText
              numberOfLines={2}
              themeColor="textSecondary"
              style={styles.stripDescription}>
              {bundle.description ?? 'A published affirmation bundle ready for mobile listening.'}
            </ThemedText>
            <View style={styles.stripFooter}>
              <View style={styles.stripMeta}>
                <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>
                  {bundle.affirmationCount} {bundle.affirmationCount === 1 ? 'affirmation' : 'affirmations'}
                </ThemedText>
                {bundle.isPremium ? (
                  <ThemedView type="backgroundSelected" style={styles.stripBadge}>
                    <ThemedText type="smallBold">Premium</ThemedText>
                  </ThemedView>
                ) : null}
              </View>
              <View
                style={[
                  styles.chevronButton,
                  { borderColor: theme.accentSecondary },
                ]}>
                <SymbolView name="chevron.right" tintColor={theme.accentSecondary} size={18} />
              </View>
            </View>
          </View>
        </ThemedView>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${bundle.title}`}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type="backgroundElement"
        style={[
          styles.card,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.borderSoft,
            shadowColor: theme.shadowWarm,
          },
        ]}>
        {bundle.coverImageUrl ? (
          <Image
            contentFit="cover"
            source={{ uri: bundle.coverImageUrl }}
            style={styles.coverImage}
          />
        ) : (
          <ThemedView type="backgroundSelected" style={styles.coverFallback}>
            <ThemedText type="smallBold">Bundle</ThemedText>
          </ThemedView>
        )}

        <View style={styles.headerRow}>
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
          {bundle.description ?? 'A published affirmation bundle ready for mobile listening.'}
        </ThemedText>

        <View style={styles.metaRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {bundle.affirmationCount} affirmations
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {bundle.slug}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    gap: Spacing.two,
    borderWidth: 1,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 3,
  },
  stripCard: {
    borderRadius: Spacing.four,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 2,
  },
  stripImage: {
    width: '100%',
    height: 132,
  },
  stripFallback: {
    width: '100%',
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.one,
  },
  stripTitle: {
    fontFamily: Fonts.serif,
    fontSize: 29,
    lineHeight: 35,
  },
  stripDescription: {
    fontSize: 16,
    lineHeight: 23,
  },
  stripFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  stripMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  stripBadge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  chevronButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: '100%',
    height: 224,
    borderRadius: Spacing.four,
  },
  coverFallback: {
    width: '100%',
    height: 224,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.86,
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
    fontFamily: Fonts.serif,
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
