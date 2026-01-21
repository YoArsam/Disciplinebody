import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
  async requestPermissions() {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  }

  async scheduleDailyNotifications(habits, completedToday, paidToday) {
    // Cancel all existing notifications
    await LocalNotifications.cancel({
      notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, ...habits.map(h => h.id)]
    });

    const today = new Date();
    const dayOfWeek = today.getDay();
    const todayIso = today.toISOString().split('T')[0];

    // Calculate habits scheduled for today
    const activeHabits = habits.filter(h => {
      const isScheduled = (h.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]).includes(dayOfWeek);
      const isPaused = h.pausedUntil && h.pausedUntil >= todayIso;
      return isScheduled && !isPaused;
    });

    // Count how many of those active habits are NOT completed and NOT paid
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

    const scheduleTimes = [
      { id: 1, hour: 9, minute: 0 },
      { id: 2, hour: 14, minute: 0 },
      { id: 3, hour: 20, minute: 0 }
    ];

    const notifications = scheduleTimes.map(time => ({
      id: time.id,
      title: 'Habit Buddy',
      body: message,
      schedule: {
        on: {
          hour: time.hour,
          minute: time.minute
        },
        repeats: true,
        allowWhileIdle: true
      },
      sound: 'default'
    }));

    // Add specific habit time notifications
    habits.forEach(habit => {
      if (habit.habitTime && !doneIds.has(habit.id)) {
        const [hour, minute] = habit.habitTime.split(':').map(Number);
        notifications.push({
          id: habit.id,
          title: 'Habit Time!',
          body: `Time to complete: ${habit.name}`,
          schedule: {
            on: {
              hour,
              minute
            },
            repeats: true,
            allowWhileIdle: true
          },
          sound: 'default'
        });
      }
    });

    await LocalNotifications.schedule({ notifications });
    console.log('Scheduled notifications:', notifications);
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
