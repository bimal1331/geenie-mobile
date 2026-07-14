import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

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
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={isOpen}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={styles.backdrop} />
        <ThemedView type="backgroundElement" style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View>
              <ThemedText type="subtitle" style={styles.sheetTitle}>
                Background music
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                Pick one reusable track while your bundle is playing.
              </ThemedText>
            </View>
            <Pressable onPress={onClose} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundSelected" style={styles.closeButton}>
                <SymbolView name="xmark" tintColor={theme.text} size={16} />
              </ThemedView>
            </Pressable>
          </View>

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
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.34)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
    minHeight: '48%',
    maxHeight: '78%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  sheetTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
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
