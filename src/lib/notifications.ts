import * as Notifications from 'expo-notifications';
import type { EventItem } from '@/types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function scheduleEventReminder(event: EventItem): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return {
        success: false,
        message: 'Notification permission is required to set a reminder.',
      };
    }

    const eventDate = new Date(event.startDate).getTime();
    // Schedule 2 hours before the event, or in 1 minute if the event is very soon
    const reminderTime = Math.max(Date.now() + 60 * 1000, eventDate - 2 * 60 * 60 * 1000);

    const secondsUntilReminder = Math.round((reminderTime - Date.now()) / 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upcoming MindSpark Hub Event',
        body: `${event.title} begins soon at ${event.venue}, ${event.city}.`,
        data: { eventId: event.id, url: `/events/${event.id}` },
        color: '#0D2748',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilReminder,
      },
    });

    return {
      success: true,
      message: 'Reminder scheduled for this event.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Could not schedule reminder.',
    };
  }
}
