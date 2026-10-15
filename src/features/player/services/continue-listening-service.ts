import { createLocalStorage } from '@/services/storage/local-storage';

const continueListeningStorage = createLocalStorage('geenie-player');
const CONTINUE_LISTENING_KEY = 'continue-listening';
let storageOperation = Promise.resolve();

export type ContinueListeningProgress = {
  bundleSlug: string;
  bundleTitle: string;
  bundleCoverImageUrl: string | null;
  currentIndex: number;
  totalAffirmations: number;
  updatedAt: string;
};

function isContinueListeningProgress(value: unknown): value is ContinueListeningProgress {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const progress = value as Partial<ContinueListeningProgress>;

  return (
    typeof progress.bundleSlug === 'string' &&
    typeof progress.bundleTitle === 'string' &&
    (typeof progress.bundleCoverImageUrl === 'string' || progress.bundleCoverImageUrl === null) &&
    typeof progress.currentIndex === 'number' &&
    Number.isInteger(progress.currentIndex) &&
    progress.currentIndex >= 0 &&
    typeof progress.totalAffirmations === 'number' &&
    Number.isInteger(progress.totalAffirmations) &&
    progress.totalAffirmations > 0 &&
    typeof progress.updatedAt === 'string'
  );
}

function enqueueStorageOperation(operation: () => Promise<void>) {
  const nextOperation = storageOperation.then(operation, operation);

  storageOperation = nextOperation.catch(() => {});
  return nextOperation;
}

export async function getContinueListeningProgress() {
  await storageOperation;
  const value = await continueListeningStorage.getItem(CONTINUE_LISTENING_KEY);

  if (!value) {
    return null;
  }

  try {
    const progress: unknown = JSON.parse(value);

    if (isContinueListeningProgress(progress) && progress.currentIndex < progress.totalAffirmations) {
      return progress;
    }
  } catch {
    // Treat malformed local data as stale playback state.
  }

  await clearContinueListeningProgress();
  return null;
}

export async function saveContinueListeningProgress(
  progress: Omit<ContinueListeningProgress, 'updatedAt'>,
) {
  await enqueueStorageOperation(() =>
    continueListeningStorage.setItem(
      CONTINUE_LISTENING_KEY,
      JSON.stringify({ ...progress, updatedAt: new Date().toISOString() }),
    ),
  );
}

export async function clearContinueListeningProgress() {
  await enqueueStorageOperation(() => continueListeningStorage.removeItem(CONTINUE_LISTENING_KEY));
}
