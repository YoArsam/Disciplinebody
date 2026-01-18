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

  const summaryLabels = {
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
    0: 'Sun'
  }

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
    const target = new Date(`${pausedUntil}T00:00:00`)
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
      <div className="flex items-center justify-between py-3 mb-2 flex-shrink-0">
        <button 
          onClick={step === 1 ? onBack : goBackStep}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center tap-bounce"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            {isEditing ? 'Edit habit' : stepTitles[step]}
          </h1>
          {!isEditing && (
            <div className="flex items-center gap-1.5 mt-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s === step ? 'w-8 bg-orange-500' : s < step ? 'w-4 bg-orange-200' : 'w-4 bg-gray-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="w-10"></div>
      </div>

      {/* Scrollable Form Content */}
      <div className={`flex-1 overflow-y-auto min-h-0 ${onDelete ? 'pb-48' : 'pb-36'}`}>
        <form id="habit-form" onSubmit={handleSubmit} className="space-y-3">

          {(isEditing || step === 1) && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1 pt-[2px]">
                  <span className="text-gray-900 text-xl font-bold">Habit Name</span>
                </div>
              </div>

              <div className="mt-4 mb-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Wake up, Exercise, Read..."
                  className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 rounded-xl p-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              {!isEditing && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowIdeas((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-transparent text-gray-400 text-sm font-medium"
                  >
                    <span>Need ideas?</span>
                    <svg
                      className={`w-5 h-5 transition-transform ${showIdeas ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showIdeas && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {habitIdeas.map((idea) => (
                        <button
                          key={idea}
                          type="button"
                          onClick={() => setName(idea)}
                          className="px-4 py-2 rounded-full bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold active:scale-95 transition-transform"
                        >
                          {idea}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!name.trim() && (
                <p className="text-orange-500 text-xs mt-3 text-center font-medium">
                  Enter a habit name to continue
                </p>
              )}
            </div>
          )}

          {(isEditing || step === 2) && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 pt-[2px]">
                  <span className="text-gray-900 text-xl font-bold">When will you do it?</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="grid grid-cols-7 gap-2">
                  {dayLabels.map((d) => {
                    const selected = daysOfWeek.includes(d.key)
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => toggleDay(d.key)}
                        className={`h-10 rounded-xl font-bold text-sm border transition-all active:scale-95 ${
                          selected
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        {d.label}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 flex justify-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                    {daysOfWeek.length === 7 
                      ? 'Every day' 
                      : daysOfWeek.length === 0 
                        ? 'No days selected' 
                        : daysOfWeek.map(key => summaryLabels[key]).join(' • ')}
                  </p>
                </div>

                {daysOfWeek.length === 0 && (
                  <p className="text-orange-500 text-xs mt-3 text-center font-medium">
                    Select at least one day
                  </p>
                )}
              </div>
            </div>
          )}

          {(isEditing || step === 3) && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 pt-[2px]">
                  <span className="text-gray-900 text-xl font-bold">What's the cost of skipping?</span>
                </div>
              </div>

              <div className="mt-4">
                {!showCustomInput ? (
                  <>
                    <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                      {[0, 1, 2, 3].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setSkipCost(val)
                            setIsCustomValue(false)
                          }}
                          className={`h-12 rounded-xl font-bold text-sm transition-all active:scale-95 border ${
                            skipCost === val && !isCustomValue
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {val === 0 ? 'Free' : `$${val}`}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[5, 10].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setSkipCost(val)
                            setIsCustomValue(false)
                          }}
                          className={`h-12 rounded-xl font-bold text-sm transition-all active:scale-95 border ${
                            skipCost === val && !isCustomValue
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          ${val}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomInput(true)
                          if (isCustomValue && skipCost !== null) {
                            setCustomAmount(skipCost.toString())
                          }
                        }}
                        className={`h-12 rounded-xl font-bold text-sm transition-all active:scale-95 border ${
                          isCustomValue
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {isCustomValue && skipCost !== null ? `$${skipCost}` : 'Custom'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
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
                          placeholder="1.00"
                          autoFocus
                          className="w-full pl-7 pr-3 h-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                        className={`px-4 h-12 font-semibold rounded-xl active:scale-95 transition-transform ${
                          parseFloat(customAmount) >= 1.00 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        Set
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCustomInput(false)}
                        className="px-3 h-12 bg-gray-100 text-gray-600 font-semibold rounded-xl active:scale-95 transition-transform"
                      >
                        ✕
                      </button>
                    </div>
                    {customAmount && parseFloat(customAmount) > 0 && parseFloat(customAmount) < 1.00 && (
                      <p className="text-orange-500 text-[10px] font-bold ml-2">Minimum contribution is $1.00</p>
                    )}
                  </div>
                )}

                {skipCost === null && !showCustomInput && (
                  <p className="text-orange-500 text-xs mt-3 text-center font-medium">
                    This is the amount you will give to charity if you miss a habit
                  </p>
                )}

                {/* Charity Emphasis Box */}
                {!isEditing && (skipCost !== null || showCustomInput) && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center animate-fadeIn">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-xl font-bold leading-tight px-2 text-center">
                        You will give <span className="text-gray-900 font-black">${(skipCost !== null ? skipCost : (parseFloat(customAmount) || 0)).toFixed(2)}</span> to charity if you skip this habit
                      </p>
                      <p className="mt-4 text-blue-300 text-[10px] font-bold text-center">
                        We'll send you an email of the impact you've made
                      </p>
                    </div>
                  </div>
                )}

                {habit && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pause</span>
                    </div>

                    {pausedUntil ? (
                      <>
                        <p className="text-gray-500 text-sm text-center">
                          This habit is paused until {pausedUntil}
                          {getPauseDaysFromPausedUntil() !== null ? ` (${getPauseDaysFromPausedUntil()} days)` : ''}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setPausedUntil('')
                            setPauseDays('')
                            setShowPauseCustom(false)
                          }}
                          className="mt-3 w-full py-3 rounded-xl font-semibold text-sm bg-gray-50 text-gray-700 border border-gray-200 active:scale-95 transition-transform"
                        >
                          Resume Habit
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-2 items-stretch">
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
                            className={`h-12 flex-1 px-4 rounded-xl font-semibold text-sm border active:scale-95 transition-transform ${
                              pauseDays === '1' && !showPauseCustom
                                ? 'bg-orange-500 border-orange-500 text-white'
                                : 'bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                          >
                            1 day
                          </button>

                          {!showPauseCustom ? (
                            <button
                              type="button"
                              onClick={() => {
                                setShowPauseCustom(true)
                                if (pauseDays === '1') setPauseDays('')
                              }}
                              className="h-12 flex-1 px-4 rounded-xl font-semibold text-sm bg-gray-50 text-gray-700 border border-gray-200 active:scale-95 transition-transform"
                            >
                              Custom
                            </button>
                          ) : (
                            <div className="relative flex-1 min-w-0">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={pauseDays}
                                onChange={(e) => setPauseDays(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="Days"
                                autoFocus
                                className="h-12 w-full bg-gray-50 text-gray-800 placeholder-gray-400 rounded-xl pl-4 pr-10 text-sm font-semibold border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setShowPauseCustom(false)
                                  setPauseDays('')
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-semibold active:scale-95 transition-transform"
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
                            className={`h-12 w-20 rounded-xl font-semibold text-sm active:scale-95 transition-transform ${
                              !pauseDays || parseInt(pauseDays, 10) <= 0
                                ? 'bg-gray-200 text-gray-500'
                                : 'bg-orange-500 text-white'
                            }`}
                          >
                            Set
                          </button>
                        </div>
                        <p className="text-gray-400 text-xs mt-2 text-center">
                          Pause hides the habit and skips penalties while paused
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] z-50">
        <div className="max-w-md mx-auto space-y-3">
          {!isEditing && step < 3 ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={step === 1 ? onBack : goBackStep}
                className="py-4 rounded-2xl font-semibold bg-gray-100 text-gray-700 active:scale-95 transition-transform"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext()}
                className={`py-4 rounded-2xl font-semibold text-white active:scale-95 transition-transform ${
                  canGoNext() ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          ) : (
            <button
              type="submit"
              form="habit-form"
              disabled={!canGoNext()}
              className={`w-full py-4 rounded-2xl font-semibold text-white active:scale-95 transition-transform ${
                canGoNext() ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              {habit ? 'Save Changes' : 'Add Habit'}
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full bg-white text-rose-500 py-4 rounded-2xl font-bold text-base border border-rose-100 active:bg-rose-50 transition-colors"
            >
              Delete Habit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default HabitAdder
