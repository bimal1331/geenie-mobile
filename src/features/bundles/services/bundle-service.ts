import { BundleSummary } from '@/features/bundles/types';

const MOCK_BUNDLES: BundleSummary[] = [
  {
    id: 'morning-grounding',
    title: 'Morning Grounding',
    description: 'A steady set of affirmations to settle your nervous system before the day expands.',
    mood: 'calm',
    durationLabel: '8 min',
    affirmationCount: 12,
    isPremium: false,
  },
  {
    id: 'confidence-reset',
    title: 'Confidence Reset',
    description: 'Short, direct affirmations for regaining traction when self-doubt starts getting loud.',
    mood: 'confidence',
    durationLabel: '6 min',
    affirmationCount: 9,
    isPremium: true,
  },
  {
    id: 'sleep-softening',
    title: 'Sleep Softening',
    description: 'Gentle repetitions designed for slower breathing, looser shoulders, and a quieter mind.',
    mood: 'sleep',
    durationLabel: '11 min',
    affirmationCount: 14,
    isPremium: false,
  },
  {
    id: 'focus-lane',
    title: 'Focus Lane',
    description: 'A sharper sequence for clearing distractions and settling into one meaningful stretch of work.',
    mood: 'focus',
    durationLabel: '7 min',
    affirmationCount: 10,
    isPremium: false,
  },
  {
    id: 'midday-soft-reset',
    title: 'Midday Soft Reset',
    description: 'A gentle break when the day starts feeling noisy, overbooked, or emotionally expensive.',
    mood: 'calm',
    durationLabel: '5 min',
    affirmationCount: 8,
    isPremium: false,
  },
  {
    id: 'steady-confidence',
    title: 'Steady Confidence',
    description: 'Less hype, more grounded self-trust for moments when you need composure instead of adrenaline.',
    mood: 'confidence',
    durationLabel: '9 min',
    affirmationCount: 13,
    isPremium: true,
  },
  {
    id: 'night-unwinding',
    title: 'Night Unwinding',
    description: 'A slower, softer progression for releasing the day before sleep and letting your body unbrace.',
    mood: 'sleep',
    durationLabel: '12 min',
    affirmationCount: 15,
    isPremium: true,
  },
];

export async function listBundleCatalog(): Promise<BundleSummary[]> {
  return Promise.resolve(MOCK_BUNDLES);
}
