import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { BottomSheetModal } from '@/components/bottom-sheet-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useMusicLibrary } from '@/features/music/hooks/use-music-library';
import { usePlayerStore } from '@/features/player/store/player-store';

type MusicPickerSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MusicPickerSheet({ isOpen, onClose }: MusicPickerSheetProps) {
  const theme = useTheme();
  const {
    categories,
    isLoading,
    error,
  } = useMusicLibrary(isOpen);
  const selectedMusicTrack = usePlayerStore((state) => state.selectedMusicTrack);
  const selectMusicTrack = usePlayerStore((state) => state.selectMusicTrack);
  const clearMusicTrack = usePlayerStore((state) => state.clearMusicTrack);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const effectiveCategoryId = selectedCategoryId ?? categories[0]?.id ?? null;
  const activeCategory = useMemo(
    () =>
      categories.find((category) => category.id === effectiveCategoryId) ??
      categories[0] ??
      null,
    [categories, effectiveCategoryId],
  );
  const activeTracks = activeCategory?.tracks ?? [];

  function handleSelectTrack(trackId: string) {
    const selectedTrack = categories
      .flatMap((category) => category.tracks)
      .find((track) => track.id === trackId);

    if (!selectedTrack) {
      return;
    }

    selectMusicTrack(selectedTrack);
    onClose();
  }

  function handleTurnOffMusic() {
    clearMusicTrack();
    onClose();
  }

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Background music"
      description="Pick one reusable track while your bundle is playing."
      sheetStyle={styles.sheet}>
      <ScrollView
        contentContainerStyle={styles.categoryRow}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {categories.map((category) => {
          const isSelected = category.id === effectiveCategoryId;

          return (
            <Pressable
              key={category.id}
              onPress={() => setSelectedCategoryId(category.id)}
              style={({ pressed }) => [pressed && styles.pressed]}>
              <ThemedView
                type={isSelected ? 'backgroundSelected' : 'background'}
                style={styles.categoryChip}>
                <ThemedText type="smallBold">{category.name}</ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.actionsRow}>
        <Pressable onPress={handleTurnOffMusic} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            No music
          </ThemedText>
        </Pressable>
      </View>

      {isLoading ? (
        <ThemedView type="background" style={styles.stateCard}>
          <ThemedText themeColor="textSecondary">Loading music...</ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && error ? (
        <ThemedView type="background" style={styles.stateCard}>
          <ThemedText themeColor="textSecondary">{error}</ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && !error && activeCategory ? (
        <ScrollView
          contentContainerStyle={styles.trackList}
          showsVerticalScrollIndicator={false}>
          {activeTracks.length === 0 ? (
            <ThemedView type="background" style={styles.stateCard}>
              <ThemedText themeColor="textSecondary">
                No tracks are available in this category yet.
              </ThemedText>
            </ThemedView>
          ) : null}

          {activeTracks.map((track) => {
            const isSelected = selectedMusicTrack?.id === track.id;

            return (
              <Pressable
                key={track.id}
                onPress={() => handleSelectTrack(track.id)}
                style={({ pressed }) => [pressed && styles.pressed]}>
                <ThemedView
                  type={isSelected ? 'backgroundSelected' : 'background'}
                  style={styles.trackCard}>
                  <View style={styles.trackTopline}>
                    <ThemedText type="smallBold" numberOfLines={1} style={styles.trackTitle}>
                      {track.title}
                    </ThemedText>
                    {isSelected ? (
                      <SymbolView name="checkmark.circle.fill" tintColor={theme.text} size={18} />
                    ) : null}
                  </View>
                  {track.description ? (
                    <ThemedText numberOfLines={2} themeColor="textSecondary">
                      {track.description}
                    </ThemedText>
                  ) : null}
                </ThemedView>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    minHeight: '48%',
  },
  categoryRow: {
    gap: Spacing.two,
    paddingRight: Spacing.four,
  },
  categoryChip: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.half,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  stateCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  trackList: {
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  trackCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  trackTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  trackTitle: {
    flex: 1,
  },
  pressed: {
    opacity: 0.82,
  },
});
