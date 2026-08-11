import type { PlayerQueueItem } from '@/features/player/store/player-store';

export function createQueueSignature(queue: PlayerQueueItem[]) {
  return JSON.stringify(
    queue.map((item) => ({
      affirmationId: item.affirmationId,
      orderIndex: item.orderIndex,
      audioUrl: item.audioUrl,
    })),
  );
}
