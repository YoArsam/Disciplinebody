import { useState, useEffect } from 'react'

function Home({ 
  wallet, 
  skipCost, 
  habits, 
  completedToday, 
  onEditWallet, 
  onEditSkipCost, 
  onEditHabits, 
  onEditHabit, 
  onMarkDone,
  onGoToHabits 
}) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedHabitIndex, setSelectedHabitIndex] = useState(0)

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const formatTimeRange = (habit) => {
    if (habit.allDay) return 'Free Timing'
    const format = (t) => {
      const [h, m] = t.split(':').map(Number)
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }
    return `${format(habit.startTime)}-${format(habit.endTime)}`
  }

  const getTimeRemaining = (habit) => {
    if (habit.allDay) return null
    const [endHour, endMin] = habit.endTime.split(':').map(Number)
    const now = currentTime
    const endDate = new Date(now)
    endDate.setHours(endHour, endMin, 0, 0)
    
    const diff = endDate - now
    if (diff <= 0) return null
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m Left`
  }

  const isHabitDone = (habit) => completedToday.includes(habit.id)

  // Get first incomplete habit for Done button
  const firstIncompleteHabit = habits.find(h => !completedToday.includes(h.id))

  return (
    <div className="h-full flex flex-col bg-gray-200 px-4 pt-4 pb-20">
      {/* Profile Icon */}
      <div className="flex-shrink-0 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      {/* Balance & Cost Cards - Side by Side */}
      <div className="flex gap-3 flex-shrink-0 mb-4">
        {/* Balance Card */}
        <button 
          onClick={onEditWallet}
          className="flex-1 bg-white rounded-2xl p-4 h-36 shadow-sm relative active:scale-[0.98] transition-transform text-left flex flex-col justify-between"
        >
          <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <span className="text-gray-800 font-semibold text-base block text-left">Balance</span>
            <p className="text-gray-400 text-xs text-left">In Total</p>
          </div>
          <span className="text-4xl font-black text-gray-900 block text-left">${wallet.toFixed(0)}</span>
        </button>

        {/* Cost Card */}
        <button 
          onClick={onEditSkipCost}
          className="flex-1 bg-white rounded-2xl p-4 h-36 shadow-sm relative active:scale-[0.98] transition-transform text-left flex flex-col justify-between"
        >
          <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <span className="text-gray-800 font-semibold text-base block text-left">Cost</span>
            <p className="text-gray-400 text-xs text-left">Per Skip</p>
          </div>
          <span className="text-4xl font-black text-gray-900 block text-left">${skipCost.toFixed(1)}</span>
        </button>
      </div>

      {/* Today's Habits Card - Clickable to open habits page */}
      <button 
        onClick={onGoToHabits}
        className="flex-1 bg-white rounded-2xl p-4 shadow-sm flex flex-col min-h-0 text-left active:scale-[0.99] transition-transform"
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
          <div className="w-11 h-11 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>

        {/* Habits List */}
        <div className="flex-1 flex flex-col min-h-0 w-full">
          {habits.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center w-full">
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
            </div>
          ) : (
            habits.map((habit, index) => {
              const isDone = isHabitDone(habit)
              const timeLeft = getTimeRemaining(habit)
              const isFirst = index === 0
              
              return (
                <div
                  key={habit.id}
                  className={`w-full text-left p-4 rounded-2xl transition-all ${
                    isFirst && !isDone
                      ? 'bg-gray-100'
                      : 'bg-gray-50'
                  } ${isDone ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`font-semibold text-lg block ${
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
                    {timeLeft && !isDone && (
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        isFirst 
                          ? 'bg-gray-300 text-gray-700' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {timeLeft}
                      </span>
                    )}
                    {isDone && (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </button>

      {/* Done Button */}
      {firstIncompleteHabit && (
        <div className="flex-shrink-0 mt-4">
          <button
            onClick={() => onMarkDone(firstIncompleteHabit.id)}
            className="w-full bg-white rounded-2xl py-5 shadow-sm active:scale-[0.98] transition-transform"
          >
            <span className="text-4xl font-light text-gray-900">Done</span>
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto flex justify-around items-center">
          {/* Home */}
          <button className="p-2">
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          {/* Heart */}
          <button 
            onClick={onGoToHabits}
            className="p-2"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
    </div>
  )
}

export default Home
