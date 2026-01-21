import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
  async requestPermissions() {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  }

  async scheduleNotifications(habits, completedToday, paidToday) {
    // 1. Clear all existing notifications to avoid duplicates/stale schedules
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    const notifications = [];
    const now = new Date();
    const habitIds = habits.map(h => h.id);
    const resolvedIds = [...completedToday, ...(paidToday || [])];
    const pendingHabits = habits.filter(h => !resolvedIds.includes(h.id));

    // --- TRIGGER 1: Habit Deadlines ---
    // 1 notification for each habit that hasn't been completed yet
    pendingHabits.forEach(habit => {
      if (habit.habitTime) {
        const [hour, minute] = habit.habitTime.split(':').map(Number);
        const scheduleDate = new Date();
        scheduleDate.setHours(hour, minute, 0, 0);

        // Only schedule if the time hasn't passed yet today
        if (scheduleDate > now) {
          notifications.push({
            id: habit.id,
            title: 'Habit',
            body: `Time for ${habit.name}`,
            schedule: { at: scheduleDate },
            sound: 'default'
          });
        }
      }
    });

    // --- TRIGGER 2: 3 Daily Summaries ---
    // 9 AM, 2 PM, 8 PM
    const summaryTimes = [
      { id: 10001, hour: 9, label: 'Morning' },
      { id: 10002, hour: 14, label: 'Afternoon' },
      { id: 10003, hour: 20, label: 'Evening' }
    ];

    summaryTimes.forEach(time => {
      const scheduleDate = new Date();
      scheduleDate.setHours(time.hour, 0, 0, 0);

      if (scheduleDate > now) {
        const remainingCount = pendingHabits.length;
        const body = remainingCount > 0 
          ? `${remainingCount} left today` 
          : "All done!";

        notifications.push({
          id: time.id,
          title: time.label,
          body: body,
          schedule: { at: scheduleDate },
          sound: 'default'
        });
      }
    });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({
        notifications: notifications
      });
    }
  }
}

export default new NotificationService();
