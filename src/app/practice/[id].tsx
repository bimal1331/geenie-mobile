import { useLocalSearchParams } from 'expo-router';

import { PracticeSlotScreen } from '@/features/practice/screens/practice-slot-screen';

export default function PracticeSlotRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const practiceSlotId = Array.isArray(id) ? id[0] : id;

  return <PracticeSlotScreen slotId={practiceSlotId ?? 'new'} />;
}
