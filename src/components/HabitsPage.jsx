export default function HabitsPage({
  embedded,
  habits,
  completedToday = [],
  paidToday = [],
  habitHistory = {},
  isClosing,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  onMarkDone,
  onBack,
}) {
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

  const isHabitPaid = (habit) => (paidToday || []).includes(habit.id)

  const animationClass = isClosing ? 'animate-sheetDown' : 'animate-sheetUp'

  const containerClassName = embedded
    ? 'h-full flex flex-col bg-[#fcfcfc] px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]'
    : `fixed inset-0 bg-[#fcfcfc] flex flex-col px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] z-40 ${animationClass}`

  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0 w-full">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <div className="text-gray-900 font-bold text-lg">Habits</div>
            <div className="text-gray-500 text-sm">Last 4 weeks</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddHabit}
          className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0 w-full overflow-y-auto">
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
          habits.map((habit) => {
            const isDone = isHabitDone(habit)
            const isPaid = isHabitPaid(habit)
            const isResolved = isDone || isPaid

            const habitDates = habitHistory[habit.id] || []
            const todayIso = new Date().toISOString().split('T')[0]
            const last28Days = Array.from({ length: 28 }, (_, i) => {
              const date = new Date()
              date.setDate(date.getDate() - (27 - i))
              return date.toISOString().split('T')[0]
            })

            return (
              <div
                key={habit.id}
                onClick={() => onEditHabit(habit)}
                className={`w-full p-4 rounded-2xl transition-all border border-gray-200 cursor-pointer ${
                  isResolved ? 'bg-white/50' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-lg truncate ${isResolved ? 'text-gray-300' : 'text-gray-900'}`}>
                      {habit.name}
                    </div>
                    <div className={`text-sm ${isResolved ? 'text-gray-300' : 'text-gray-500'}`}>
                      {formatTimeRange(habit)}
                    </div>
                  </div>
                  {isResolved ? (
                    <span className="text-gray-300 text-lg font-medium ml-4">{isPaid ? 'Paid' : 'Done'}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onMarkDone(habit.id)
                      }}
                      className="ml-4 text-lg font-medium text-gray-500 active:scale-95"
                    >
                      Done
                    </button>
                  )}
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-7 gap-1">
                    {last28Days.map((date) => {
                      const isCompleted = habitDates.includes(date)
                      const isToday = date === todayIso
                      return (
                        <div
                          key={date}
                          className={`aspect-square rounded-sm ${
                            isCompleted
                              ? 'bg-green-500'
                              : isToday
                                ? 'bg-orange-200'
                                : 'bg-gray-100'
                          }`}
                          title={date}
                        />
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">Last 4 weeks</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
