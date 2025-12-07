export default function HabitsPage({ habits, onAddHabit, onEditHabit, onDeleteHabit, onBack }) {
  const formatTimeRange = (habit) => {
    if (habit.allDay) return 'All Day'
    const format = (t) => {
      const [h, m] = t.split(':').map(Number)
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }
    return `${format(habit.startTime)}-${format(habit.endTime)}`
  }

  return (
    <div className="h-full flex flex-col bg-gray-500 px-4 pt-4 pb-20 animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between py-3 mb-4 flex-shrink-0">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center tap-bounce"
        >
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-white">My Habits</h1>
        <button 
          onClick={onAddHabit}
          className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center tap-bounce"
        >
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Habits List */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {habits.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-300 mb-3">No habits yet</p>
            <button
              onClick={onAddHabit}
              className="text-white font-medium underline"
            >
              Add Your First Habit
            </button>
          </div>
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className="bg-gray-300 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-700 text-lg">{habit.name}</h3>
                <p className="text-sm text-gray-500">{formatTimeRange(habit)}</p>
              </div>
              <button
                onClick={() => onEditHabit(habit)}
                className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center tap-bounce"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto flex justify-around items-center">
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
    </div>
  )
}
