function HabitEducation({ habit, skipCost, onDone }) {
  // Safety check - if habit is null/undefined, don't render
  if (!habit) {
    return null
  }

  // Format time for display
  const formatTime = (timeStr) => {
    const [hour, min] = timeStr.split(':').map(Number)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${min.toString().padStart(2, '0')} ${ampm}`
  }

  const getCueMessage = () => {
    if (habit.allDay) {
      return "Come back to this app tomorrow"
    }
    return `Come back tomorrow after ${formatTime(habit.endTime)}`
  }

  return (
    <div className="h-full flex flex-col bg-gray-200 px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-8">
      {/* Spacer */}
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Habit Added!
        </h1>
        <p className="text-gray-500 mb-8">
          "{habit.name}"
        </p>

        {/* Cue Education Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm w-full mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-medium">Your Cue</span>
          </div>
          
          <p className="text-xl font-semibold text-gray-900 mb-2">
            {getCueMessage()}
          </p>
          <p className="text-gray-500 text-sm">
            We'll ask if you completed this habit.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-3xl p-6 shadow-sm w-full">
          <p className="text-gray-500 text-sm font-medium mb-4">How it works</p>
          
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs font-bold">✓</span>
              </div>
              <p className="text-gray-700 text-sm">
                <span className="font-medium">Say yes</span> → Your streak grows
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-bold">✗</span>
              </div>
              <p className="text-gray-700 text-sm">
                <span className="font-medium">Say no</span> → You pay ${skipCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Done Button */}
      <button
        onClick={onDone}
        className="w-full bg-gray-900 text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
      >
        Got it
      </button>
    </div>
  )
}

export default HabitEducation
