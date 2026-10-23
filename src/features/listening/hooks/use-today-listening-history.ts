import { useCallback, useState } from 'react';

import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  getListeningHistory,
  type ListeningHistoryDay,
} from '@/features/listening/services/listening-history-service';
import { getLocalDateKey } from '@/features/listening/utils/local-date';

type TodayListeningHistoryState = {
  plays: ListeningHistoryDay['plays'];
  isLoading: boolean;
  isAvailable: boolean;
};

export function useTodayListeningHistory() {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<TodayListeningHistoryState>({
    plays: [],
    isLoading: false,
    isAvailable: false,
  });

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setState({ plays: [], isLoading: false, isAvailable: false });
      return;
    }

    setState((current) => ({ ...current, isLoading: true }));

    try {
      const today = getLocalDateKey(new Date());
      const history = await getListeningHistory(today, today);
      const plays = history.find((day) => day.date === today)?.plays ?? [];

      setState({ plays, isLoading: false, isAvailable: true });
    } catch (error) {
      if (__DEV__) {
        console.error(
          '[useTodayListeningHistory] Unable to load today\'s listening history',
          error,
        );
      }

      setState({ plays: [], isLoading: false, isAvailable: false });
    }
  }, [isAuthenticated]);

  return {
    ...state,
    refresh,
  };
}
