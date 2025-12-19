import { useEffect } from 'react'

function HabitAdded({ habit, onDone }) {
  if (!habit) return null

  useEffect(() => {
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    const metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')

    const previousTheme = metaTheme?.getAttribute('content')
    const previousStatusBar = metaStatusBar?.getAttribute('content')

    if (metaTheme) metaTheme.setAttribute('content', '#f97316')
    if (metaStatusBar) metaStatusBar.setAttribute('content', 'black-translucent')

    const prevHtmlBg = document.documentElement.style.backgroundColor
    const prevBodyBg = document.body.style.backgroundColor
    document.documentElement.style.backgroundColor = '#f97316'
    document.body.style.backgroundColor = '#f97316'

    return () => {
      if (metaTheme && previousTheme) metaTheme.setAttribute('content', previousTheme)
      if (metaStatusBar && previousStatusBar) metaStatusBar.setAttribute('content', previousStatusBar)
      document.documentElement.style.backgroundColor = prevHtmlBg
      document.body.style.backgroundColor = prevBodyBg
    }
  }, [])

  const formatTime = (timeStr) => {
    const [hour, min] = timeStr.split(':').map(Number)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${min.toString().padStart(2, '0')} ${ampm}`
  }

  const getTomorrowTimeText = () => {
    if (habit.allDay) return 'tomorrow'
    return `tomorrow after ${formatTime(habit.endTime)}`
  }

  const getPenaltyDestinationText = () => {
    if (habit.stakeDestination === 'charity') {
      return habit.charityName ? habit.charityName : 'charity'
    }
    return 'yourself'
  }

  return (
    <div className="h-full flex flex-col bg-orange-500 px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-8">
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Your habit has been added</h1>
          <p className="text-white/80 text-lg font-semibold">"{habit.name}"</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white/15 rounded-3xl p-6">
            <p className="text-white/80 text-sm font-bold uppercase tracking-wider mb-2">Next check-in</p>
            <p className="text-white text-2xl font-extrabold">{getTomorrowTimeText()}</p>
            <p className="text-white/80 text-sm mt-3">
              We'll send you a notification {getTomorrowTimeText()}.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6">
            <p className="text-orange-600 text-sm font-bold uppercase tracking-wider mb-4">How it works</p>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-lg">If you do it</p>
                    <p className="text-gray-500 text-sm">You get 1 point</p>
                  </div>
                </div>
                <span className="text-green-600 font-extrabold text-lg">+1</span>
              </div>

              <div className="h-px bg-gray-100"></div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-lg">If you don't</p>
                    <p className="text-gray-500 text-sm">
                      You'll pay {habit.skipCost === 0 ? 'nothing' : `$${habit.skipCost.toFixed(2)}`} to {getPenaltyDestinationText()}
                    </p>
                  </div>
                </div>
                <span className="text-red-500 font-extrabold text-lg">
                  {habit.skipCost === 0 ? 'Free' : `-$${habit.skipCost.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onDone}
        className="w-full bg-white text-orange-600 font-extrabold py-4 rounded-2xl active:scale-[0.98] transition-transform"
      >
        Back to habits
      </button>
    </div>
  )
}

export default HabitAdded
