import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
  async requestPermissions() {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  }

  async scheduleDailyNotifications(habits, completedToday, paidToday) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const todayIso = today.toISOString().split('T')[0];
    const doneIds = new Set([...(completedToday || []), ...(paidToday || [])]);

    // 1. Cancel ALL existing notifications to start fresh
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const notifications = [];

    // 2. Daily Pulse Notifications (IDs 1-3)
    const activeHabitsToday = habits.filter(h => {
      const isScheduled = (h.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]).includes(dayOfWeek);
      const isPaused = h.pausedUntil && h.pausedUntil >= todayIso;
      return isScheduled && !isPaused;
    });

    const pendingCount = activeHabitsToday.filter(h => !doneIds.has(h.id)).length;
    let pulseMessage = habits.length === 0 
      ? "Start your journey. Add a habit now!" 
      : pendingCount <= 0 
        ? "You're all set! Great discipline today." 
        : `${pendingCount} habits left. Let's get it!`;

    const pulseTimes = [
      { id: 1, hour: 9, minute: 0 },
      { id: 2, hour: 14, minute: 0 },
      { id: 3, hour: 20, minute: 0 }
    ];

    pulseTimes.forEach(time => {
      const scheduleDate = new Date();
      scheduleDate.setHours(time.hour, time.minute, 0, 0);
      
      // Only schedule if the time is in the future
      if (scheduleDate > today) {
        notifications.push({
          id: time.id,
          title: 'Habit Buddy',
          body: pulseMessage,
          schedule: { at: scheduleDate },
          sound: 'default'
        });
      }
    });

    // 3. Specific Habit Time Notifications (ID = habit.id)
    habits.forEach(habit => {
      if (habit.habitTime && !doneIds.has(habit.id)) {
        const [hour, minute] = habit.habitTime.split(':').map(Number);
        const scheduleDate = new Date();
        scheduleDate.setHours(hour, minute, 0, 0);

        if (scheduleDate > today) {
          notifications.push({
            id: habit.id,
            title: 'Habit Time!',
            body: `Time to complete: ${habit.name}`,
            schedule: { at: scheduleDate },
            sound: 'default'
          });
        }
      } else if (!habit.habitTime && !doneIds.has(habit.id)) {
        // All Day habits get a notification at 9 PM if still pending
        const scheduleDate = new Date();
        scheduleDate.setHours(21, 0, 0, 0);
        
        if (scheduleDate > today) {
          notifications.push({
            id: habit.id,
            title: 'Habit Check-in',
            body: `Did you do it? ${habit.name}`,
            schedule: { at: scheduleDate },
            sound: 'default'
          });
        }
      }
    });

    // 4. Yesterday Check-in (ID 99) - Fires at 9 AM next day
    const tomorrow9am = new Date();
    tomorrow9am.setDate(tomorrow9am.getDate() + 1);
    tomorrow9am.setHours(9, 0, 0, 0);
    
    notifications.push({
      id: 99,
      title: 'Morning Review',
      body: 'Did you complete all your habits yesterday?',
      schedule: { at: tomorrow9am },
      sound: 'default'
    });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  }

  // Development tool to test notifications in 1 minute
  async scheduleTestNotification(habits, completedToday, paidToday) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const todayIso = today.toISOString().split('T')[0];

    const activeHabits = habits.filter(h => {
      const isScheduled = (h.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]).includes(dayOfWeek);
      const isPaused = h.pausedUntil && h.pausedUntil >= todayIso;
      return isScheduled && !isPaused;
    });

    const doneIds = new Set([...(completedToday || []), ...(paidToday || [])]);
    const pendingCount = activeHabits.filter(h => !doneIds.has(h.id)).length;
    
    let message = '';
    if (habits.length === 0) {
      message = "Start your journey. Add a habit now!";
    } else if (pendingCount <= 0) {
      message = "You're all set! Great discipline today.";
    } else {
      message = `${pendingCount} habits left. Let's get it!`;
    }

    const testDate = new Date(Date.now() + 60000); // 1 minute from now

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 99,
          title: 'Test Notification',
          body: message,
          schedule: { at: testDate },
          sound: 'default'
        }
      ]
    });
    alert('Test notification scheduled for 1 minute from now!');
  }
}

export default new NotificationService();
