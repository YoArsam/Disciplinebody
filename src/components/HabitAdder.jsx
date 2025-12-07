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
    <div className="h-full flex flex-col bg-gray-200 px-4 pb-0 animate-slideUp pt-[max(1rem,env(safe-area-inset-top))] relative">
      {/* Header */}
      <div className="flex items-center justify-between py-3 mb-2 flex-shrink-0">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center tap-bounce"
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
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 rounded-xl p-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>

          {/* Time Frame */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                allDay ? 'bg-violet-50 border border-violet-200' : 'bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  allDay ? 'bg-violet-500' : 'bg-gray-300'
                }`}>
                  {allDay && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`font-medium text-sm ${allDay ? 'text-violet-700' : 'text-gray-600'}`}>All Day</span>
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
                      className="w-full bg-gray-50 text-gray-800 rounded-xl p-3 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wide">Until</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-gray-50 text-gray-800 rounded-xl p-3 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Preview</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <span className="font-bold text-base text-gray-700 block">{name || 'Your habit'}</span>
              <span className="text-gray-400 text-sm">
                {allDay ? 'All Day' : `${formatTime(startTime)} - ${formatTime(endTime)}`}
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-base shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {habit ? 'Save Changes' : 'Add Habit'}
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
