export type BundlePlayerSession = {
  bundleTitle: string;
  bundleDescription: string | null;
  totalAffirmations: number;
  currentIndex: number;
  isPlaying: boolean;
  currentText: string | null;
  progressLabel: string;
  progressRatio: number;
};
