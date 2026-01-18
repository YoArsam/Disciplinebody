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
  const [screen, setScreen] = useState('home')
  const [editingHabit, setEditingHabit] = useState(null)
  const [previousScreen, setPreviousScreen] = useState('home')
  const [habitsExpanded, setHabitsExpanded] = useState(false)
  const [previousHabitsExpanded, setPreviousHabitsExpanded] = useState(false)
  const [newlyAddedHabit, setNewlyAddedHabit] = useState(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('accountability-app-state', JSON.stringify(state))
  }, [state])

  // Reset daily completions and check for missed habits once a day
  useEffect(() => {
    const checkDayTransition = () => {
      const today = new Date().toDateString()
      if (state.lastCheckedDate !== today) {
        setState(prev => {
          // Identify habits that were scheduled yesterday but not completed
          const yesterday = new Date(prev.lastCheckedDate)
          const yesterdayDayKey = yesterday.getDay()
          
          const missedHabits = prev.habits.filter(h => {
            const isScheduled = h.daysOfWeek.includes(yesterdayDayKey)
            const isPaused = h.pausedUntil && h.pausedUntil >= yesterday.toISOString().split('T')[0]
            const isDone = prev.completedToday.includes(h.id)
            const isPaid = prev.paidToday?.includes(h.id)
            return isScheduled && !isPaused && !isDone && !isPaid
          })

          const totalPenalty = missedHabits.reduce((sum, h) => sum + (h.skipCost || 0), 0)

          return {
            ...prev,
            wallet: Math.max(0, prev.wallet - totalPenalty),
            completedToday: [],
            paidToday: [],
            lastCheckedDate: today,
          }
        })
      }
    }

    checkDayTransition()
    const interval = setInterval(checkDayTransition, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [state.lastCheckedDate, state.habits, state.completedToday, state.paidToday])

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

  // Check if we should show the main nav bar (not on editor screens)
  const showMainNav = screen === 'home'

  return (
    <div className="h-full w-full relative">
      {/* Version Tracker */}
      <div className="fixed top-4 right-4 z-[100] bg-black/50 backdrop-blur-sm text-[10px] text-white/70 px-2 py-1 rounded-full font-mono pointer-events-none">
        v1.7.3
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
              setScreen('home')
              // Keep habitsExpanded as is (if they were on habits page, they stay there)
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
            setScreen('home')
            // Keep habitsExpanded as is
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
    </div>
  )
}

export default App
