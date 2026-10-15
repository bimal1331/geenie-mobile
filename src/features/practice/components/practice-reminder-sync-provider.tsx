import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuthStore } from '@/features/auth/store/auth-store';
import {
  clearPracticeReminders,
  syncPracticeReminders,
} from '@/features/practice/services/practice-reminders';
import { listPracticeSlots } from '@/features/practice/services/practice-service';

/** Keeps this device's local schedule aligned with the signed-in user's plan. */
export function PracticeReminderSyncProvider() {
  const authStatus = useAuthStore((state) => state.status);
  const userId = useAuthStore((state) => state.session?.userId ?? null);

  useEffect(() => {
    let isMounted = true;

    async function syncPracticePlan() {
      if (authStatus === 'loading' || !isMounted) {
        return;
      }

      try {
        if (!userId) {
          await clearPracticeReminders();
          return;
        }

        const practiceSlots = await listPracticeSlots();

        if (isMounted) {
          await syncPracticeReminders(practiceSlots);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[PracticeReminderSyncProvider] Unable to sync local reminders', error);
        }
      }
    }

    void syncPracticePlan();
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && userId) {
        void syncPracticePlan();
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [authStatus, userId]);

  return null;
}
