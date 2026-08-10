import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Image } from 'expo-image';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MusicPickerSheet } from '@/features/player/components/music-picker-sheet';
import { PlaybackSettingsSheet } from '@/features/player/components/playback-settings-sheet';
import { useBundlePlayer } from '@/features/player/hooks/use-bundle-player';
import { usePlayerStore } from '@/features/player/store/player-store';

type BundlePlayerScreenProps = {
  slug: string | null;
};

const playerBackgroundImage = require('../../../../assets/images/player/background-abstract-mist.png');

export function BundlePlayerScreen({ slug }: BundlePlayerScreenProps) {
  const router = useRouter();
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const selectedMusicTrack = usePlayerStore((state) => state.selectedMusicTrack);
  const {
    isLoading,
    error,
    session,
    canGoNext,
    canGoPrevious,
    togglePlayback,
    goToNext,
    goToPrevious,
    restartBundle,
  } = useBundlePlayer(slug);

  const compactLayout = height < 860;
  const narrowLayout = width < 390;
  const titleFontSize = compactLayout ? (narrowLayout ? 38 : 42) : 48;
  const titleLineHeight = compactLayout ? (narrowLayout ? 42 : 46) : 52;
  const descriptionFontSize = compactLayout ? 16 : 18;
  const descriptionLineHeight = compactLayout ? 22 : 24;
  const headerButtonSize = compactLayout ? 50 : 56;
  const panelRadius = compactLayout ? 30 : 34;
  const panelPaddingHorizontal = compactLayout ? 18 : 20;
  const panelPaddingTop = compactLayout ? 18 : 20;
  const panelPaddingBottom = compactLayout ? 16 : 18;
  const panelGap = compactLayout ? 14 : 16;
  const affirmationMinHeight = compactLayout ? 96 : 120;
  const affirmationFontSize = compactLayout ? (narrowLayout ? 26 : 30) : 34;
  const affirmationLineHeight = compactLayout ? (narrowLayout ? 36 : 40) : 44;
  const sideControlButtonSize = compactLayout ? 48 : 54;
  const playButtonSize = compactLayout ? 78 : 88;
  const controlGap = compactLayout ? 18 : 22;

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/explore');
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Image contentFit="cover" source={playerBackgroundImage} style={StyleSheet.absoluteFill} />
      <View style={[styles.backgroundOverlay, { backgroundColor: theme.playerOverlay }]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <SafeAreaView
          style={[
            styles.safeArea,
            {
              minHeight: height,
              paddingHorizontal: narrowLayout ? 16 : 20,
              paddingTop: compactLayout ? Spacing.two : Spacing.three,
              paddingBottom: compactLayout ? Spacing.four : Spacing.five,
              gap: compactLayout ? Spacing.three : Spacing.four,
            },
          ]}>
          <View style={styles.headerRow}>
            <Pressable onPress={handleBack} style={({ pressed }) => pressed && styles.pressed}>
              <View
                style={[
                  styles.headerButton,
                  {
                    width: headerButtonSize,
                    height: headerButtonSize,
                    backgroundColor: theme.surfaceFloating,
                    shadowColor: theme.shadowWarm,
                  },
                ]}>
                <SymbolView name="chevron.left" tintColor={theme.accentPrimary} size={22} />
              </View>
            </Pressable>

            <View style={styles.headerActions}>
              <Pressable
                onPress={() => setIsMusicPickerOpen(true)}
                style={({ pressed }) => pressed && styles.pressed}>
                <View
                  style={[
                    styles.headerButton,
                    {
                      width: headerButtonSize,
                      height: headerButtonSize,
                      backgroundColor: theme.surfaceFloating,
                      shadowColor: theme.shadowWarm,
                    },
                  ]}>
                  <SymbolView
                    name="music.note"
                    tintColor={selectedMusicTrack ? theme.accentPrimary : theme.text}
                    size={20}
                  />
                </View>
              </Pressable>

              <Pressable
                onPress={() => setIsSettingsOpen(true)}
                style={({ pressed }) => pressed && styles.pressed}>
                <View
                  style={[
                    styles.headerButton,
                    {
                      width: headerButtonSize,
                      height: headerButtonSize,
                      backgroundColor: theme.surfaceFloating,
                      shadowColor: theme.shadowWarm,
                    },
                  ]}>
                  <SymbolView name="slider.horizontal.3" tintColor={theme.text} size={20} />
                </View>
              </Pressable>
            </View>
          </View>

          <View style={[styles.heroSection, { gap: compactLayout ? Spacing.one : Spacing.two, paddingTop: 0 }]}>
            <ThemedText
              adjustsFontSizeToFit
              minimumFontScale={0.76}
              numberOfLines={2}
              style={[
                styles.bundleTitle,
                {
                  fontSize: titleFontSize,
                  lineHeight: titleLineHeight,
                },
              ]}>
              {session.bundleTitle}
            </ThemedText>

            <ThemedText
              themeColor="textSecondary"
              numberOfLines={2}
              style={[
                styles.bundleDescription,
                {
                  fontSize: descriptionFontSize,
                  lineHeight: descriptionLineHeight,
                  maxWidth: narrowLayout ? 280 : 320,
                },
              ]}>
              {session.bundleDescription ??
                'Move through this bundle one affirmation at a time in a calm, guided sequence.'}
            </ThemedText>
          </View>

          {isLoading ? (
            <View
              style={[
                styles.stateCard,
                {
                  backgroundColor: theme.surfaceElevatedStrong,
                  shadowColor: theme.shadowWarm,
                },
              ]}>
              <ThemedText themeColor="textSecondary">Preparing session...</ThemedText>
            </View>
          ) : null}

          {!isLoading && error ? (
            <View
              style={[
                styles.stateCard,
                {
                  backgroundColor: theme.surfaceElevatedStrong,
                  shadowColor: theme.shadowWarm,
                },
              ]}>
              <ThemedText themeColor="textSecondary">{error}</ThemedText>
            </View>
          ) : null}

          {!isLoading && !error ? (
            <View
              style={[
                styles.playerPanel,
                {
                  flex: 1,
                  marginTop: compactLayout ? Spacing.two : Spacing.three,
                  borderRadius: panelRadius,
                  paddingHorizontal: panelPaddingHorizontal,
                  paddingTop: panelPaddingTop,
                  paddingBottom: panelPaddingBottom,
                  gap: panelGap,
                  backgroundColor: theme.surfacePanel,
                  borderColor: theme.borderSoft,
                  shadowColor: theme.shadowWarm,
                },
              ]}>
              <View style={styles.progressHeader}>
                <ThemedText style={[styles.progressCount, { color: theme.accentPrimary }]}>
                  {session.progressLabel}
                </ThemedText>
                <ThemedText
                  themeColor="textSecondary"
                  style={[styles.progressMeta, { color: theme.textMutedWarm }]}>
                  Bundle session
                </ThemedText>
              </View>

              <View style={[styles.progressTrack, { backgroundColor: theme.progressTrack }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(session.progressRatio * 100, 6)}%`,
                      backgroundColor: theme.accentPrimary,
                    },
                  ]}
                />
              </View>

              <View style={[styles.panelDivider, { backgroundColor: theme.dividerSoft }]} />

              <View style={[styles.affirmationCopyWrap, { minHeight: affirmationMinHeight }]}>
                <ThemedText
                  style={[
                    styles.currentAffirmationText,
                    {
                      fontSize: affirmationFontSize,
                      lineHeight: affirmationLineHeight,
                      color: theme.textHero,
                    },
                  ]}>
                  {session.currentText ?? 'No affirmation is available in this bundle yet.'}
                </ThemedText>
              </View>

              <View style={[styles.controlRow, { gap: controlGap }]}>
                <Pressable
                  disabled={!canGoPrevious}
                  onPress={goToPrevious}
                  style={({ pressed }) => [
                    !canGoPrevious && styles.controlButtonDisabled,
                    pressed && canGoPrevious && styles.pressed,
                  ]}>
                  <View
                    style={[
                      styles.secondaryControlButton,
                      {
                        width: sideControlButtonSize,
                        height: sideControlButtonSize,
                        backgroundColor: theme.surfaceButton,
                        shadowColor: theme.shadowWarm,
                      },
                    ]}>
                    <SymbolView name="backward.fill" tintColor={theme.text} size={18} />
                  </View>
                </Pressable>

                <Pressable
                  disabled={session.totalAffirmations === 0}
                  onPress={togglePlayback}
                  style={({ pressed }) => [
                    session.totalAffirmations === 0 && styles.controlButtonDisabled,
                    pressed && session.totalAffirmations > 0 && styles.pressed,
                  ]}>
                  <View
                    style={[
                      styles.playButton,
                      {
                        width: playButtonSize,
                        height: playButtonSize,
                        backgroundColor: theme.accentPrimary,
                        shadowColor: theme.shadowWarm,
                      },
                    ]}>
                    <SymbolView
                      name={session.isPlaying ? 'pause.fill' : 'play.fill'}
                      tintColor={theme.onAccentText}
                      size={compactLayout ? 22 : 24}
                    />
                  </View>
                </Pressable>

                <Pressable
                  disabled={!canGoNext}
                  onPress={goToNext}
                  style={({ pressed }) => [
                    !canGoNext && styles.controlButtonDisabled,
                    pressed && canGoNext && styles.pressed,
                  ]}>
                  <View
                    style={[
                      styles.secondaryControlButton,
                      {
                        width: sideControlButtonSize,
                        height: sideControlButtonSize,
                        backgroundColor: theme.surfaceButton,
                        shadowColor: theme.shadowWarm,
                      },
                    ]}>
                    <SymbolView name="forward.fill" tintColor={theme.text} size={18} />
                  </View>
                </Pressable>
              </View>

              <View style={[styles.panelDivider, { backgroundColor: theme.dividerSoft }]} />

              <View style={styles.restartRow}>
                <Pressable onPress={restartBundle} style={({ pressed }) => pressed && styles.pressed}>
                  <View style={styles.restartAction}>
                    <SymbolView
                      name="arrow.counterclockwise"
                      tintColor={theme.accentPrimary}
                      size={22}
                    />
                    <ThemedText style={[styles.restartLabel, { color: theme.accentPrimary }]}>
                      Restart bundle
                    </ThemedText>
                  </View>
                </Pressable>
              </View>
            </View>
          ) : null}
        </SafeAreaView>
      </ScrollView>

      <MusicPickerSheet isOpen={isMusicPickerOpen} onClose={() => setIsMusicPickerOpen(false)} />
      <PlaybackSettingsSheet isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerButton: {
    width: 56,
    height: 56,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 2,
  },
  heroSection: {
    gap: Spacing.two,
    paddingTop: 0,
  },
  bundleTitle: {
    fontFamily: Fonts.serif,
    letterSpacing: -1.2,
    fontWeight: '500',
  },
  bundleDescription: {
    fontFamily: Fonts.serif,
  },
  stateCard: {
    borderRadius: 36,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 2,
  },
  playerPanel: {
    justifyContent: 'space-between',
    minHeight: 0,
    shadowOpacity: 0.1,
    shadowRadius: 28,
    shadowOffset: {
      width: 0,
      height: 18,
    },
    elevation: 3,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  progressCount: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
  },
  progressMeta: {
    fontSize: 15,
    lineHeight: 20,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  panelDivider: {
    height: 1,
  },
  affirmationCopyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  currentAffirmationText: {
    fontFamily: Fonts.serif,
    letterSpacing: -0.6,
    fontWeight: '500',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryControlButton: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 2,
  },
  playButton: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.26,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    elevation: 4,
  },
  restartRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  restartLabel: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  controlButtonDisabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.82,
  },
});
