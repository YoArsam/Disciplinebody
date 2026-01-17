import { useState, useEffect, useRef } from 'react'
import HomeScreen from './screens/HomeScreen'
import EditHabitScreen from './screens/EditHabitScreen'
import EditWalletScreen from './screens/EditWalletScreen'
// EditSkipCostScreen removed - skip cost is now per-habit
import HabitAdded from './components/HabitAdded'
import CheckInModal from './components/CheckInModal'

const getHabitDays = (habit) => habit?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]
const isHabitScheduledOnDay = (habit, dayKey) => getHabitDays(habit).includes(dayKey)
const isHabitPausedOnDate = (habit, date) => {
  if (!habit?.pausedUntil) return false
  const day = date.toISOString().split('T')[0]
  return habit.pausedUntil >= day
}

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Load from localStorage or use defaults
const loadState = () => {
  const saved = localStorage.getItem('accountability-app-state')
  if (saved) {
    return JSON.parse(saved)
  }
  return {
    wallet: 100,
        habits: [],
    completedToday: [], // habit IDs completed today
    paidToday: [], // habit IDs paid for today
    lastCheckedDate: new Date().toDateString(),
    currentStreak: 0,
    longestStreak: 0,
    habitHistory: {}, // { habitId: ['2024-12-08', '2024-12-09', ...] }
  }
}

function App() {
  const [state, setState] = useState(loadState)
  const [screen, setScreen] = useState('home') // 'home' | 'habit-adder' | 'wallet-editor' | 'skip-cost-editor'
  const [editingHabit, setEditingHabit] = useState(null)
  const [previousScreen, setPreviousScreen] = useState('home')
  const [habitsExpanded, setHabitsExpanded] = useState(false)
  const [previousHabitsExpanded, setPreviousHabitsExpanded] = useState(false)
  const [newlyAddedHabit, setNewlyAddedHabit] = useState(null)
  const [checkInQueue, setCheckInQueue] = useState([]) // Queue of habits needing check-in
  const [showSuccessToast, setShowSuccessToast] = useState(false) // For good vibes toast

  const shownCheckInsRef = useRef(new Set())

  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window === 'undefined') return 'unsupported'
    if (!('Notification' in window)) return 'unsupported'
    return Notification.permission
  })

  const notificationTimersRef = useRef({})
  const swRegistrationRef = useRef(null)

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('accountability-app-state', JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    setNotificationPermission(Notification.permission)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        swRegistrationRef.current = reg
      })
      .catch(() => {
        // ignore
      })
  }, [])

  const ensurePushSubscription = async () => {
    if (typeof window === 'undefined') return null
    if (!('serviceWorker' in navigator)) return null
    if (!('PushManager' in window)) return null

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) return null

    const reg = swRegistrationRef.current || (await navigator.serviceWorker.ready)
    if (!reg) return null

    const existing = await reg.pushManager.getSubscription()
    if (existing) {
      localStorage.setItem('push-subscription', JSON.stringify(existing))
      return existing
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })

    localStorage.setItem('push-subscription', JSON.stringify(sub))
    return sub
  }

  const syncPushSubscriptionToServer = async () => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (!('PushManager' in window)) return

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) return
    if (Notification.permission !== 'granted') return

    let subscription = null
    try {
      subscription = await ensurePushSubscription()
    } catch (e) {
      subscription = null
    }

    if (!subscription) return

    const tzOffsetMinutes = new Date().getTimezoneOffset()

    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          habits: state.habits,
          tzOffsetMinutes,
        }),
      })
    } catch (e) {
      // ignore
    }
  }

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    try {
      const res = await Notification.requestPermission()
      setNotificationPermission(res)
      if (res === 'granted') {
        try {
          const sub = await ensurePushSubscription()
          if (sub) {
            console.log('Push subscription:', JSON.stringify(sub))
          }
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      setNotificationPermission(Notification.permission)
    }
  }

  const clearNotificationTimers = () => {
    Object.values(notificationTimersRef.current).forEach((t) => clearTimeout(t))
    notificationTimersRef.current = {}
  }

  const scheduleEndTimeNotifications = () => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const now = new Date()
    const todayKey = now.getDay()

    const getHabitEndDate = (habit, baseDate) => {
      const end = new Date(baseDate)
      if (habit.allDay) {
        end.setHours(23, 59, 0, 0)
        return end
      }
      const [endHour, endMin] = habit.endTime.split(':').map(Number)
      end.setHours(endHour, endMin, 0, 0)
      return end
    }

    const shouldNotifyForHabitOnDate = (habit, date, dayKey, isToday) => {
      if (!isHabitScheduledOnDay(habit, dayKey)) return false
      if (isHabitPausedOnDate(habit, date)) return false
      if (isToday && state.completedToday.includes(habit.id)) return false
      if (isToday && state.paidToday?.includes(habit.id)) return false
      return true
    }

    state.habits.forEach((habit) => {
      // If today's endTime already passed, schedule the first one for tomorrow.
      const todayEndAt = getHabitEndDate(habit, now)
      const scheduleForToday = todayEndAt.getTime() > now.getTime()
      const targetBase = scheduleForToday ? now : new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const targetDayKey = scheduleForToday ? todayKey : targetBase.getDay()
      const targetEndAt = getHabitEndDate(habit, targetBase)

      if (!shouldNotifyForHabitOnDate(habit, targetBase, targetDayKey, scheduleForToday)) return

      const msUntil = targetEndAt.getTime() - now.getTime()
      if (msUntil <= 0) return

      const timer = setTimeout(() => {
        const latest = loadState()
        const latestNow = new Date()

        const stillActive = latest.habits.find((h) => h.id === habit.id)
        if (!stillActive) return
        if (!isHabitScheduledOnDay(stillActive, latestNow.getDay())) return
        if (isHabitPausedOnDate(stillActive, latestNow)) return
        if ((latest.completedToday || []).includes(stillActive.id)) return
        if ((latest.paidToday || []).includes(stillActive.id)) return

        const title = 'Habit Buddy'
        const body = 'So.... Did you do it? :)'

        try {
          const n = new Notification(title, {
            body,
            tag: `habit-end-${stillActive.id}`,
            renotify: false,
          })

          n.onclick = () => {
            try {
              window.focus()
            } catch (e) {
              // ignore
            }
          }
        } catch (e) {
          // ignore
        }
      }, msUntil)

      notificationTimersRef.current[habit.id] = timer
    })
  }

  useEffect(() => {
    clearNotificationTimers()
    scheduleEndTimeNotifications()
    return () => {
      clearNotificationTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.habits, state.completedToday, state.paidToday, state.lastCheckedDate, notificationPermission])

  useEffect(() => {
    if (notificationPermission !== 'granted') return
    syncPushSubscriptionToServer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationPermission, state.habits])

  // Safety: redirect to home if on habit added screen but habit is null
  useEffect(() => {
    if (screen === 'habit-added' && !newlyAddedHabit) {
      setScreen('home')
    }
  }, [screen, newlyAddedHabit])

  // Check for missed habits and reset daily completions
  useEffect(() => {
    const today = new Date().toDateString()
    
    if (state.lastCheckedDate !== today) {
      // New day - check if all habits were done yesterday, update streak
      const yesterday = new Date(state.lastCheckedDate)
      const yesterdayDayKey = yesterday.getDay()
      const scheduledYesterday = state.habits.filter(h => isHabitScheduledOnDay(h, yesterdayDayKey) && !isHabitPausedOnDate(h, yesterday))

      const allDoneYesterday = scheduledYesterday.length > 0 && 
        scheduledYesterday.every(h => state.completedToday.includes(h.id))
      
      setState(prev => {
        const newStreak = allDoneYesterday ? prev.currentStreak + 1 : 0
        return {
          ...prev,
          completedToday: [],
          paidToday: [],
          lastCheckedDate: today,
          currentStreak: newStreak,
          longestStreak: Math.max(prev.longestStreak, newStreak),
        }
      })
    }

    // Check for missed habits (past end time and not completed)
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const todayDayKey = now.getDay()

    state.habits.forEach(habit => {
      if (!isHabitScheduledOnDay(habit, todayDayKey)) return
      if (isHabitPausedOnDate(habit, now)) return
      const [endHour, endMin] = habit.endTime.split(':').map(Number)
      const endMinutes = endHour * 60 + endMin

      // Skip if created today after the deadline
      const createdAt = new Date(habit.id)
      const isCreatedToday = createdAt.toDateString() === today
      const createdMinutes = createdAt.getHours() * 60 + createdAt.getMinutes()
      
      if (isCreatedToday && createdMinutes > endMinutes) {
        return
      }

      if (currentMinutes > endMinutes && !state.completedToday.includes(habit.id)) {
        // Check if we already penalized this habit today
        const penaltyKey = `penalty-${habit.id}-${today}`
        if (!localStorage.getItem(penaltyKey)) {
          localStorage.setItem(penaltyKey, 'true')
          setState(prev => ({
            ...prev,
            wallet: Math.max(0, prev.wallet - (habit.skipCost || 0)),
          }))
        }
      }
    })
  }, [state.habits, state.completedToday, state.lastCheckedDate])

  const updateWallet = (amount) => {
    setState(prev => ({ ...prev, wallet: amount }))
  }

  const addHabit = (habit) => {
    setState(prev => ({
      ...prev,
      habits: [...prev.habits, { ...habit, id: Date.now() }],
    }))
  }

  const updateHabit = (updatedHabit) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === updatedHabit.id ? updatedHabit : h),
    }))
  }

  const deleteHabit = (habitId) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== habitId),
    }))
  }

  const markHabitDone = (habitId) => {
    if (!state.completedToday.includes(habitId)) {
      const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'
      setState(prev => {
        const habitDates = prev.habitHistory[habitId] || []
        // Only add if not already recorded for today
        const updatedDates = habitDates.includes(today) 
          ? habitDates 
          : [...habitDates, today]
        
        return {
          ...prev,
          completedToday: [...prev.completedToday, habitId],
          habitHistory: {
            ...prev.habitHistory,
            [habitId]: updatedDates,
          },
        }
      })
    }
  }

  const markHabitPaid = (habitId) => {
    if (!state.paidToday?.includes(habitId)) {
      setState(prev => ({
        ...prev,
        paidToday: [...(prev.paidToday || []), habitId],
      }))
    }
  }

  const openHabitAdder = (habit = null) => {
    setEditingHabit(habit)
    setScreen('habit-adder')
  }

  // Find ALL habits that need check-in (past end time, not completed, not paid)
  const getHabitsNeedingCheckIn = () => {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const todayDayKey = now.getDay()
    const todayStr = now.toDateString()
    
    return state.habits.filter(habit => {
      if (!isHabitScheduledOnDay(habit, todayDayKey)) return false
      if (isHabitPausedOnDate(habit, now)) return false
      if (state.completedToday.includes(habit.id)) return false
      if (state.paidToday?.includes(habit.id)) return false
      const [endHour, endMin] = habit.endTime.split(':').map(Number)
      const endMinutes = endHour * 60 + endMin

      // If the habit was created today after the deadline, don't prompt today.
      // First prompt should be tomorrow.
      const createdAt = new Date(habit.id)
      const isCreatedToday = createdAt.toDateString() === todayStr
      const createdMinutes = createdAt.getHours() * 60 + createdAt.getMinutes()
      if (isCreatedToday && createdMinutes > endMinutes) {
        return false
      }

      return currentMinutes > endMinutes
    })
  }

  // Populate / refresh check-in queue while app stays open
  useEffect(() => {
    // Reset shown set when the day rolls over
    shownCheckInsRef.current = new Set()
    setCheckInQueue([])
  }, [state.lastCheckedDate])

  useEffect(() => {
    const enqueue = () => {
      const habitsNeedingCheckIn = getHabitsNeedingCheckIn()
      if (habitsNeedingCheckIn.length === 0) return

      setCheckInQueue((prev) => {
        const queuedIds = new Set(prev.map((h) => h.id))
        const next = [...prev]

        habitsNeedingCheckIn.forEach((h) => {
          if (queuedIds.has(h.id)) return
          if (shownCheckInsRef.current.has(h.id)) return
          shownCheckInsRef.current.add(h.id)
          next.push(h)
        })

        return next
      })
    }

    // Run immediately + on an interval so you don't have to reload
    enqueue()
    const interval = setInterval(enqueue, 30 * 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.habits, state.completedToday, state.paidToday, state.lastCheckedDate])

  // Current habit to show = first in queue
  const currentCheckIn = checkInQueue[0] || null

  // Check if we should show the main nav bar (not on editor screens)
  const showMainNav = screen === 'home'

  return (
    <div className="h-full w-full relative">
      {/* Version Tracker */}
      <div className="fixed top-4 right-4 z-[100] bg-black/50 backdrop-blur-sm text-[10px] text-white/70 px-2 py-1 rounded-full font-mono pointer-events-none">
        v1.1.1
      </div>

      <div style={{ display: screen === 'home' ? 'contents' : 'none' }}>
          <HomeScreen
            wallet={state.wallet}
            habits={state.habits}
            completedToday={state.completedToday}
            paidToday={state.paidToday || []}
            currentStreak={state.currentStreak || 0}
            longestStreak={state.longestStreak || 0}
            habitHistory={state.habitHistory || {}}
            habitsExpanded={habitsExpanded}
            notificationPermission={notificationPermission}
            onEnableNotifications={requestNotificationPermission}
                        onAddHabit={() => {
              setPreviousHabitsExpanded(habitsExpanded)
              setEditingHabit(null)
              setScreen('habit-adder')
            }}
            onEditHabit={(habit) => {
              setPreviousHabitsExpanded(habitsExpanded)
              setEditingHabit(habit)
              setScreen('habit-adder')
            }}
            onMarkDone={markHabitDone}
            onToggleHabits={() => setHabitsExpanded(!habitsExpanded)}
          />
        </div>
      {screen === 'habit-adder' && (
        <EditHabitScreen
          habit={editingHabit}
          onSave={(habit) => {
            if (editingHabit) {
              updateHabit(habit)
              setEditingHabit(null)
              setScreen(previousScreen)
              setPreviousScreen('home')
            } else {
              // New habit - add it and show confirmation
              const newHabit = { ...habit, id: Date.now() }
              setState(prev => ({
                ...prev,
                habits: [...prev.habits, newHabit],
              }))
              setNewlyAddedHabit(newHabit)
              setEditingHabit(null)
              setScreen('habit-added')
            }
          }}
          onDelete={editingHabit ? () => {
            deleteHabit(editingHabit.id)
            setEditingHabit(null)
            setScreen(previousScreen)
            setPreviousScreen('home')
          } : null}
          onBack={() => {
            setEditingHabit(null)
            setScreen(previousScreen)
            setPreviousScreen('home')
            setHabitsExpanded(previousHabitsExpanded)
          }}
        />
      )}
      {screen === 'habit-added' && newlyAddedHabit && (
        <HabitAdded
          habit={newlyAddedHabit}
          onDone={() => {
            setNewlyAddedHabit(null)
            setScreen('home')
          }}
        />
      )}
      {screen === 'wallet-editor' && (
        <EditWalletScreen
          wallet={state.wallet}
          onSave={(amount) => {
            updateWallet(amount)
            setScreen('home')
          }}
          onBack={() => setScreen('home')}
        />
      )}
      
        {/* Global Bottom Nav - Outside all screen transitions */}
        {showMainNav && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-50">
            <div className="max-w-md mx-auto flex justify-center items-center gap-12">
              {/* Home */}
              <button 
                onClick={() => setHabitsExpanded(false)}
                className="p-2"
              >
                <svg className={`w-6 h-6 ${!habitsExpanded ? 'text-orange-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              {/* Heart */}
              <button 
                onClick={() => setHabitsExpanded(true)}
                className="p-2"
              >
                <svg className={`w-6 h-6 ${habitsExpanded ? 'text-orange-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              {/* Dollar */}
              <button className="p-2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div 
          className="fixed top-[max(1rem,env(safe-area-inset-top))] left-4 right-4 bg-green-500 text-white py-4 px-6 rounded-2xl z-[60] flex items-center justify-center gap-2"
          onAnimationEnd={() => setShowSuccessToast(false)}
          style={{ animation: 'toastSlide 2s ease-out forwards' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold text-lg">Great job!</span>
        </div>
      )}

      {/* Check-in Modal */}
      {currentCheckIn && (
        <CheckInModal
          key={currentCheckIn.id}
          habit={currentCheckIn}
          onYes={() => {
            const id = currentCheckIn.id
            markHabitDone(id)
            setCheckInQueue(prev => prev.slice(1)) // Remove first, show next
            setShowSuccessToast(true) // Show good vibes
          }}
          onNo={() => {
            const id = currentCheckIn.id
            markHabitPaid(id) // Mark as paid (separate from done)
            setCheckInQueue(prev => prev.slice(1)) // Remove first, show next
          }}
        />
      )}
    </div>
  )
}

export default App
