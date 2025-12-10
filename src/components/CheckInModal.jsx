function CheckInModal({ habitName, onYes, onNo, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 px-6">
      <h1 className="text-2xl font-bold text-white mb-2 text-center">
        Did you complete this?
      </h1>
      <p className="text-xl text-gray-300 font-medium mb-8">
        "{habitName}"
      </p>

      <div className="w-full space-y-3">
        <button
          onClick={onYes}
          className="w-full bg-green-500 text-white font-semibold py-4 rounded-2xl"
        >
          Yes
        </button>
        
        <button
          onClick={onNo}
          className="w-full bg-red-500 text-white font-semibold py-4 rounded-2xl"
        >
          No
        </button>
      </div>

      <button
        onClick={onClose}
        className="mt-6 text-gray-500 text-sm"
      >
        Later
      </button>
    </div>
  )
}

export default CheckInModal
