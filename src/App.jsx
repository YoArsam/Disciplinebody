import { useState, useEffect } from 'react'
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
  const [habitsTransition, setHabitsTransition] = useState(null) // 'expanding' | 'collapsing' | null

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

  // Handle expanding to habits page
  const goToHabits = () => {
    setHabitsTransition('expanding')
    setTimeout(() => {
      setScreen('habits-page')
      setHabitsTransition(null)
    }, 350)
  }

  // Handle collapsing back to home
  const goBackFromHabits = () => {
    setHabitsTransition('collapsing')
    setTimeout(() => {
      setScreen('home')
      setHabitsTransition(null)
    }, 350)
  }

  return (
    <div className="h-full w-full">
      {(screen === 'home' || habitsTransition) && (
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
          onGoToHabits={goToHabits}
          habitsTransition={habitsTransition}
        />
      )}
      {screen === 'habits-page' && !habitsTransition && (
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
          onBack={goBackFromHabits}
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
    </div>
  )
}

export default App
