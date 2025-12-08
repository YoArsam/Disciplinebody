import { useState, useEffect } from 'react'
import { LayoutGroup, AnimatePresence } from 'framer-motion'
import HomeScreen from './screens/HomeScreen'
import HabitsScreen from './screens/HabitsScreen'
import EditHabitScreen from './screens/EditHabitScreen'
import EditWalletScreen from './screens/EditWalletScreen'
import EditSkipCostScreen from './screens/EditSkipCostScreen'

// Load from localStorage or use defaults
const loadState = () => {
  const saved = localStorage.getItem('accountability-app-state')
  if (saved) {
    return JSON.parse(saved)
  }
  return {
    wallet: 100,
    skipCost: 0.5,
    habits: [],
    completedToday: [], // habit IDs completed today
    lastCheckedDate: new Date().toDateString(),
  }
}

function App() {
  const [state, setState] = useState(loadState)
  const [screen, setScreen] = useState('home') // 'home' | 'habits-page' | 'habit-adder' | 'wallet-editor' | 'skip-cost-editor'
  const [editingHabit, setEditingHabit] = useState(null)
  const [previousScreen, setPreviousScreen] = useState('home')

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('accountability-app-state', JSON.stringify(state))
  }, [state])

  // Check for missed habits and reset daily completions
  useEffect(() => {
    const today = new Date().toDateString()
    
    if (state.lastCheckedDate !== today) {
      // New day - check for missed habits from yesterday and reset
      setState(prev => ({
        ...prev,
        completedToday: [],
        lastCheckedDate: today,
      }))
    }

    // Check for missed habits (past end time and not completed)
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    state.habits.forEach(habit => {
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
            wallet: Math.max(0, prev.wallet - prev.skipCost),
          }))
        }
      }
    })
  }, [state.habits, state.completedToday, state.lastCheckedDate, state.skipCost])

  const updateWallet = (amount) => {
    setState(prev => ({ ...prev, wallet: amount }))
  }

  const updateSkipCost = (amount) => {
    setState(prev => ({ ...prev, skipCost: amount }))
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
      setState(prev => ({
        ...prev,
        completedToday: [...prev.completedToday, habitId],
      }))
    }
  }

  const openHabitAdder = (habit = null) => {
    setEditingHabit(habit)
    setScreen('habit-adder')
  }

  // Check if we should show the main nav bar (not on editor screens)
  const showMainNav = screen === 'home' || screen === 'habits-page'

  return (
    <LayoutGroup>
      <div className="h-full w-full">
        {screen === 'home' && (
          <HomeScreen
            wallet={state.wallet}
            skipCost={state.skipCost}
            habits={state.habits}
            completedToday={state.completedToday}
            onEditWallet={() => setScreen('wallet-editor')}
            onEditSkipCost={() => setScreen('skip-cost-editor')}
            onEditHabits={() => openHabitAdder()}
            onEditHabit={(habit) => openHabitAdder(habit)}
            onMarkDone={markHabitDone}
            onGoToHabits={() => setScreen('habits-page')}
          />
        )}
        {screen === 'habits-page' && (
          <HabitsScreen
            habits={state.habits}
            completedToday={state.completedToday}
            onAddHabit={() => {
              setEditingHabit(null)
              setPreviousScreen('habits-page')
              setScreen('habit-adder')
            }}
            onEditHabit={(habit) => {
              setEditingHabit(habit)
              setPreviousScreen('habits-page')
              setScreen('habit-adder')
            }}
            onDeleteHabit={deleteHabit}
            onMarkDone={markHabitDone}
            onBack={() => setScreen('home')}
          />
        )}
      {screen === 'habit-adder' && (
        <EditHabitScreen
          habit={editingHabit}
          onSave={(habit) => {
            if (editingHabit) {
              updateHabit(habit)
            } else {
              addHabit(habit)
            }
            setEditingHabit(null)
            setScreen(previousScreen)
            setPreviousScreen('home')
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
      {screen === 'skip-cost-editor' && (
        <EditSkipCostScreen
          skipCost={state.skipCost}
          onSave={(amount) => {
            updateSkipCost(amount)
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
                onClick={() => setScreen('home')}
                className="p-2"
              >
                <svg className={`w-6 h-6 ${screen === 'home' ? 'text-gray-900' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              {/* Heart */}
              <button 
                onClick={() => setScreen('habits-page')}
                className="p-2"
              >
                <svg className={`w-6 h-6 ${screen === 'habits-page' ? 'text-gray-900' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
      </div>
    </LayoutGroup>
  )
}

export default App
