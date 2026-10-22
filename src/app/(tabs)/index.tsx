import { AppScreen } from '@/components/app-screen';
import { ContinueListeningSection } from '@/features/player/components/continue-listening-section';
import { PracticeProgressSection } from '@/features/listening/components/practice-progress-section';
import { DailyRhythmSection } from '@/features/practice/components/daily-rhythm-section';

export default function HomeScreen() {
  return (
    <AppScreen eyebrow="Daily practice">
      <PracticeProgressSection />
      <DailyRhythmSection />
      <ContinueListeningSection />
    </AppScreen>
  );
}
