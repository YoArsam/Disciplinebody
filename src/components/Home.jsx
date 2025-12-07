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
  const [selectedHabitId, setSelectedHabitId] = useState(null)

  // Reset selected habit when habits change or completions change
  useEffect(() => {
    if (habits.length > 0 && !selectedHabitId) {
      const firstIncomplete = habits.find(h => !completedToday.includes(h.id))
      setSelectedHabitId(firstIncomplete ? firstIncomplete.id : habits[habits.length - 1].id)
    }
  }, [habits, completedToday, selectedHabitId])

  const formatTime = (timeStr) => {
    const [hour, min] = timeStr.split(':').map(Number)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${min.toString().padStart(2, '0')}${ampm}`
  }

  const getTimeRemaining = (endTime) => {
    const [endHour, endMin] = endTime.split(':').map(Number)
    const now = currentTime
    const endDate = new Date(now)
    endDate.setHours(endHour, endMin, 0, 0)
    
    const diff = endDate - now
    if (diff <= 0) return null
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`
    }
    return `${minutes}m left`
  }

  const isHabitMissed = (habit) => {
    const [endHour, endMin] = habit.endTime.split(':').map(Number)
    const now = currentTime
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const endMinutes = endHour * 60 + endMin
    
    // Check if created today after deadline
    const createdAt = new Date(habit.id)
    const isCreatedToday = createdAt.toDateString() === now.toDateString()
    const createdMinutes = createdAt.getHours() * 60 + createdAt.getMinutes()
    
    if (isCreatedToday && createdMinutes > endMinutes) return false

    return currentMinutes > endMinutes && !completedToday.includes(habit.id)
  }

  const isHabitActive = (habit) => {
    const [startHour, startMin] = habit.startTime.split(':').map(Number)
    const [endHour, endMin] = habit.endTime.split(':').map(Number)
    const now = currentTime
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes
  }

  return (
    <div className="max-w-md mx-auto p-5 space-y-5 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between py-3">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-700 tracking-tight">Wallet</h1>
        <button 
          onClick={onEditWallet}
          className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-all tap-bounce"
        >
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Wallet Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl p-8 text-center shadow-2xl shadow-emerald-500/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <p className="text-emerald-100 text-sm font-medium mb-2 uppercase tracking-wider">Balance</p>
        <span className="text-6xl font-black text-white drop-shadow-lg">${wallet.toFixed(2)}</span>
      </div>

      {/* Skip Cost Card */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Skip Cost</span>
          </div>
          <button 
            onClick={onEditSkipCost}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all tap-bounce"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
        <div className="text-center py-2">
          <span className="text-5xl font-black bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">${skipCost.toFixed(2)}</span>
          <p className="text-gray-400 text-sm mt-2">per missed habit</p>
        </div>
      </div>

      {/* Tracker Card */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Today's Habits</span>
          </div>
          <button 
            onClick={onEditHabits}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all tap-bounce"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-10">
            <button
              onClick={onEditHabits}
              aria-label="Add Habit"
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center hover:opacity-90 active:scale-95 transition"
            >
              <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <p className="text-gray-400 mb-5 font-medium">No habits yet</p>
            <button
              onClick={onEditHabits}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95"
            >
              Add Your First Habit
            </button>
          </div>
        ) : (() => {
          // Use selected habit or fallback to first incomplete
          const currentHabit = habits.find(h => h.id === selectedHabitId) || habits.find(h => !completedToday.includes(h.id)) || habits[habits.length - 1]
          
          // Get other habits for the stack (excluding current)
          const otherHabits = habits.filter(h => h.id !== currentHabit.id)
          // Sort: incomplete first, then completed
          const sortedStack = [
            ...otherHabits.filter(h => !completedToday.includes(h.id)),
            ...otherHabits.filter(h => completedToday.includes(h.id))
          ].slice(0, 2) // Show max 2 behind

          return (
            <div className="space-y-4">
              {/* Stacked habit cards: 2 behind + 1 front */}
              <div className="relative h-44">
                {sortedStack.reverse().map((habit, i) => {
                  const isDone = completedToday.includes(habit.id)
                  const isMissed = isHabitMissed(habit)
                  const baseClasses = 'absolute inset-x-0 mx-auto text-left p-5 rounded-3xl transition-all duration-300 shadow-lg cursor-pointer'
                  
                  // Determine background color
                  let bg = 'bg-blue-500' // Default (Before/Pending)
                  if (isDone) bg = 'bg-emerald-500' // Done
                  else if (isMissed) bg = 'bg-rose-500' // Missed (Not done & past time)
                  
                  // Visual positioning for background cards
                  const index = sortedStack.length - 1 - i // 0 is furthest back
                  const translateY = -12 * (index + 1)
                  const scale = 0.9 - (index * 0.04)
                  const opacity = 0.5 + (index * 0.2)

                  return (
                    <button
                      key={habit.id}
                      onClick={() => setSelectedHabitId(habit.id)}
                      style={{
                        transform: `translateY(${translateY}px) scale(${scale})`,
                        zIndex: 10 + index,
                        opacity,
                      }}
                      className={`${baseClasses} ${bg} text-white hover:opacity-80`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-lg block truncate">{habit.name}</span>
                        </div>
                        {isDone && (
                          <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}

                {currentHabit && (() => {
                  const isDone = completedToday.includes(currentHabit.id)
                  const isMissed = isHabitMissed(currentHabit)
                  
                  return (
                    <button
                      key={currentHabit.id}
                      onClick={() => onEditHabit(currentHabit)}
                      style={{
                        transform: 'translateY(0px) scale(1)',
                        zIndex: 30,
                      }}
                      className={`absolute inset-x-0 mx-auto text-left p-5 rounded-3xl transition-all duration-300 shadow-2xl text-white ${
                        isDone 
                          ? 'bg-emerald-600' 
                          : isMissed 
                            ? 'bg-rose-600' 
                            : 'bg-blue-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-lg block truncate">{currentHabit.name}</span>
                          <span className="text-sm text-white/80">
                            {currentHabit.allDay ? 'All Day' : `${formatTime(currentHabit.startTime)} - ${formatTime(currentHabit.endTime)}`}
                          </span>
                        </div>
                        <div className="text-right text-sm leading-tight">
                          {isDone ? (
                            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Done</span>
                            </div>
                          ) : isMissed ? (
                            <>
                              <div className="font-semibold">-${skipCost.toFixed(2)}</div>
                              <div className="text-xs text-white/80">missed</div>
                            </>
                          ) : (
                            !currentHabit.allDay && getTimeRemaining(currentHabit.endTime) && (
                              <div className="px-3 py-1.5 bg-white/20 text-white rounded-full text-sm font-semibold">
                                {getTimeRemaining(currentHabit.endTime)}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })()}
              </div>

              {/* Single Done button for the front habit */}
              {currentHabit && !completedToday.includes(currentHabit.id) ? (
                <button
                  onClick={() => {
                    onMarkDone(currentHabit.id)
                    // Auto-select next incomplete habit
                    const next = habits.find(h => h.id !== currentHabit.id && !completedToday.includes(h.id))
                    if (next) setSelectedHabitId(next.id)
                  }}
                  className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all active:scale-[0.98] bg-blue-600 shadow-xl hover:bg-blue-700"
                >
                  Done
                </button>
              ) : habits.length > 0 && habits.every(h => completedToday.includes(h.id)) && (
                <div className="text-center py-6 animate-float">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-3 rounded-full bg-gradient-to-tr from-yellow-300 to-orange-400 shadow-lg shadow-orange-400/30">
                    <span className="text-3xl">✨</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-700">All Done For Today!</h3>
                  <p className="text-gray-400 text-sm mt-1">Good vibes only ✌️</p>
                </div>
              )}
            </div>
          )
        })()}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 p-4 pb-6">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button className="p-3 rounded-2xl bg-violet-100 text-violet-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </button>
          <button 
            onClick={onGoToHabits}
            className="p-3 rounded-2xl text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </button>
          <button className="p-3 rounded-2xl text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
