import { useState, useEffect, useRef } from 'react'

function Home({ 
  wallet, 
  skipCost, 
  habits, 
  completedToday, 
  habitsExpanded,
  onEditWallet, 
  onEditSkipCost, 
  onAddHabit, 
  onEditHabit, 
  onMarkDone,
  onToggleHabits 
}) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const widgetRef = useRef(null)
  const [widgetStyle, setWidgetStyle] = useState({ transform: 'translateY(0)', height: 'auto' })

  // Warm up CSS transitions on mount
  useEffect(() => {
    setTimeout(() => {
      setWidgetStyle({})
    }, 10)
  }, [])

  // Calculate expanded position - only use transform and height (animatable)
  useEffect(() => {
    if (habitsExpanded && widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect()
      const safeTop = Math.max(16, parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0'))
      const navHeight = 80
      
      const moveUp = rect.top - safeTop
      const newHeight = window.innerHeight - safeTop - navHeight
      
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

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
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
          className="bg-gray-700 text-white text-sm font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-transform"
        >
          ${skipCost.toFixed(1)}
        </button>
      </div>

      {/* Balance Card - Full Width, Bigger */}
      <button 
        onClick={onEditWallet}
        className="flex-shrink-0 bg-white rounded-2xl p-5 shadow-sm relative active:scale-[0.98] transition-transform text-left mb-4"
      >
        <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span className="text-gray-500 text-sm font-medium">Balance</span>
        </div>
        <span className="text-5xl font-black text-gray-900 block text-center">${wallet.toFixed(0)}</span>
      </button>

      {/* Today's Habits Card */}
      <div 
        ref={widgetRef}
        className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex flex-col min-h-0 cursor-pointer habits-widget"
        style={widgetStyle}
        onClick={onToggleHabits}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0 w-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            habits.map((habit, index) => {
              const isDone = isHabitDone(habit)
              const isFirst = index === 0
              
              return (
                <div
                  key={habit.id}
                  className={`w-full p-4 rounded-2xl transition-all flex items-center justify-between ${
                    isFirst && !isDone
                      ? 'bg-gray-100'
                      : 'bg-gray-50'
                  } ${isDone ? 'opacity-50' : ''}`}
                >
                  {/* Habit Info */}
                  <div className="flex-1 min-w-0">
                    <span className={`font-semibold text-lg block truncate ${
                      isFirst && !isDone ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {habit.name}
                    </span>
                    <span className={`text-sm ${
                      isFirst && !isDone ? 'text-gray-500' : 'text-gray-300'
                    }`}>
                      {formatTimeRange(habit)}
                    </span>
                  </div>
                  
                  {/* Done Button */}
                  {isDone ? (
                    <span className="text-gray-300 text-lg font-medium ml-4">Done</span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onMarkDone(habit.id)
                      }}
                      className={`ml-4 text-lg font-medium transition-colors ${
                        isFirst ? 'text-gray-600' : 'text-gray-300'
                      } active:scale-95`}
                    >
                      Done
                    </button>
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
