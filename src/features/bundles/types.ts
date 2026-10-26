export type BundlePlaybackVariantKey = 'default' | 'male' | 'female';

export type BundleTag = {
  id: string;
  slug: string;
  name: string;
  isExploreCategory: boolean;
  exploreSortOrder: number;
  sortOrder: number;
};

export type BundleSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  affirmationCount: number;
  isPremium: boolean;
  isLocked: boolean;
  tags: BundleTag[];
};

export type BundleDetailItem = {
  affirmationId: string;
  orderIndex: number;
  text: string;
  tags: string[];
  languageCode: string | null;
  variantKey: BundlePlaybackVariantKey | null;
  voiceId: string | null;
  voiceName: string | null;
  audioUrl: string | null;
};

export type BundleDetail = BundleSummary & {
  isSaved?: boolean;
  items: BundleDetailItem[];
};
