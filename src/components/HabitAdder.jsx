import { useState, useRef, useEffect } from 'react'

function HabitAdder({ habit, onSave, onDelete, onBack }) {
  const isEditing = !!habit
  const [step, setStep] = useState(1)
  const [name, setName] = useState(habit?.name || '')
  const [skipCost, setSkipCost] = useState(habit?.skipCost ?? null)
  const [daysOfWeek, setDaysOfWeek] = useState(habit?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6])
  const [stakeDestination, setStakeDestination] = useState(habit?.stakeDestination || 'charity')
  const [charityName, setCharityName] = useState(habit?.charityName || 'Feeding America')
  const [pausedUntil, setPausedUntil] = useState(habit?.pausedUntil || '')
  const [pauseDays, setPauseDays] = useState('')
  const [showPauseCustom, setShowPauseCustom] = useState(false)
  const [showIdeas, setShowIdeas] = useState(false)
  const [showDaysEditor, setShowDaysEditor] = useState(() => {
    const initial = habit?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]
    return initial.length !== 7
  })
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustomValue, setIsCustomValue] = useState(false)
  const customInputRef = useRef(null)

  const habitIdeas = [
    'Go to the gym',
    "Don't watch porn",
    'Wake up at 7:15',
    'Read 10 pages',
    'Meditate 10 min',
    'No sugar today',
  ]

  const dayLabels = [
    { key: 1, label: 'M' },
    { key: 2, label: 'T' },
    { key: 3, label: 'W' },
    { key: 4, label: 'T' },
    { key: 5, label: 'F' },
    { key: 6, label: 'S' },
    { key: 0, label: 'S' },
  ]

  const toggleDay = (dayKey) => {
    setDaysOfWeek(prev => {
      const has = prev.includes(dayKey)
      const next = has ? prev.filter(d => d !== dayKey) : [...prev, dayKey]
      return next.sort((a, b) => a - b)
    })
  }

  const formatISODate = (date) => {
    return date.toISOString().split('T')[0]
  }

  const getPauseDaysFromPausedUntil = () => {
    if (!pausedUntil) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(\`${pausedUntil}T00:00:00\`)
    if (Number.isNaN(target.getTime())) return null
    const diffMs = target.getTime() - today.getTime()
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))
    return diffDays > 0 ? diffDays : 0
  }

  const stepTitles = {
    1: 'Name your habit',
    2: 'Choose your days',
    3: 'Habit Cost',
  }

  const getCustomSkipCost = () => {
    if (!showCustomInput) return null
    const val = parseFloat(customAmount)
    if (Number.isNaN(val) || val < 0) return null
    return val
  }

  const canGoNext = () => {
    if (isEditing) {
      const computedSkipCost = skipCost !== null ? skipCost : getCustomSkipCost()
      return !!name.trim() && daysOfWeek.length > 0 && computedSkipCost !== null
    }
    if (step === 1) return !!name.trim()
    if (step === 2) return daysOfWeek.length > 0
    if (step === 3) return skipCost !== null || getCustomSkipCost() !== null
    return false
  }

  const goNext = () => {
    if (!canGoNext()) return
    setStep(prev => Math.min(3, prev + 1))
  }

  const goBackStep = () => {
    setStep(prev => Math.max(1, prev - 1))
  }

  useEffect(() => {
    if (showCustomInput && customInputRef.current) {
      setTimeout(() => {
        customInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [showCustomInput])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const computedSkipCost = skipCost !== null ? skipCost : getCustomSkipCost()
    if (computedSkipCost === null) return
    onSave({
      ...(habit || {}),
      name: name.trim(),
      skipCost: computedSkipCost,
      daysOfWeek: daysOfWeek.length ? daysOfWeek : [0, 1, 2, 3, 4, 5, 6],
      stakeDestination: 'charity',
      charityName: charityName,
      pausedUntil: pausedUntil || '',
    })
  }

  return (
    <div className="h-full flex flex-col bg-[#fcfcfc] px-4 pb-0 animate-slideUp pt-[max(1rem,env(safe-area-inset-top))] relative">
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-2 flex-shrink-0">
        <button 
          onClick={step === 1 ? onBack : goBackStep}
          className="w-11 h-11 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm active:scale-95 transition-all duration-200"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            {isEditing ? 'Edit habit' : stepTitles[step]}
          </h1>
          {!isEditing && (
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={\`h-1.5 rounded-full transition-all duration-300 \${
                    s === step ? 'w-10 bg-orange-500' : s < step ? 'w-4 bg-orange-200' : 'w-4 bg-gray-100'
                  }\`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="w-11"></div>
      </div>

      {/* Scrollable Form Content */}
      <div className={\`flex-1 overflow-y-auto min-h-0 \${onDelete ? 'pb-48' : 'pb-36'} no-scrollbar\`}>
        <form id="habit-form" onSubmit={handleSubmit} className="space-y-4 py-2">

          {(isEditing || step === 1) && (
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm shadow-gray-100/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-gray-900 text-xl font-extrabold">Habit Name</h2>
                  <p className="text-gray-400 text-sm font-medium">What will you improve?</p>
                </div>
              </div>

              <div className="relative group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Wake up, Exercise, Read..."
                  className="w-full bg-gray-50/50 text-gray-900 placeholder-gray-400 rounded-2xl p-5 text-lg font-bold border-2 border-transparent focus:border-orange-500/20 focus:bg-white focus:outline-none transition-all duration-200"
                />
              </div>

              {!isEditing && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowIdeas((v) => !v)}
                    className="flex items-center gap-2 px-1 text-orange-600/70 text-sm font-bold uppercase tracking-wider hover:text-orange-600 transition-colors"
                  >
                    <span>Need some inspiration?</span>
                    <svg
                      className={\`w-4 h-4 transition-transform duration-300 \${showIdeas ? 'rotate-180' : ''}\`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showIdeas && (
                    <div className="mt-4 flex flex-wrap gap-2 animate-fadeIn">
                      {habitIdeas.map((idea) => (
                        <button
                          key={idea}
                          type="button"
                          onClick={() => setName(idea)}
                          className="px-5 py-2.5 rounded-xl bg-orange-50/50 text-orange-700 border border-orange-100 text-sm font-bold active:scale-95 hover:bg-orange-50 transition-all"
                        >
                          {idea}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {(isEditing || step === 2) && (
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm shadow-gray-100/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-gray-900 text-xl font-extrabold">Choose your days</h2>
                  <p className="text-gray-400 text-sm font-medium">When will you do this?</p>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {dayLabels.map((d) => {
                  const selected = daysOfWeek.includes(d.key)
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => toggleDay(d.key)}
                      className={\`h-12 rounded-2xl font-black text-sm transition-all duration-200 active:scale-90 \${
                        selected
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }\`}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>

              {daysOfWeek.length === 0 && (
                <div className="mt-4 py-2 px-4 rounded-xl bg-orange-50 border border-orange-100 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <p className="text-orange-700 text-xs font-bold">Select at least one day</p>
                </div>
              )}
            </div>
          )}

          {(isEditing || step === 3) && (
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm shadow-gray-100/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-gray-900 text-xl font-extrabold text-left">Habit Stakes</h2>
                  <p className="text-gray-400 text-sm font-medium text-left">Cost of missing a day</p>
                </div>
              </div>

              <div className="space-y-3">
                {!showCustomInput ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid grid-cols-2 gap-3 col-span-2">
                      {[0, 1, 2, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setSkipCost(val)
                            setIsCustomValue(false)
                          }}
                          className={\`h-16 rounded-[1.5rem] font-black text-lg transition-all duration-200 active:scale-95 border-2 \${
                            skipCost === val && !isCustomValue
                              ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                              : 'bg-gray-50/50 border-transparent text-gray-700 hover:bg-gray-100'
                          }\`}
                        >
                          {val === 0 ? 'Free' : \`$\${val}\`}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className={\`h-16 col-span-2 rounded-[1.5rem] font-black text-lg transition-all duration-200 active:scale-95 border-2 \${
                        isCustomValue
                          ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                          : 'bg-gray-50/50 border-transparent text-gray-700 hover:bg-gray-100'
                      }\`}
                    >
                      {isCustomValue && skipCost !== null ? \`$\${skipCost}\` : 'Custom Amount'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-black">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={customAmount}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '')
                            const parts = val.split('.')
                            if (parts.length > 2) return
                            setCustomAmount(val)
                          }}
                          placeholder="10.00"
                          autoFocus
                          className="w-full pl-10 pr-4 h-16 rounded-[1.5rem] bg-gray-50 border-2 border-orange-500/20 text-gray-900 text-xl font-black focus:outline-none focus:bg-white transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const val = parseFloat(customAmount)
                          if (!isNaN(val) && val >= 1.00) {
                            setSkipCost(val)
                            setIsCustomValue(true)
                            setShowCustomInput(false)
                          }
                        }}
                        disabled={parseFloat(customAmount) < 1.00 || isNaN(parseFloat(customAmount))}
                        className={\`px-8 h-16 font-black rounded-[1.5rem] active:scale-95 transition-all \${
                          parseFloat(customAmount) >= 1.00 
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                            : 'bg-gray-100 text-gray-300'
                        }\`}
                      >
                        Set
                      </button>
                    </div>
                  </div>
                )}

                {skipCost === null && !showCustomInput && (
                  <div className="py-4 px-6 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                    <p className="text-blue-700 text-sm font-bold">
                      This is the amount you will give to charity if you miss a habit
                    </p>
                  </div>
                )}

                {(skipCost !== null || showCustomInput) && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2rem] p-8 text-center shadow-xl shadow-blue-100 animate-fadeIn">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h3 className="text-white/80 text-sm font-black uppercase tracking-[0.2em] mb-2">Charity Impact</h3>
                      <p className="text-white/60 text-2xl font-black leading-tight text-center">
                        You'll give <span className="text-white text-3xl font-black">${(skipCost !== null ? skipCost : (parseFloat(customAmount) || 0)).toFixed(2)}</span> to charity for every missed day
                      </p>
                      <p className="mt-4 text-white/50 text-sm font-bold text-center">
                        We'll send you an email of the impact you've made
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {habit && (
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm shadow-gray-100/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-gray-900 text-xl font-extrabold text-left">Pause Habit</h2>
                  <p className="text-gray-400 text-sm font-medium text-left">Take a break without penalties</p>
                </div>
              </div>

              {pausedUntil ? (
                <div className="space-y-4">
                  <div className="py-4 px-6 rounded-2xl bg-orange-50 border border-orange-100 text-center">
                    <p className="text-orange-700 text-sm font-bold">
                      Paused until {pausedUntil}
                      {getPauseDaysFromPausedUntil() !== null ? \` (\${getPauseDaysFromPausedUntil()} days left)\` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPausedUntil('')
                      setPauseDays('')
                      setShowPauseCustom(false)
                    }}
                    className="w-full py-4 rounded-2xl font-bold text-gray-700 bg-gray-50 border border-gray-100 active:scale-95 transition-all"
                  >
                    Resume Habit Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (pauseDays === '1' && !showPauseCustom) {
                          setPauseDays('')
                          return
                        }
                        setPauseDays('1')
                        setShowPauseCustom(false)
                      }}
                      className={\`h-14 flex-1 rounded-2xl font-bold text-sm border-2 transition-all active:scale-95 \${
                        pauseDays === '1' && !showPauseCustom
                          ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100'
                          : 'bg-gray-50/50 border-transparent text-gray-700'
                      }\`}
                    >
                      1 Day
                    </button>

                    {!showPauseCustom ? (
                      <button
                        type="button"
                        onClick={() => setShowPauseCustom(true)}
                        className="h-14 flex-1 rounded-2xl font-bold text-sm bg-gray-50/50 text-gray-700 border-2 border-transparent active:scale-95 transition-all"
                      >
                        Custom
                      </button>
                    ) : (
                      <div className="relative flex-[2] min-w-0">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={pauseDays}
                          onChange={(e) => setPauseDays(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="How many days?"
                          autoFocus
                          className="h-14 w-full bg-gray-50 text-gray-900 placeholder-gray-400 rounded-2xl pl-5 pr-12 text-sm font-bold border-2 border-orange-500/20 focus:outline-none focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowPauseCustom(false)
                            setPauseDays('')
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center active:scale-90 transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const n = parseInt(pauseDays, 10)
                        if (!n || n <= 0) return
                        const d = new Date()
                        d.setDate(d.getDate() + n)
                        setPausedUntil(formatISODate(d))
                      }}
                      disabled={!pauseDays || parseInt(pauseDays, 10) <= 0}
                      className={\`h-14 px-6 rounded-2xl font-bold text-sm active:scale-95 transition-all \${
                        !pauseDays || parseInt(pauseDays, 10) <= 0
                          ? 'bg-gray-100 text-gray-300'
                          : 'bg-orange-500 text-white shadow-lg shadow-orange-100'
                      }\`}
                    >
                      Pause
                    </button>
                  </div>
                  <p className="text-gray-400 text-xs font-medium text-center italic">
                    Habit is hidden and no penalties apply while paused
                  </p>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-6 pb-[max(2rem,env(safe-area-inset-bottom))] z-50">
        <div className="max-w-md mx-auto">
          {!isEditing && step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext()}
              className={\`w-full py-5 rounded-[2rem] font-black text-xl shadow-2xl transition-all duration-300 active:scale-[0.98] \${
                canGoNext() 
                  ? 'bg-orange-500 text-white shadow-orange-200' 
                  : 'bg-gray-100 text-gray-300 shadow-none'
              }\`}
            >
              Continue
            </button>
          ) : (
            <div className="space-y-4">
              <button
                type="submit"
                form="habit-form"
                disabled={!canGoNext()}
                className={\`w-full py-5 rounded-[2rem] font-black text-xl shadow-2xl transition-all duration-300 active:scale-[0.98] \${
                  canGoNext() 
                    ? 'bg-orange-500 text-white shadow-orange-200' 
                    : 'bg-gray-100 text-gray-300 shadow-none'
                }\`}
              >
                {habit ? 'Save Changes' : 'Start My Journey'}
              </button>
              
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="w-full py-3 text-rose-500 font-bold text-sm uppercase tracking-widest hover:text-rose-600 transition-colors"
                >
                  Delete Habit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HabitAdder
