import { useState } from 'react'

function HabitAdder({ habit, onSave, onDelete, onBack }) {
  const [name, setName] = useState(habit?.name || '')
  const [allDay, setAllDay] = useState(habit?.allDay ?? false)
  const [startTime, setStartTime] = useState(habit?.startTime || '06:00')
  const [endTime, setEndTime] = useState(habit?.endTime || '07:00')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      ...(habit || {}),
      name: name.trim(),
      allDay,
      startTime: allDay ? '00:00' : startTime,
      endTime: allDay ? '23:59' : endTime,
    })
  }

  const formatTime = (timeStr) => {
    const [hour, min] = timeStr.split(':').map(Number)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${min.toString().padStart(2, '0')}${ampm}`
  }

  return (
    <div className="h-full flex flex-col bg-[#fcfcfc] px-4 pb-0 animate-slideUp pt-[max(1rem,env(safe-area-inset-top))] relative">
      {/* Header */}
      <div className="flex items-center justify-between py-3 mb-2 flex-shrink-0">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center tap-bounce"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          {habit ? 'Edit Habit' : 'New Habit'}
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-32">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Habit Name */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Habit Name</span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Wake up, Exercise, Read..."
              className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 rounded-xl p-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>

          {/* Time Frame */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Time Window</span>
            </div>
            
            {/* All Day Toggle */}
            <button
              type="button"
              onClick={() => setAllDay(!allDay)}
              className={`w-full flex items-center justify-between p-3 rounded-xl mb-4 transition-all ${
                allDay ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  allDay ? 'bg-orange-500' : 'bg-gray-300'
                }`}>
                  {allDay && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`font-medium text-sm ${allDay ? 'text-orange-700' : 'text-gray-600'}`}>All Day</span>
              </div>
              <span className="text-xs text-gray-400">No specific time</span>
            </button>

            {!allDay && (
              <>
                <p className="text-gray-400 text-xs mb-3">
                  Complete this habit between these times
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wide">From</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-gray-50 text-gray-800 rounded-xl p-3 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wide">Until</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-gray-50 text-gray-800 rounded-xl p-3 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* How It Works - Only show for new habits */}
          {!habit && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">How It Works</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="text-gray-700 font-medium text-sm">Set your window</p>
                    <p className="text-gray-400 text-xs">We'll check in at the end</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="text-gray-700 font-medium text-sm">Did you do it?</p>
                    <p className="text-gray-400 text-xs">Yes = streak grows · No = pay skip cost</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="text-gray-700 font-medium text-sm">Skin in the game</p>
                    <p className="text-gray-400 text-xs">Real stakes = real results</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* When We'll Check In - Dynamic preview */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <span className="text-orange-700 text-xs font-bold uppercase tracking-wider">We'll Ask You</span>
            </div>
            
            <div className="bg-white/60 rounded-xl p-4 text-center">
              <p className="text-orange-600 font-bold text-lg mb-1">
                {allDay ? 'At end of day' : `At ${formatTime(endTime)}`}
              </p>
              <p className="text-gray-600 text-sm">
                "Did you complete <span className="font-semibold">{name || 'this habit'}</span>?"
              </p>
              <p className="text-gray-400 text-xs mt-2 italic">Be honest. That's the whole point.</p>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] z-50">
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-base active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {habit ? 'Save Changes' : 'Lock It In'}
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full bg-white text-rose-500 py-4 rounded-xl font-bold text-base border border-rose-100 active:bg-rose-50 transition-colors"
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
