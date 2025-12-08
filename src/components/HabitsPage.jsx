import { motion } from 'framer-motion'

export default function HabitsPage({ habits, completedToday = [], onAddHabit, onEditHabit, onDeleteHabit, onMarkDone, onBack }) {
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
    <motion.div 
      layoutId="habits-card"
      className="h-full flex flex-col bg-white px-4 pb-20 pt-[max(1rem,env(safe-area-inset-top)]]"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ originX: 0.5, originY: 0.5 }}
    >
      {/* Header - matches Home habits card header */}
      <motion.div layout="position" className="flex items-center justify-between mb-3 flex-shrink-0 w-full">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <motion.span layout="position" className="text-gray-500 text-sm font-medium">Today's Habits</motion.span>
        </div>
        <button 
          onClick={onAddHabit}
          className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </motion.div>

      {/* Habits List - same style as Home */}
      <div className="flex-1 flex flex-col gap-2 min-h-0 w-full overflow-y-auto">
        {habits.length === 0 ? (
          <button 
            onClick={onAddHabit}
            className="flex-1 flex flex-col items-center justify-center w-full"
          >
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
                <button 
                  onClick={() => onEditHabit(habit)}
                  className="flex-1 min-w-0 text-left"
                >
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
                </button>
                
                {/* Done Button */}
                {isDone ? (
                  <span className="text-gray-300 text-lg font-medium ml-4">Done</span>
                ) : (
                  <button
                    onClick={() => onMarkDone(habit.id)}
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

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-50">
        <div className="max-w-md mx-auto flex justify-center items-center gap-12">
          {/* Home */}
          <button 
            onClick={onBack}
            className="p-2"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          {/* Heart - Active */}
          <button className="p-2">
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
    </motion.div>
  )
}
