import { useCallback, useEffect, useState } from 'react';

import { useAuthStore } from '@/features/auth/store/auth-store';
import { listPracticeSlots } from '@/features/practice/services/practice-service';
import type { PracticeSlot } from '@/features/practice/types';

type PracticeSlotsState = {
  practiceSlots: PracticeSlot[];
  isLoading: boolean;
  error: string | null;
};

export function usePracticeSlots() {
  const authStatus = useAuthStore((state) => state.status);
  const userId = useAuthStore((state) => state.session?.userId ?? null);
  const [state, setState] = useState<PracticeSlotsState>({
    practiceSlots: [],
    isLoading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!userId) {
      setState({
        practiceSlots: [],
        isLoading: false,
        error: null,
      });
      return [];
    }

    setState((current) => ({ ...current, isLoading: true, error: null }));

    try {
      const practiceSlots = await listPracticeSlots();
      setState({ practiceSlots, isLoading: false, error: null });
      return practiceSlots;
    } catch (error) {
      if (__DEV__) {
        console.error('[usePracticeSlots] Unable to load practice slots', error);
      }

      setState({
        practiceSlots: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unable to load your practice.',
      });
      return [];
    }
  }, [userId]);

  useEffect(() => {
    if (authStatus === 'loading') {
      return;
    }

    void refresh();
  }, [authStatus, refresh]);

  return {
    ...state,
    refresh,
  };
}
