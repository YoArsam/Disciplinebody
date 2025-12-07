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

  return (
    <div className="max-w-md mx-auto p-5">
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-6">
        <button 
          onClick={onBack}
          className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"
        >
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-700 tracking-tight">
          {habit ? 'Edit Habit' : 'New Habit'}
        </h1>
        <div className="w-12"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Habit Name */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Habit Name</span>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Wake up, Exercise, Read..."
            className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 rounded-2xl p-5 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>

        {/* Time Frame */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Time Window</span>
            </div>
          </div>
          
          {/* All Day Toggle */}
          <button
            type="button"
            onClick={() => setAllDay(!allDay)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl mb-4 transition-all ${
              allDay ? 'bg-violet-100 border-2 border-violet-400' : 'bg-gray-100 border-2 border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                allDay ? 'bg-violet-500' : 'bg-gray-300'
              }`}>
                {allDay && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`font-semibold ${allDay ? 'text-violet-700' : 'text-gray-600'}`}>All Day</span>
            </div>
            <span className="text-sm text-gray-400">No specific time</span>
          </button>

          {!allDay && (
            <>
              <p className="text-gray-400 text-sm mb-4">
                Complete this habit between these times
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">From</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-gray-100 text-gray-800 rounded-2xl p-4 text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Until</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-gray-100 text-gray-800 rounded-2xl p-4 text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Preview */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Preview</span>
          </div>
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-5">
            <span className="font-bold text-lg text-gray-700 block">{name || 'Your habit'}</span>
            <span className="text-gray-400 text-sm">
              {allDay ? 'All Day' : `${formatTime(startTime)} - ${formatTime(endTime)}`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {habit ? 'Save Changes' : 'Add Habit'}
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full bg-gradient-to-r from-rose-500 to-red-500 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-rose-500/30 hover:shadow-xl transition-all active:scale-[0.98]"
            >
              Delete Habit
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function formatTime(timeStr) {
  const [hour, min] = timeStr.split(':').map(Number)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${min.toString().padStart(2, '0')}${ampm}`
}

export default HabitAdder
