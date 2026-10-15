import { useEffect } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function navigateFromNotification(notification: Notifications.Notification) {
  const url = notification.request.content.data?.url;

  if (typeof url === 'string' && url.startsWith('/')) {
    router.push(url);
  }
}

export function PracticeNotificationProvider() {
  useEffect(() => {
    const lastResponse = Notifications.getLastNotificationResponse();

    if (lastResponse?.notification) {
      navigateFromNotification(lastResponse.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      navigateFromNotification(response.notification);
    });

    return () => subscription.remove();
  }, []);

  return null;
}
