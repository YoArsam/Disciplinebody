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

  const steps = [
    {
      title: "Goal set",
      description: `Committed to "${habit.name}"`,
      icon: (
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: 'bg-orange-100'
    },
    {
      title: "Daily action",
      description: "Build your streak",
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'bg-green-100',
      badge: "+1 point"
    },
    {
      title: "No excuses",
      description: `Stay accountable`,
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-red-100',
      badge: habit.skipCost === 0 ? 'Free' : `-$${habit.skipCost.toFixed(2)}`
    },
    {
      title: "Next check-in",
      description: "We'll check in tomorrow",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 2" />
        </svg>
      ),
      color: 'bg-blue-100'
    }
  ]

  return (
    <div className="h-full flex flex-col px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-8" style={{ backgroundColor: ORANGE }}>
      <div className="fixed top-0 left-0 right-0 z-[70]" style={{ height: 'env(safe-area-inset-top)', backgroundColor: ORANGE }} />
      
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 animate-bounce-subtle">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">You're all set!</h1>
          <p className="text-white/70 font-bold uppercase tracking-widest text-[10px]">Your journey begins now</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl flex-1 flex flex-col justify-center">
          <div className="space-y-0 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative flex gap-4 pb-8 last:pb-0">
                {/* Connecting Line */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-[1.375rem] top-10 bottom-0 w-0.5 bg-gray-100" />
                )}
                
                {/* Icon Container */}
                <div className={`w-11 h-11 rounded-2xl ${step.color} flex items-center justify-center flex-shrink-0 z-10 shadow-sm`}>
                  {step.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-gray-900 font-black text-base uppercase tracking-tight">{step.title}</h2>
                    {step.badge && (
                      <span className={`px-2 py-0.5 rounded-lg font-black text-[10px] uppercase ${
                        index === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm font-bold">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onDone}
        className="w-full bg-white text-orange-600 font-extrabold py-4 rounded-2xl active:scale-[0.98] transition-transform mt-8 shadow-lg shadow-black/5"
      >
        Let's go
      </button>
    </div>
  )
}

export default HabitAdded
