import { useState } from 'react'

function CheckInModal({ habitName, skipCost, onYes, onNo }) {
  const [showPayment, setShowPayment] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Success celebration view
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center z-50 px-6">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col items-center border border-gray-200 overflow-hidden relative">
          {/* Confetti-like decorative elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400"></div>
          
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-5 animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Crushed it!</h1>
          <p className="text-green-600 font-semibold text-lg mb-2">+1 Streak</p>
          <p className="text-gray-500 text-center mb-6">
            You're building something great.<br/>Keep showing up.
          </p>

          <button
            onClick={onYes}
            className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-transform"
          >
            Let's go!
          </button>
        </div>
      </div>
    )
  }

  // Payment view (or free habit confirmation)
  if (showPayment) {
    // Free habit - just confirm
    if (skipCost === 0) {
      return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col items-center border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            
            <h1 className="text-xl font-bold text-gray-900 mb-2">Tomorrow's a new day</h1>
            <p className="text-gray-500 text-center text-sm mb-6">
              This one's free — no penalty.<br/>Reset and come back stronger.
            </p>

            <button
              onClick={onNo}
              className="w-full bg-gray-900 text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
            >
              Got it
            </button>
          </div>
        </div>
      )
    }

    // Paid habit - show payment
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center z-50 px-6">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col items-center border border-gray-200 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-400"></div>
          
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 mb-1">Accountability time</h1>
          <p className="text-gray-500 text-center text-sm mb-5">
            This is what makes it real.<br/>Pay up, then come back stronger.
          </p>

          <div className="bg-red-50 rounded-2xl p-5 w-full mb-5 text-center border border-red-100">
            <p className="text-red-400 text-xs font-medium mb-1">Amount due</p>
            <p className="text-3xl font-bold text-gray-900">${skipCost.toFixed(2)}</p>
          </div>

          <button
            onClick={onNo}
            className="w-full bg-gray-900 text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.0508 11.9756H6.94922V10.0244H17.0508V11.9756Z"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M1 6.5C1 4.01472 3.01472 2 5.5 2H18.5C20.9853 2 23 4.01472 23 6.5V17.5C23 19.9853 20.9853 22 18.5 22H5.5C3.01472 22 1 19.9853 1 17.5V6.5ZM5.5 4C4.11929 4 3 5.11929 3 6.5V17.5C3 18.8807 4.11929 20 5.5 20H18.5C19.8807 20 21 18.8807 21 17.5V6.5C21 5.11929 19.8807 4 18.5 4H5.5Z"/>
            </svg>
            Pay with Apple Pay
          </button>
        </div>
      </div>
    )
  }

  // Question view - The moment of truth
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center z-50 px-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col items-center border border-gray-200">
        {/* Habit name - the star */}
        <p className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
          Check-in time
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          "{habitName}"
        </h1>

        {/* Stakes reminder */}
        <div className="w-full bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-600 text-sm">Complete</span>
            </div>
            <span className="text-green-600 font-bold text-sm">+1 Streak</span>
          </div>
          <div className="h-px bg-gray-200 my-3"></div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-gray-600 text-sm">Skip</span>
            </div>
            <span className="text-red-500 font-bold text-sm">
              {skipCost === 0 ? 'Free' : `-$${skipCost.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={() => setShowSuccess(true)}
            className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl active:scale-[0.98] transition-transform text-lg"
          >
            I did it ✓
          </button>
          
          <button
            onClick={() => setShowPayment(true)}
            className="w-full bg-white text-gray-400 font-medium py-3 rounded-2xl active:scale-[0.98] transition-transform border border-gray-200 text-sm"
          >
            {skipCost === 0 ? 'I missed it' : `I'll pay the $${skipCost.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckInModal
