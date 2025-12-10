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
      return "Come back tomorrow"
    }
    return `Come back after ${formatTime(habit.endTime)}`
  }

  return (
    <div className="h-full flex flex-col bg-[#fcfcfc] px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-8">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-8">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Habit Added!
        </h1>
        <p className="text-gray-500">
          "{habit.name}"
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* When to check in */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-gray-900 font-semibold">When to check in</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {getCueMessage()}. We'll ask if you completed this habit.
          </p>
        </div>

        {/* What happens */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-gray-900 font-semibold">What happens</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">
                <span className="font-medium text-gray-900">Done it?</span> Your streak grows
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">
                <span className="font-medium text-gray-900">Missed it?</span> Pay ${skipCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Done Button */}
      <button
        onClick={onDone}
        className="w-full bg-orange-500 text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform mt-6"
      >
        Got it
      </button>
    </div>
  )
}

export default HabitEducation
