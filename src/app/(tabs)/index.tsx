import { AppScreen } from '@/components/app-screen';
import { StyleSheet } from 'react-native';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ContinueListeningSection } from '@/features/player/components/continue-listening-section';
import { DailyRhythmSection } from '@/features/practice/components/daily-rhythm-section';

function greetingForCurrentTime() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { profile } = useAuth();
  const displayName = profile?.displayName?.trim() || 'there';

  return (
    <AppScreen
      eyebrow="Daily practice"
      title={`${greetingForCurrentTime()}, ${displayName}`}
      titleStyle={styles.greetingTitle}>
      <DailyRhythmSection />
      <ContinueListeningSection />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  greetingTitle: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
  },
});
