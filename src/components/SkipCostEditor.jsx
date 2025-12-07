import { useState } from 'react'

function SkipCostEditor({ skipCost, onSave, onBack }) {
  const [amount, setAmount] = useState(skipCost.toString())

  const handleSubmit = (e) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!isNaN(value) && value >= 0) {
      onSave(value)
    }
  }

  const presets = [0.25, 0.5, 1, 2, 5, 10]

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
        <h1 className="text-2xl font-bold text-gray-700 tracking-tight">Skip Cost</h1>
        <div className="w-12"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current Cost */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-400 to-rose-600 rounded-3xl p-8 text-center shadow-2xl shadow-rose-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <label className="block text-rose-100 text-sm font-medium mb-4 uppercase tracking-wider">
            Cost Per Skip
          </label>
          <div className="flex items-center justify-center">
            <span className="text-4xl font-black text-white mr-1">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="bg-transparent text-6xl font-black text-white text-center w-36 focus:outline-none"
            />
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Quick Select</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {presets.map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className={`py-4 rounded-2xl font-bold transition-all active:scale-95 ${
                  parseFloat(amount) === val
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-700 hover:shadow-md'
                }`}
              >
                ${val.toFixed(2)}
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Tips</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-gray-600 text-sm"><strong>$0.25-$0.50</strong> — Light motivation</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span className="text-gray-600 text-sm"><strong>$1-$2</strong> — Moderate stakes</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-rose-400"></div>
              <span className="text-gray-600 text-sm"><strong>$5-$10</strong> — Serious commitment</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4 text-center">
            Start small and increase as you build consistency.
          </p>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-rose-500/30 hover:shadow-xl transition-all active:scale-[0.98]"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}

export default SkipCostEditor
