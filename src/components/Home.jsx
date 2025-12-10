import { useState, useEffect, useRef } from 'react'

// SVG icons for progress messages
const ProgressIcons = {
  trophy: (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  fire: (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  bolt: (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  sparkle: (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  sun: (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  moon: (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
}

function getProgressMessage(habits, completedToday, paidToday, habitHistory) {
  const totalHabits = habits.length
  // Only count completions/payments that match actual habit IDs
  const habitIds = habits.map(h => h.id)
  const validCompletions = completedToday.filter(id => habitIds.includes(id))
  const validPayments = (paidToday || []).filter(id => habitIds.includes(id))
  const doneToday = validCompletions.length + validPayments.length
  
  // Get best per-habit streak
  const bestStreak = getBestHabitStreak(habits, habitHistory)
  
  // Priority 1: No habits yet
  if (totalHabits === 0) {
    return {
      icon: ProgressIcons.sparkle,
      headline: "Ready to start",
      subtext: "Add your first habit below"
    }
  }
  
  // Priority 2: Has a notable habit streak (2+ days)
  if (bestStreak.days >= 2) {
    return {
      icon: ProgressIcons.fire,
      headline: `${bestStreak.days}-day streak`,
      subtext: `of ${bestStreak.habitName}`
    }
  }
  
  // Priority 3: All done today
  if (doneToday > 0 && doneToday >= totalHabits) {
    return {
      icon: ProgressIcons.check,
      headline: "Perfect day!",
      subtext: "You crushed all your habits"
    }
  }
  
  // Priority 4: Some done
  if (doneToday > 0) {
    return {
      icon: ProgressIcons.bolt,
      headline: `${doneToday} of ${totalHabits} done`,
      subtext: "Keep going, almost there"
    }
  }
  
  // Priority 5: Has habits, none done yet - time-based greeting
  const hour = new Date().getHours()
  if (hour < 12) {
    return {
      icon: ProgressIcons.sun,
      headline: "Good morning!",
      subtext: `${totalHabits} habit${totalHabits > 1 ? 's' : ''} to complete today`
    }
  } else if (hour < 17) {
    return {
      icon: ProgressIcons.sun,
      headline: "Afternoon check-in",
      subtext: `${totalHabits} habit${totalHabits > 1 ? 's' : ''} waiting for you`
    }
  } else {
    return {
      icon: ProgressIcons.moon,
      headline: "Evening push",
      subtext: `${totalHabits} habit${totalHabits > 1 ? 's' : ''} left today`
    }
  }
}

// Calculate streak for a single habit from its completion history
function calculateHabitStreak(dates) {
  if (!dates || dates.length === 0) return 0
  
  // Sort dates descending (most recent first)
  const sortedDates = [...dates].sort().reverse()
  
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  // Streak must include today or yesterday to be "active"
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0
  }
  
  let streak = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i - 1])
    const prev = new Date(sortedDates[i])
    const diffDays = (current - prev) / 86400000
    
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

// Find the best habit streak to display
function getBestHabitStreak(habits, habitHistory) {
  let bestStreak = { habitName: '', days: 0 }
  
  for (const habit of habits) {
    const dates = habitHistory[habit.id] || []
    const streak = calculateHabitStreak(dates)
    
    if (streak > bestStreak.days) {
      bestStreak = { habitName: habit.name, days: streak }
    }
  }
  
  return bestStreak
}

function Home({ 
  wallet, 
  skipCost, 
  habits, 
  completedToday,
  paidToday,
  currentStreak,
  longestStreak,
  habitHistory,
  habitsExpanded,
  onEditSkipCost, 
  onAddHabit, 
  onEditHabit, 
  onMarkDone,
  onToggleHabits 
}) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const widgetRef = useRef(null)
  const [widgetStyle, setWidgetStyle] = useState({})

  // Warm up CSS transitions on mount by doing a tiny invisible transition
  useEffect(() => {
    // Start with a tiny transform
    setWidgetStyle({ transform: 'translateY(0.1px)' })
    
    // Then reset after transition completes - this activates the transition
    setTimeout(() => {
      setWidgetStyle({ transform: 'translateY(0)' })
    }, 50)
    
    // Clear completely
    setTimeout(() => {
      setWidgetStyle({})
    }, 500)
  }, [])

  // Calculate expanded position - only use transform and height (animatable)
  useEffect(() => {
    if (habitsExpanded && widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect()
      const navHeight = 80
      
      // Slide up to cover profile/cost buttons (start from top of screen)
      const moveUp = rect.top
      const newHeight = window.innerHeight - navHeight
      
      // First extend height, then move up
      setWidgetStyle({
        height: `${newHeight}px`,
        marginBottom: `-${moveUp}px`,
      })
      
      setTimeout(() => {
        setWidgetStyle({
          transform: `translateY(-${moveUp}px)`,
          height: `${newHeight}px`,
          marginBottom: `-${moveUp}px`,
        })
      }, 50)
    } else {
      setWidgetStyle({})
    }
  }, [habitsExpanded])

  // Update time every minute for countdown timers
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000) // every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatTimeRange = (habit) => {
    if (habit.allDay) return 'All Day'
    const format = (t) => {
      const [h, m] = t.split(':').map(Number)
      const ampm = h >= 12 ? 'PM' : 'AM'
      const displayHour = h % 12 || 12
      return `${displayHour} ${ampm}`
    }
    return `${format(habit.startTime)} - ${format(habit.endTime)}`
  }

  const isHabitDone = (habit) => completedToday.includes(habit.id)

  // Calculate time remaining for a habit
  const getTimeRemaining = (habit) => {
    const now = currentTime
    let endTime
    
    if (habit.allDay) {
      // End of day (midnight)
      endTime = new Date(now)
      endTime.setHours(23, 59, 59, 999)
    } else {
      // Parse habit end time
      const [endHour, endMin] = habit.endTime.split(':').map(Number)
      endTime = new Date(now)
      endTime.setHours(endHour, endMin, 0, 0)
    }
    
    const diffMs = endTime - now
    
    if (diffMs <= 0) {
      return { text: 'Check in', expired: true }
    }
    
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    
    if (hours > 0) {
      return { text: `${hours}h ${mins}m`, expired: false }
    } else {
      return { text: `${mins}m`, expired: false }
    }
  }

  return (
    <div className={`h-full flex flex-col bg-gray-200 px-4 pb-20 pt-[max(1rem,env(safe-area-inset-top))] ${habitsExpanded ? 'overflow-visible' : ''}`}>
      {/* Top Row: Profile Icon + Skip Cost Badge */}
      <div className="flex-shrink-0 mb-4 flex items-center justify-between">
        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        {/* Skip Cost Badge */}
        <button 
          onClick={onEditSkipCost}
          className="bg-gray-700 text-white text-xs font-semibold w-10 h-10 rounded-full active:scale-95 transition-transform flex items-center justify-center"
        >
          ${skipCost.toFixed(1)}
        </button>
      </div>

      {/* Your Progress Card */}
      {(() => {
        const progress = getProgressMessage(habits, completedToday, paidToday, habitHistory)
        return (
          <div className="flex-shrink-0 bg-white rounded-3xl px-6 py-6 shadow-sm mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                {progress.icon}
              </div>
              <span className="text-gray-500 text-sm font-medium">Your Progress</span>
            </div>
            <div className="text-center py-2">
              <span className="text-3xl font-bold text-gray-900 block">{progress.headline}</span>
              <span className="text-gray-500 text-sm">{progress.subtext}</span>
            </div>
          </div>
        )
      })()}

      {/* Today's Habits Card */}
      <div 
        ref={widgetRef}
        className="flex-1 bg-white rounded-3xl px-6 py-5 shadow-sm flex flex-col min-h-0 cursor-pointer habits-widget"
        style={widgetStyle}
        onClick={onToggleHabits}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-medium">Today's Habits</span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onAddHabit()
            }}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Habits List */}
        <div className="flex-1 flex flex-col gap-2 min-h-0 w-full overflow-y-auto">
          {habits.length === 0 ? (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onAddHabit()
              }}
              className="flex-1 flex flex-col items-center justify-center w-full"
            >
              {/* Plus Icon Circle */}
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4 text-center">No habits yet</p>
              <div className="bg-gray-200 rounded-full px-8 py-3">
                <span className="text-gray-600 font-medium">Add Your First Habits</span>
              </div>
            </button>
          ) : (
            // Sort habits: by time, then done habits go to bottom
            [...habits]
              .sort((a, b) => {
                const aDone = completedToday.includes(a.id)
                const bDone = completedToday.includes(b.id)
                // Done habits go to bottom
                if (aDone && !bDone) return 1
                if (!aDone && bDone) return -1
                // Sort by start time
                const aTime = a.allDay ? 0 : a.startTime
                const bTime = b.allDay ? 0 : b.startTime
                return aTime - bTime
              })
              .map((habit, index) => {
              const isDone = isHabitDone(habit)
              const isPaid = paidToday?.includes(habit.id)
              const isResolved = isDone || isPaid
              
              return (
                <div
                  key={habit.id}
                  className={`w-full p-4 rounded-2xl transition-all flex items-center justify-between ${
                    isResolved ? 'bg-gray-100' : 'bg-gray-50'
                  }`}
                >
                  {/* Habit Info - Clickable to edit */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditHabit(habit)
                    }}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className={`font-semibold text-lg block truncate ${
                      isResolved ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {habit.name}
                    </span>
                    <span className={`text-sm ${
                      isResolved ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {formatTimeRange(habit)}
                    </span>
                  </button>
                  
                  {/* Time Remaining / Done / Paid Status */}
                  {isResolved ? (
                    <span className="text-gray-300 text-lg font-medium ml-4">{isPaid ? 'Paid' : 'Done'}</span>
                  ) : (
                    (() => {
                      const timeLeft = getTimeRemaining(habit)
                      return (
                        <span className={`ml-4 text-lg font-medium ${
                          timeLeft.expired ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {timeLeft.text}
                        </span>
                      )
                    })()
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
