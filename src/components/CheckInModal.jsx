import { useState } from 'react'

function CheckInModal({ habitName, skipCost, onYes, onNo }) {
  const [showPayment, setShowPayment] = useState(false)

  // Payment view
  if (showPayment) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center z-50 px-6">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col items-center border border-gray-200">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">That's okay</h1>
          <p className="text-gray-500 text-center mb-8">
            Tomorrow is a new opportunity.<br/>
            Time to pay your accountability fee.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 w-full mb-6 text-center border border-gray-100">
            <p className="text-gray-400 text-sm mb-1">Amount due</p>
            <p className="text-4xl font-bold text-gray-900">${skipCost.toFixed(2)}</p>
          </div>

          <button
            onClick={onNo}
            className="w-full bg-black text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
          >
            Pay with Apple Pay
          </button>
        </div>
      </div>
    )
  }

  // Question view
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center z-50 px-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col items-center border border-gray-200">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Did you complete this habit?
        </h1>
        <p className="text-xl text-orange-600 font-medium mb-8">
          "{habitName}"
        </p>

        <div className="w-full space-y-3">
          <button
            onClick={onYes}
            className="w-full bg-green-500 text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
          >
            Yes, I did it! ✓
          </button>
          
          <button
            onClick={() => setShowPayment(true)}
            className="w-full bg-white text-gray-500 font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform border border-gray-200"
          >
            No, I missed it
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckInModal
