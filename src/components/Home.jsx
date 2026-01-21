import { useState, useEffect, useRef } from 'react'

// SVG icons for progress messages
const ProgressIcons = {
  trophy: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  fire: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  bolt: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  sparkle: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  sun: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  moon: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
}

function getProgressMessage(habits, completedToday, paidToday, habitHistory) {
  const totalHabits = habits.length
  // Only count completions/payments that match actual habit IDs
  const habitIds = habits.map(h => h.id)
  const validCompletions = completedToday.filter(id => habitIds.includes(id))
  const validPayments = (paidToday || []).filter(id => habitIds.includes(id))
  const doneToday = validCompletions.length + validPayments.length
  
  // Get best per-habit streak
  const bestStreak = getBestHabitStreak(habits, habitHistory)
  
  // Priority 1: No habits yet
  if (totalHabits === 0) {
    return {
      icon: ProgressIcons.sparkle,
      headline: "Ready to start",
      subtext: "Add your first habit below"
    }
  }
  
  // Priority 2: Has a notable habit streak (2+ days)
  if (bestStreak.days >= 2) {
    return {
      icon: ProgressIcons.fire,
      headline: `${bestStreak.days}-day streak`,
      subtext: `of ${bestStreak.habitName}`
    }
  }
  
  // Priority 3: All done today
  if (doneToday > 0 && doneToday >= totalHabits) {
    return {
      icon: ProgressIcons.check,
      headline: "Perfect day!",
      subtext: "You crushed all your habits"
    }
  }
  
  // Priority 4: Some done
  if (doneToday > 0) {
    return {
      icon: ProgressIcons.bolt,
      headline: `${doneToday} of ${totalHabits} done`,
      subtext: "Keep going, almost there"
    }
  }
  
  // Priority 5: Has habits, none done yet - time-based greeting
  const hour = new Date().getHours()
  if (hour < 12) {
    return {
      icon: ProgressIcons.sun,
      headline: "Good morning!",
      subtext: `${totalHabits} habit${totalHabits > 1 ? 's' : ''} to complete today`
    }
  } else if (hour < 17) {
    return {
      icon: ProgressIcons.sun,
      headline: "Afternoon check-in",
      subtext: `${totalHabits} habit${totalHabits > 1 ? 's' : ''} waiting for you`
    }
  } else {
    return {
      icon: ProgressIcons.moon,
      headline: "Evening push",
      subtext: `${totalHabits} habit${totalHabits > 1 ? 's' : ''} left today`
    }
  }
}

// Calculate streak for a single habit from its completion history
function calculateHabitStreak(dates) {
  if (!dates || dates.length === 0) return 0
  
  // Sort dates descending (most recent first)
  const sortedDates = [...dates].sort().reverse()
  
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  // Streak must include today or yesterday to be "active"
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0
  }
  
  let streak = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i - 1])
    const prev = new Date(sortedDates[i])
    const diffDays = (current - prev) / 86400000
    
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

// Find the best habit streak to display
function getBestHabitStreak(habits, habitHistory) {
  let bestStreak = { habitName: '', days: 0 }
  
  for (const habit of habits) {
    const dates = habitHistory[habit.id] || []
    const streak = calculateHabitStreak(dates)
    
    if (streak > bestStreak.days) {
      bestStreak = { habitName: habit.name, days: streak }
    }
  }
  
  return bestStreak
}

function Home({ 
  wallet, 
  habits, 
  completedToday,
  paidToday,
  habitHistory,
  habitsExpanded,
  onAddHabit, 
  onEditHabit, 
  onMarkDone,
  onToggleHabits 
}) {
  const widgetRef = useRef(null)
  const [widgetStyle, setWidgetStyle] = useState({})
  const [now, setNow] = useState(new Date())
  const [expandedGridHabitId, setExpandedGridHabitId] = useState(null)

  // Update clock every minute for countdowns
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Warm up CSS transitions on mount by doing a tiny invisible transition
  useEffect(() => {
    // Start with a tiny transform
    setWidgetStyle({ transform: 'translateY(0.1px)' })
    
    // Then reset after transition completes - this activates the transition
    setTimeout(() => {
      setWidgetStyle({ transform: 'translateY(0)' })
    }, 50)
    
    // Clear completely
    setTimeout(() => {
      setWidgetStyle({})
    }, 500)
  }, [])

  // Calculate expanded position - using transform only for real slide up
  useEffect(() => {
    if (habitsExpanded && widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect()
      const targetTop = 14 
      const moveUp = rect.top - targetTop
      
      setWidgetStyle({
        transform: `translateY(-${moveUp}px)`,
        height: '5000px', 
        borderRadius: '2.5rem 2.5rem 0 0',
        paddingBottom: '600px',
        backgroundColor: 'white',
        zIndex: 50,
        overflowY: 'hidden', // Widget itself shouldn't scroll, inner list should
        marginBottom: '-4800px'
      })
    } else {
      setWidgetStyle({})
    }
  }, [habitsExpanded])

  const getHabitDays = (habit) => habit?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]
  const isHabitPausedToday = (habit) => {
    if (!habit?.pausedUntil) return false
    const todayIso = new Date().toISOString().split('T')[0]
    return habit.pausedUntil >= todayIso
  }
  const isHabitScheduledToday = (habit) => getHabitDays(habit).includes(new Date().getDay())
  const todaysHabits = habits.filter(isHabitScheduledToday)
  
  // Use all habits when expanded, only today's habits when collapsed
  const displayedHabits = habitsExpanded ? habits : todaysHabits

  const isHabitDone = (habit) => completedToday.includes(habit.id)

  return (
    <div className={`h-full flex flex-col bg-[#fcfcfc] px-4 ${habitsExpanded ? 'pb-0' : 'pb-20'} pt-[max(1rem,env(safe-area-inset-top))] ${habitsExpanded ? 'overflow-hidden' : ''} relative`}>
      <div className={`home-top-elements ${habitsExpanded ? 'faded' : ''}`}>
        <div className="flex-shrink-0 mb-4">
          {/* Top Row: Profile Icon + Total Completions */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            {/* Total Completions Pill */}
            {(() => {
              const totalCompletions = Object.values(habitHistory).reduce((sum, dates) => sum + (dates?.length || 0), 0)
              const hasCompletions = totalCompletions > 0
              
              return (
                <div className={`flex items-center gap-2 ${hasCompletions ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border rounded-full px-4 h-10`}>
                  <div className={`w-5 h-5 rounded-full ${hasCompletions ? 'bg-green-500' : 'bg-yellow-500'} flex items-center justify-center`}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className={`${hasCompletions ? 'text-green-700' : 'text-yellow-700'} font-bold text-sm`}>
                    {totalCompletions}
                  </span>
                  <span className={`${hasCompletions ? 'text-green-600' : 'text-yellow-600'} text-sm font-medium`}>completed</span>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Your Progress Card */}
        <div className="flex-shrink-0 mb-4">
          {(() => {
            const progress = todaysHabits.length === 0 && habits.length > 0
              ? {
                  icon: ProgressIcons.moon,
                  headline: 'Rest day',
                  subtext: 'No habits scheduled today',
                }
              : getProgressMessage(todaysHabits, completedToday, paidToday, habitHistory)
            return (
              <div className="bg-white border border-gray-200 rounded-3xl px-6 py-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    {progress.icon}
                  </div>
                  <span className="text-gray-500 text-sm font-medium">Your Progress</span>
                </div>
                <div className="text-center py-2">
                  <span className="text-3xl font-bold text-gray-900 block">{progress.headline}</span>
                  <span className="text-gray-500 text-sm">{progress.subtext}</span>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Today's Habits Card */}
      <div 
        ref={widgetRef}
        className={`flex-1 bg-white border border-gray-200 rounded-3xl px-6 py-5 flex flex-col min-h-0 cursor-pointer habits-widget ${habitsExpanded ? 'expanded' : ''}`}
        style={{
          ...widgetStyle,
          minHeight: habitsExpanded ? '5000px' : '450px',
          marginBottom: habitsExpanded ? '-4800px' : '0'
        }}
        onClick={onToggleHabits}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-medium">
              Today's Habits
            </span>
          </div>
          <button 
            type="button"
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (onAddHabit) onAddHabit()
            }}
            className="relative z-50 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Habits List */}
        <div className={`flex-1 flex flex-col gap-2 w-full ${habitsExpanded ? 'overflow-y-auto max-h-[calc(100vh-120px)]' : 'overflow-y-auto'}`} style={{ WebkitOverflowScrolling: 'touch' }}>
          {habits.length === 0 ? (
            <button 
              type="button"
              onPointerDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (onAddHabit) onAddHabit()
              }}
              className="flex-1 flex flex-col items-center justify-center w-full"
            >
              {/* Plus Icon Circle */}
              <div className="w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4 text-center">No habits yet</p>
              <div className="bg-white rounded-full px-8 py-3 border border-gray-200">
                <span className="text-orange-700 font-medium">Add Your First Habits</span>
              </div>
            </button>
          ) : displayedHabits.length === 0 ? (
            <button 
              type="button"
              onPointerDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (onAddHabit) onAddHabit()
              }}
              className="flex-1 flex flex-col items-center justify-center w-full"
            >
              {/* Plus Icon Circle */}
              <div className="w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4 text-center">No habits scheduled today</p>
              <div className="bg-white rounded-full px-8 py-3 border border-gray-200">
                <span className="text-orange-700 font-medium">Add a Habit</span>
              </div>
            </button>
          ) : (
            // Sort habits: done habits go to bottom
            [...displayedHabits]
              .sort((a, b) => {
                const aDone = completedToday.includes(a.id)
                const bDone = completedToday.includes(b.id)
                const aPaid = (paidToday || []).includes(a.id)
                const bPaid = (paidToday || []).includes(b.id)
                const aResolved = aDone || aPaid
                const bResolved = bDone || bPaid
                const aPaused = isHabitPausedToday(a)
                const bPaused = isHabitPausedToday(b)
                // Paused habits go to the very bottom
                if (aPaused && !bPaused) return 1
                if (!aPaused && bPaused) return -1
                // Done habits go to bottom
                if (aResolved && !bResolved) return 1
                if (!aResolved && bResolved) return -1
                return 0
              })
              .map((habit, index) => {
              const isDone = isHabitDone(habit)
              const isPaid = paidToday?.includes(habit.id)
              const isResolved = isDone || isPaid
              const isPaused = isHabitPausedToday(habit)
              
              // Get last 28 days for grid chart (4 weeks)
              const habitDates = habitHistory[habit.id] || []
              const last28Days = Array.from({ length: 28 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (27 - i))
                return date.toISOString().split('T')[0]
              })
              
              return (
                <div
                  key={habit.id}
                  onClick={() => onEditHabit(habit)}
                  className={`w-full p-4 rounded-2xl transition-all ${
                    isResolved ? 'bg-white/50' : isPaused ? 'bg-gray-50' : 'bg-white'
                  } border border-gray-200 cursor-pointer ${isPaused ? 'opacity-70' : ''}`}
                >
                  {/* Top row: Habit info + status */}
                  <div className="flex items-stretch -m-4">
                    {/* Habit Info - Clickable to edit */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditHabit(habit)
                      }}
                      className="flex-1 min-w-0 text-left p-4"
                    >
                      <span className={`font-semibold text-lg block truncate ${
                        isResolved || isPaused ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {habit.name}
                      </span>
                      <span className={`text-sm ${
                        isResolved || isPaused ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {isPaused ? `Paused until ${habit.pausedUntil}` : (() => {
                          const timeStr = habit.habitTime;
                          if (!timeStr || timeStr === "") return 'All Day';
                          
                          try {
                            const [hour, min] = timeStr.split(':').map(Number);
                            if (isNaN(hour) || isNaN(min)) return 'All Day';

                            const deadline = new Date(now);
                            deadline.setHours(hour, min, 0, 0);

                            if (now > deadline) {
                              deadline.setDate(deadline.getDate() + 1);
                            }

                            const diffMs = deadline.getTime() - now.getTime();
                            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                            if (diffHrs > 0) {
                              return `${diffHrs}h ${diffMins}m`;
                            }
                            return `${diffMins}m`;
                          } catch (e) {
                            return 'All Day';
                          }
                        })()}
                      </span>
                    </button>
                    
                    {/* Status Section */}
                    {isPaused ? (
                      <div className="flex items-center px-4">
                        <span className="text-gray-300 text-lg font-medium">Paused</span>
                      </div>
                    ) : isResolved ? (
                      <div className="flex items-center px-4">
                        <span className="text-gray-300 text-lg font-medium">
                          {isPaid ? (habit.stakeDestination === 'charity' ? 'Donated' : 'Supported') : 'Done'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-stretch">
                        <div className="w-[1px] bg-gray-100" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onMarkDone) onMarkDone(habit)
                          }}
                          className="px-6 py-2 text-[#FF6B00] text-base font-semibold transition-all hover:bg-orange-50 active:bg-orange-100 flex items-center justify-center min-h-full rounded-r-2xl"
                        >
                          Check
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Weekly/Monthly Grid - Only show when expanded */}
                  {habitsExpanded && (
                    <div 
                      className="border-t border-gray-100 pt-4 grid-chart-enter cursor-pointer active:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedGridHabitId(expandedGridHabitId === habit.id ? null : habit.id);
                      }}
                    >
                      <div className={`grid ${expandedGridHabitId === habit.id ? 'grid-cols-7' : 'grid-cols-7'} gap-1`}>
                        {(() => {
                          const dayCount = expandedGridHabitId === habit.id ? 28 : 7;
                          const indices = Array.from({ length: dayCount }, (_, i) => i);
                          
                          // Group indices by state to determine positional mapping
                          // We want: [Completed Indices] -> [Today (0)] -> [Remaining Indices]
                          const completedIndices = indices.filter(idx => {
                            if (idx === 0) return false; // Exclude today from completed pool for sorting
                            const date = new Date(now);
                            date.setDate(now.getDate() - idx);
                            return habitDates.includes(date.toISOString().split('T')[0]);
                          });

                          const remainingIndices = indices.filter(idx => 
                            idx !== 0 && !completedIndices.includes(idx)
                          );

                          // Final ordered list of what date index goes in which slot
                          const virtualOrder = [...completedIndices, 0, ...remainingIndices];

                          return indices.map((i) => {
                            const virtualIndex = virtualOrder[i];
                            const date = new Date(now);
                            date.setDate(now.getDate() - virtualIndex);
                            const dateIso = date.toISOString().split('T')[0];
                            const isCompleted = habitDates.includes(dateIso);
                            const isToday = virtualIndex === 0;
                            
                            // Chain logic: Connects to NEXT slot if both are completed
                            let hasNextChain = false;
                            if (i < dayCount - 1) {
                              const nextVirtualIndex = virtualOrder[i + 1];
                              const nextDate = new Date(now);
                              nextDate.setDate(now.getDate() - nextVirtualIndex);
                              const nextIso = nextDate.toISOString().split('T')[0];
                              hasNextChain = isCompleted && habitDates.includes(nextIso);
                            }

                            return (
                              <div 
                                key={i} 
                                className="relative flex-1 aspect-square"
                                style={{ flex: `0 0 calc((100% - 6 * 0.25rem) / 7)` }}
                              >
                                <div 
                                  className={`absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-[40%] bg-green-500 z-0 transition-opacity duration-300 ${
                                    hasNextChain ? 'opacity-100' : 'opacity-0'
                                  }`} 
                                />

                                <div
                                  className={`relative z-10 w-full h-full rounded-sm transition-all duration-300 ${
                                    isCompleted 
                                      ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.2)]' 
                                      : isToday 
                                        ? 'bg-orange-200' 
                                        : 'bg-gray-100'
                                  }`}
                                  title={dateIso}
                                />
                              </div>
                            );
                          });
                        })()}
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-center transition-all">
                        {expandedGridHabitId === habit.id ? 'Last 28 days' : 'Last 7 days (Tap to expand)'}
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          )}
          {/* Extra scrolling space at the bottom */}
          <div className={`${habitsExpanded ? 'h-32' : 'h-24'} w-full flex-shrink-0`} />
        </div>
      </div>
    </div>
  )
}

export default Home
