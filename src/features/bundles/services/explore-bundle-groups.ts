import type { BundleSummary, BundleTag } from '@/features/bundles/types';

export type ExploreBundleGroup = {
  id: string;
  slug: string;
  name: string | null;
  bundles: BundleSummary[];
};

type GroupedBundle = {
  bundle: BundleSummary;
  bundleSortOrder: number;
};

function compareTopics(left: BundleTag, right: BundleTag) {
  return (
    left.exploreSortOrder - right.exploreSortOrder ||
    left.name.localeCompare(right.name)
  );
}

/**
 * Uses explicit bundle topics instead of deriving categories from the tags on
 * every affirmation. A bundle may intentionally appear in more than one topic.
 */
export function groupBundlesForExplore(bundles: BundleSummary[]): ExploreBundleGroup[] {
  const topicGroups = new Map<
    string,
    { topic: BundleTag; entries: GroupedBundle[] }
  >();
  const uncategorizedBundles: BundleSummary[] = [];

  for (const bundle of bundles) {
    const exploreTopics = (bundle.tags ?? [])
      .filter((tag) => tag.isExploreCategory)
      .sort(compareTopics);

    if (exploreTopics.length === 0) {
      uncategorizedBundles.push(bundle);
      continue;
    }

    for (const topic of exploreTopics) {
      const group = topicGroups.get(topic.id) ?? { topic, entries: [] };
      group.entries.push({ bundle, bundleSortOrder: topic.sortOrder });
      topicGroups.set(topic.id, group);
    }
  }

  const groups = [...topicGroups.values()]
    .sort((left, right) => compareTopics(left.topic, right.topic))
    .map(({ topic, entries }) => ({
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
      bundles: entries
        .sort(
          (left, right) =>
            left.bundleSortOrder - right.bundleSortOrder ||
            left.bundle.title.localeCompare(right.bundle.title),
        )
        .map(({ bundle }) => bundle),
    }));

  if (groups.length === 0) {
    return [
      {
        id: 'all-bundles',
        slug: 'all-bundles',
        name: 'All bundles',
        bundles: uncategorizedBundles,
      },
    ];
  }

  if (uncategorizedBundles.length > 0) {
    groups.push({
      id: 'more-to-explore',
      slug: 'more-to-explore',
      name: 'More to explore',
      bundles: uncategorizedBundles.sort((left, right) =>
        left.title.localeCompare(right.title),
      ),
    });
  }

  return groups;
}
