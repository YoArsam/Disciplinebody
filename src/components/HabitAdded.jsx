import { useEffect } from 'react'

function HabitAdded({ habit, onDone }) {
  if (!habit) return null

  const ORANGE = '#f97316'

  useEffect(() => {
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    const metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')

    const previousTheme = metaTheme?.getAttribute('content')
    const previousStatusBar = metaStatusBar?.getAttribute('content')

    if (metaTheme) metaTheme.setAttribute('content', ORANGE)
    if (metaStatusBar) metaStatusBar.setAttribute('content', 'black-translucent')

    const prevHtmlBg = document.documentElement.style.backgroundColor
    const prevBodyBg = document.body.style.backgroundColor
    document.documentElement.style.backgroundColor = ORANGE
    document.body.style.backgroundColor = ORANGE

    return () => {
      if (metaTheme && previousTheme) metaTheme.setAttribute('content', previousTheme)
      if (metaStatusBar && previousStatusBar) metaStatusBar.setAttribute('content', previousStatusBar)
      document.documentElement.style.backgroundColor = prevHtmlBg
      document.body.style.backgroundColor = prevBodyBg
    }
  }, [])

  const getTomorrowTimeText = () => {
    return 'tomorrow'
  }

  const getPenaltyDestinationText = () => {
    if (habit.stakeDestination === 'charity') {
      return habit.charityName ? habit.charityName : 'charity'
    }
    return 'yourself'
  }

  return (
    <div className="h-full flex flex-col px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-8" style={{ backgroundColor: ORANGE }}>
      <div className="fixed top-0 left-0 right-0 z-[70]" style={{ height: 'env(safe-area-inset-top)', backgroundColor: ORANGE }} />
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
          <div className="bg-white rounded-3xl p-6 shadow-sm">
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
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-lg">If you don't</p>
                    <p className="text-gray-500 text-sm">
                      You'll pay {habit.skipCost === 0 ? 'nothing' : `$${habit.skipCost.toFixed(2)}`}
                    </p>
                    <p className="text-gray-500 text-sm">to {getPenaltyDestinationText()}</p>
                  </div>
                </div>
                <span className="text-blue-600 font-extrabold text-lg whitespace-nowrap">
                  {habit.skipCost === 0 ? 'Free' : `-$${habit.skipCost.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/15 rounded-3xl p-6 border border-white/10">
            <p className="text-white/80 text-sm font-bold uppercase tracking-wider mb-2">Next check-in</p>
            <p className="text-white text-2xl font-extrabold">{getTomorrowTimeText()}</p>
            <p className="text-white/80 text-sm mt-3">
              We'll check in with you tomorrow.
            </p>
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
