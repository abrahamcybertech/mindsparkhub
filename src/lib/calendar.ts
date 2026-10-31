import * as Calendar from 'expo-calendar/legacy';
import { Platform } from 'react-native';
import type { EventItem } from '@/types';

export async function addEventToCalendar(event: EventItem): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      return {
        success: false,
        message: 'Calendar permission was not granted.',
      };
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar =
      Platform.OS === 'ios'
        ? calendars.find((cal) => cal.allowsModifications && cal.source.name === 'Default') ??
          calendars[0]
        : calendars.find((cal) => cal.isPrimary) ?? calendars[0];

    if (!defaultCalendar) {
      return {
        success: false,
        message: 'No suitable calendar found on your device.',
      };
    }

    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

    await Calendar.createEventAsync(defaultCalendar.id, {
      title: event.title,
      notes: event.description || event.tagline || 'MindSpark Hub confirmed event.',
      location: `${event.venue}, ${event.city}, ${event.state}`,
      startDate: start,
      endDate: end,
      timeZone: 'Africa/Lagos',
    });

    return {
      success: true,
      message: 'Event successfully added to your calendar.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Could not add event to your calendar.',
    };
  }
}
