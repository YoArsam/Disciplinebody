import { useEffect, useState } from 'react'

function HabitAdded({ habit, onDone }) {
  const [currentSlide, setCurrentSlide] = useState(0)
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

  const getPenaltyDestinationText = () => {
    if (habit.stakeDestination === 'charity') {
      return habit.charityName ? habit.charityName : 'charity'
    }
    return 'yourself'
  }

  const slides = [
    {
      title: "Commitment Made",
      description: `You've officially committed to "${habit.name}". The hardest part is starting!`,
      icon: (
        <div className="w-16 h-16 rounded-3xl bg-orange-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      )
    },
    {
      title: "Building Streaks",
      description: "Complete your habit each day to build your streak and earn Discipline Points.",
      icon: (
        <div className="w-16 h-16 rounded-3xl bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ),
      badge: "+1 Point"
    },
    {
      title: "Stay Accountable",
      description: `If you miss a day, you'll contribute ${habit.skipCost === 0 ? 'nothing' : `$${habit.skipCost.toFixed(2)}`} to ${getPenaltyDestinationText()}.`,
      icon: (
        <div className="w-16 h-16 rounded-3xl bg-red-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      ),
      badge: habit.skipCost === 0 ? 'Free' : `-$${habit.skipCost.toFixed(2)}`
    },
    {
      title: "Daily Check-ins",
      description: "We'll check in with you tomorrow to verify your progress. Stay disciplined!",
      icon: (
        <div className="w-16 h-16 rounded-3xl bg-blue-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 2" />
          </svg>
        </div>
      )
    }
  ]

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)

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
          <h1 className="text-2xl font-extrabold text-white mb-2">Habit Added!</h1>
          <p className="text-white/80 text-lg font-semibold">"{habit.name}"</p>
        </div>

        {/* Carousel Container */}
        <div className="relative flex-1 min-h-[340px] flex flex-col">
          <div 
            className="flex-1 bg-white rounded-[2.5rem] p-8 flex flex-col items-center text-center justify-center shadow-xl animate-fadeIn relative overflow-hidden"
            onClick={nextSlide}
          >
            {/* Progress Indicators */}
            <div className="absolute top-6 flex gap-1.5">
              {slides.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-6 bg-orange-500' : 'w-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <div key={currentSlide} className="animate-fadeIn flex flex-col items-center">
              {slides[currentSlide].icon}
              <h2 className="text-gray-900 text-xl font-black mb-3">{slides[currentSlide].title}</h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                {slides[currentSlide].description}
              </p>
              {slides[currentSlide].badge && (
                <span className={`mt-6 px-4 py-1.5 rounded-full font-black text-sm ${
                  currentSlide === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {slides[currentSlide].badge}
                </span>
              )}
            </div>

            {/* Tap hint */}
            <p className="absolute bottom-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              Tap to continue
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onDone}
        className="w-full bg-white text-orange-600 font-extrabold py-4 rounded-2xl active:scale-[0.98] transition-transform mt-8"
      >
        Back to habits
      </button>
    </div>
  )
}

export default HabitAdded
