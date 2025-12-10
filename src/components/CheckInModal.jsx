import { useState } from 'react'

function CheckInModal({ habit, skipCost, onComplete, onClose }) {
  const [answered, setAnswered] = useState(null) // null | 'yes' | 'no'

  // Safety check - if habit is null/undefined, don't render
  if (!habit) {
    return null
  }

  const handleYes = () => {
    setAnswered('yes')
    // Complete immediately after showing feedback
    setTimeout(() => onComplete(habit.id, true), 800)
  }

  const handleNo = () => {
    setAnswered('no')
  }

  const handlePayment = () => {
    onComplete(habit.id, false)
  }

  // Payment confirmation view
  if (answered === 'no') {
    return (
      <div className="fixed inset-0 bg-gray-900/95 flex flex-col items-center justify-center z-50 px-6">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">That's okay</h1>
        <p className="text-gray-400 text-center mb-8">
          Tomorrow is a new opportunity.<br/>
          Time to pay your accountability fee.
        </p>

        <div className="bg-white/10 rounded-2xl p-6 w-full mb-6">
          <p className="text-gray-400 text-sm mb-1">Amount due</p>
          <p className="text-4xl font-bold text-white">${skipCost.toFixed(2)}</p>
        </div>

        <button
          onClick={handlePayment}
          className="w-full bg-white text-gray-900 font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.0508 11.2C17.0508 9.93 16.2708 8.87 15.1508 8.37C15.6108 7.92 15.9008 7.29 15.9008 6.6C15.9008 5.16 14.7408 4 13.3008 4C11.8608 4 10.7008 5.16 10.7008 6.6C10.7008 7.29 10.9908 7.92 11.4508 8.37C10.3308 8.87 9.55078 9.93 9.55078 11.2V12H17.0508V11.2Z"/>
            <path d="M20 14H4C3.45 14 3 14.45 3 15V19C3 19.55 3.45 20 4 20H20C20.55 20 21 19.55 21 19V15C21 14.45 20.55 14 20 14Z"/>
          </svg>
          Pay with Apple Pay
        </button>

        <button
          onClick={onClose}
          className="mt-4 text-gray-500 text-sm"
        >
          Cancel
        </button>
      </div>
    )
  }

  // Main check-in question (or success feedback)
  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center z-50 px-6 transition-colors duration-300 ${
      answered === 'yes' ? 'bg-green-500' : 'bg-gray-900/95'
    }`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
        answered === 'yes' ? 'bg-white' : 'bg-violet-500/20'
      }`}>
        {answered === 'yes' ? (
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      <h1 className={`text-2xl font-bold mb-2 text-center ${
        answered === 'yes' ? 'text-white' : 'text-white'
      }`}>
        {answered === 'yes' ? 'Amazing!' : 'Did you complete this habit?'}
      </h1>
      <p className={`text-xl font-medium mb-8 ${
        answered === 'yes' ? 'text-white/80' : 'text-violet-300'
      }`}>
        {answered === 'yes' ? 'Keep building that streak' : `"${habit.name}"`}
      </p>

      {answered !== 'yes' && (
        <>
          <div className="w-full space-y-3">
            <button
              onClick={handleYes}
              className="w-full bg-green-500 text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
            >
              Yes, I did it! ✓
            </button>
            
            <button
              onClick={handleNo}
              className="w-full bg-white/10 text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
            >
              No, I missed it
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-6 text-gray-500 text-sm"
          >
            Ask me later
          </button>
        </>
      )}
    </div>
  )
}

export default CheckInModal
