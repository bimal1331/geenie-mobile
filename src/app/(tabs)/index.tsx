import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { Spacing } from '@/constants/theme';
import { ContinueListeningSection } from '@/features/player/components/continue-listening-section';
import { PracticeProgressSection } from '@/features/listening/components/practice-progress-section';
import { DailyRhythmSection } from '@/features/practice/components/daily-rhythm-section';

export default function HomeScreen() {
  return (
    <AppScreen eyebrow="Daily practice">
      <PracticeProgressSection />
      <View style={styles.dailyRhythmSection}>
        <DailyRhythmSection />
      </View>
      <ContinueListeningSection />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  dailyRhythmSection: {
    paddingTop: Spacing.three,
  },
});
