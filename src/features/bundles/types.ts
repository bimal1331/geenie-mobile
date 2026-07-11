export type BundleSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  affirmationCount: number;
  isPremium: boolean;
};
