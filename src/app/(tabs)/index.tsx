import { AppScreen } from '@/components/app-screen';
import { ContinueListeningSection } from '@/features/player/components/continue-listening-section';
import { DailyRhythmSection } from '@/features/practice/components/daily-rhythm-section';

export default function HomeScreen() {
  return (
    <AppScreen eyebrow="Daily practice">
      <DailyRhythmSection />
      <ContinueListeningSection />
    </AppScreen>
  );
}
