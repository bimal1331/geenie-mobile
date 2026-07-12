export type BundleSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  affirmationCount: number;
  isPremium: boolean;
};

export type BundleDetailItem = {
  affirmationId: string;
  orderIndex: number;
  text: string;
  tags: string[];
};

export type BundleDetail = BundleSummary & {
  items: BundleDetailItem[];
};
