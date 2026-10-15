import { apiDelete, apiGet, apiPatch, apiPost } from '@/services/api/client';

import type { PracticeSlot, PracticeSlotInput } from '@/features/practice/types';

const PRACTICE_SLOTS_PATH = '/api/mobile/practice-slots';

export async function listPracticeSlots(): Promise<PracticeSlot[]> {
  const response = await apiGet<{ practiceSlots: PracticeSlot[] }>(PRACTICE_SLOTS_PATH, {
    auth: 'required',
  });

  return response.practiceSlots;
}

export async function createPracticeSlot(input: PracticeSlotInput): Promise<PracticeSlot> {
  const response = await apiPost<{ practiceSlot: PracticeSlot }>(PRACTICE_SLOTS_PATH, {
    auth: 'required',
    body: JSON.stringify(input),
  });

  return response.practiceSlot;
}

export async function updatePracticeSlot(
  id: string,
  input: Partial<PracticeSlotInput>,
): Promise<PracticeSlot> {
  const response = await apiPatch<{ practiceSlot: PracticeSlot }>(
    `${PRACTICE_SLOTS_PATH}/${encodeURIComponent(id)}`,
    {
      auth: 'required',
      body: JSON.stringify(input),
    },
  );

  return response.practiceSlot;
}

export async function deletePracticeSlot(id: string) {
  return apiDelete<{ message: string }>(`${PRACTICE_SLOTS_PATH}/${encodeURIComponent(id)}`, {
    auth: 'required',
  });
}
