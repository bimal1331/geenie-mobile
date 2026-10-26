import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Spacing } from '@/constants/theme';
import type { ExploreBundleGroup } from '@/features/bundles/services/explore-bundle-groups';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  category: ExploreBundleGroup;
  onPress: () => void;
};

export function ExploreCategoryListCard({ category, onPress }: Props) {
  const theme = useTheme();
  const coverImageUrl = category.bundles[0]?.coverImageUrl ?? null;
  const bundleCount = category.bundles.length;

  return (
    <Pressable
      accessibilityLabel={`Browse ${category.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView
        type="backgroundElement"
        style={[
          styles.card,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.borderSoft,
            shadowColor: theme.shadowWarm,
          },
        ]}
      >
        {coverImageUrl ? (
          <Image contentFit="cover" source={{ uri: coverImageUrl }} style={styles.cover} />
        ) : (
          <ThemedView type="backgroundSelected" style={styles.cover} />
        )}

        <View style={styles.content}>
          <ThemedText type="subtitle" numberOfLines={1} style={styles.title}>
            {category.name}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {bundleCount} {bundleCount === 1 ? 'bundle' : 'bundles'}
          </ThemedText>
        </View>

        <SymbolView name="chevron.right" size={18} tintColor={theme.accentSecondary} />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: Spacing.three,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.three,
    minHeight: 96,
    padding: Spacing.two,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
  cover: {
    borderRadius: Spacing.two,
    height: 78,
    width: 78,
  },
  pressed: {
    opacity: 0.76,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 27,
    lineHeight: 32,
  },
});
