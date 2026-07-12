export type BundlePlaybackVariantKey = 'default' | 'male' | 'female';

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
  languageCode: string | null;
  variantKey: BundlePlaybackVariantKey | null;
  voiceId: string | null;
  voiceName: string | null;
  audioUrl: string | null;
};

export type BundleDetail = BundleSummary & {
  items: BundleDetailItem[];
};
