import Slider from '@react-native-community/slider';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BottomSheetModal } from '@/components/bottom-sheet-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  AVAILABLE_PLAYBACK_VOICES,
} from '@/features/settings/config';
import { usePlaybackSettings } from '@/features/settings/hooks/use-playback-settings';
import { useSettingsStore } from '@/features/settings/store/settings-store';
import { useTheme } from '@/hooks/use-theme';

type PlaybackSettingsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

function formatGapLabel(value: number) {
  if (value === 0) {
    return 'None';
  }

  return `${(value / 1000).toFixed(0)}s`;
}

function formatVolumeLabel(value: number) {
  return `${Math.round(value * 100)}%`;
}

type ChoiceChipProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

function ChoiceChip({ label, isSelected, onPress }: ChoiceChipProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isSelected ? 'backgroundSelected' : 'background'}
        style={styles.choiceChip}>
        <ThemedText type="smallBold">{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

type VolumeSliderRowProps = {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
};

function VolumeSliderRow({ label, value, onValueChange }: VolumeSliderRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.settingGroup}>
      <View style={styles.settingHeader}>
        <ThemedText type="smallBold">{label}</ThemedText>
        <ThemedText themeColor="textSecondary">{formatVolumeLabel(value)}</ThemedText>
      </View>
      <Slider
        minimumTrackTintColor={theme.text}
        maximumTrackTintColor={theme.backgroundSelected}
        thumbTintColor={theme.text}
        minimumValue={0}
        maximumValue={1}
        step={0.05}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

type GapSliderRowProps = {
  value: number;
  onValueChange: (value: number) => void;
};

function GapSliderRow({ value, onValueChange }: GapSliderRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.settingGroup}>
      <View style={styles.settingHeader}>
        <ThemedText type="smallBold">Gap between affirmations</ThemedText>
        <ThemedText themeColor="textSecondary">{formatGapLabel(value)}</ThemedText>
      </View>
      <Slider
        minimumTrackTintColor={theme.text}
        maximumTrackTintColor={theme.backgroundSelected}
        thumbTintColor={theme.text}
        minimumValue={0}
        maximumValue={30000}
        step={1000}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

export function PlaybackSettingsSheet({
  isOpen,
  onClose,
}: PlaybackSettingsSheetProps) {
  const {
    hasHydrated,
    affirmationGapMs,
    musicVolume,
    voiceVolume,
    loopBundleForever,
    selectedVoice,
  } =
    usePlaybackSettings();
  const setAffirmationGapMs = useSettingsStore((state) => state.setAffirmationGapMs);
  const setMusicVolume = useSettingsStore((state) => state.setMusicVolume);
  const setVoiceVolume = useSettingsStore((state) => state.setVoiceVolume);
  const setLoopBundleForever = useSettingsStore((state) => state.setLoopBundleForever);
  const setSelectedVoice = useSettingsStore((state) => state.setSelectedVoice);

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Playback settings"
      description="These settings are stored on this device and apply across the app."
      sheetStyle={styles.sheet}>
      {!hasHydrated ? (
        <View style={styles.stateCard}>
          <ThemedText themeColor="textSecondary">Loading your saved settings...</ThemedText>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.contentColumn}
          showsVerticalScrollIndicator={false}>
          <GapSliderRow value={affirmationGapMs} onValueChange={setAffirmationGapMs} />

          <VolumeSliderRow
            label="Music volume"
            value={musicVolume}
            onValueChange={setMusicVolume}
          />

          <VolumeSliderRow
            label="Voice volume"
            value={voiceVolume}
            onValueChange={setVoiceVolume}
          />

          <View style={styles.settingGroup}>
            <View style={styles.settingHeader}>
              <ThemedText type="smallBold">Loop bundle forever</ThemedText>
              <ThemedText themeColor="textSecondary">
                {loopBundleForever ? 'On' : 'Off'}
              </ThemedText>
            </View>
            <View style={styles.choiceRow}>
              <ChoiceChip
                label="Off"
                isSelected={!loopBundleForever}
                onPress={() => setLoopBundleForever(false)}
              />
              <ChoiceChip
                label="On"
                isSelected={loopBundleForever}
                onPress={() => setLoopBundleForever(true)}
              />
            </View>
          </View>

          <View style={styles.settingGroup}>
            <View style={styles.settingHeader}>
              <ThemedText type="smallBold">Selected voice</ThemedText>
              <ThemedText themeColor="textSecondary">{selectedVoice.label}</ThemedText>
            </View>
            <View style={styles.choiceRow}>
              {AVAILABLE_PLAYBACK_VOICES.map((voice) => (
                <ChoiceChip
                  key={voice.providerVoiceId}
                  label={voice.label}
                  isSelected={selectedVoice.providerVoiceId === voice.providerVoiceId}
                  onPress={() => setSelectedVoice(voice)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    minHeight: '44%',
  },
  stateCard: {
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.one,
  },
  contentColumn: {
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  settingGroup: {
    gap: Spacing.two,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  choiceChip: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.82,
  },
});
