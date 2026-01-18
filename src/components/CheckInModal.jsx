import { useState, useEffect, useMemo } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from './CheckoutForm'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function CheckInModal({ habit, onComplete, onSkip, onClose }) {
  const [showPayment, setShowPayment] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [stripeCustomerId, setStripeCustomerId] = useState(() => localStorage.getItem('stripe-customer-id') || null)
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('user-email') || '')

  useEffect(() => {
    // Dark background for the modal
    const DARK_BG = '#111827' // gray-900 equivalent
    
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    const metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')

    const previousTheme = metaTheme?.getAttribute('content')
    const previousStatusBar = metaStatusBar?.getAttribute('content')

    // Set dark theme for status bar
    if (metaTheme) metaTheme.setAttribute('content', DARK_BG)
    if (metaStatusBar) metaStatusBar.setAttribute('content', 'black-translucent')

    const prevHtmlBg = document.documentElement.style.backgroundColor
    const prevBodyBg = document.body.style.backgroundColor
    
    document.documentElement.style.backgroundColor = DARK_BG
    document.body.style.backgroundColor = DARK_BG

    return () => {
      // Restore previous state when modal closes
      if (metaTheme && previousTheme) metaTheme.setAttribute('content', previousTheme)
      if (metaStatusBar && previousStatusBar) metaStatusBar.setAttribute('content', previousStatusBar)
      document.documentElement.style.backgroundColor = prevHtmlBg
      document.body.style.backgroundColor = prevBodyBg
    }
  }, [])

  const { name: habitName = 'Habit', skipCost = 0, stakeDestination, charityName } = habit || {}

  const stripeOptions = useMemo(() => {
    console.log('Calculating stripeOptions with email:', userEmail);
    return {
      clientSecret,
      appearance: {
        theme: 'night',
        variables: {
          colorPrimary: '#ffffff',
        }
      },
      defaultValues: {
        billingDetails: {
          email: userEmail || undefined,
        }
      }
    };
  }, [clientSecret, userEmail]);

  useEffect(() => {
    if (skipCost > 0 && !clientSecret && !loadingPayment) {
      console.log('Pre-fetching payment intent. Current saved customer ID:', stripeCustomerId);
      setLoadingPayment(true)
      setPaymentError(null)
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: skipCost, habitName, stripeCustomerId, email: userEmail }),
      })
        .then(async (res) => {
          if (!res.ok) {
            let errorMsg = 'Failed to create payment intent';
            try {
              const errorData = await res.json();
              errorMsg = errorData.error || errorMsg;
            } catch (e) {
              // fallback
            }
            throw new Error(errorMsg);
          }
          return res.json();
        })
        .then((data) => {
          if (!data.clientSecret) {
            throw new Error('No client secret returned from server');
          }
          
          if (data.stripeCustomerId) {
            console.log('Received customer ID from server:', data.stripeCustomerId);
            setStripeCustomerId(data.stripeCustomerId);
            localStorage.setItem('stripe-customer-id', data.stripeCustomerId);
          }

          setClientSecret(data.clientSecret)
          setLoadingPayment(false)
        })
        .catch((err) => {
          console.error('Error fetching payment intent:', err)
          setPaymentError(err.message)
          setLoadingPayment(false)
        })
    }
  }, [skipCost, habitName, clientSecret, loadingPayment])

  const getContributionDestinationText = () => {
    if (stakeDestination === 'charity') {
      return charityName ? charityName : 'charity'
    }
    return 'support Habit Buddy'
  }

  // Success view - simple, no animations
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-[3px] flex flex-col items-center justify-center z-50 px-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isPaymentSuccess ? 'bg-blue-500' : 'bg-green-500'}`}>
          {isPaymentSuccess ? (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          {isPaymentSuccess ? 'Thank you for your contributions' : 'Nice work!'}
        </h1>
        <p className={`${isPaymentSuccess ? 'text-blue-400' : 'text-green-400'} font-medium text-lg mb-8 text-center px-4`}>
          {isPaymentSuccess 
            ? "We'll email you soon about the difference you're making for others" 
            : '+1 Streak'}
        </p>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isPaymentSuccess) {
              if (onSkip) onSkip();
            } else {
              if (onComplete) onComplete();
            }
          }}
          className="w-full bg-white text-gray-900 font-bold py-4 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors relative z-[9999]"
        >
          Continue
        </button>
      </div>
    )
  }

  // Payment view (or free habit confirmation)
  if (showPayment) {
    // Free habit - just confirm
    if (skipCost === 0) {
      return (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-[3px] flex flex-col items-center justify-center z-50 px-6">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">No worries</h1>
          <p className="text-gray-400 text-center mb-8">
            This is a free habit — no penalty.<br/>
            Try again tomorrow!
          </p>

          <button
            onClick={onComplete}
            className="w-full bg-white text-gray-900 font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
          >
            Got it
          </button>
        </div>
      )
    }

    // Paid habit - show payment
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-[3px] flex flex-col items-center justify-center z-50 px-6 overflow-y-auto pb-10">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6 shrink-0 mt-8">
          <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">That's okay</h1>
        <p className="text-gray-400 text-center mb-8">
          Tomorrow's a fresh start.<br/>
          Make your contribution and move forward.
        </p>

        <div className="bg-white/10 rounded-2xl p-6 w-full mb-6 text-center">
          <p className="text-gray-400 text-sm mb-1">Contribution</p>
          <p className="text-4xl font-bold text-white">${(Number(skipCost) || 0).toFixed(2)}</p>
          <p className="text-gray-400 text-sm mt-2">To {getContributionDestinationText()}</p>
        </div>

        {loadingPayment ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="text-white text-sm">Loading payment options...</p>
          </div>
        ) : paymentError ? (
          <div className="w-full bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
            <p className="text-red-400 text-sm mb-3">Error: {paymentError}</p>
            <button 
              onClick={() => {
                setPaymentError(null);
                setClientSecret('');
              }}
              className="text-white text-xs font-bold underline"
            >
              Try Again
            </button>
          </div>
        ) : clientSecret ? (
          <div className="w-full">
            <Elements stripe={stripePromise} options={stripeOptions}>
              <CheckoutForm 
                clientSecret={clientSecret}
                amount={skipCost} 
                onPaymentSuccess={() => {
                  setIsPaymentSuccess(true)
                  setShowPayment(false)
                  setShowSuccess(true)
                }} 
              />
            </Elements>
          </div>
        ) : (
          <button
            onClick={onSkip}
            className="w-full bg-white text-gray-900 font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
          >
            Skip for now
          </button>
        )}
        
        <button 
          onClick={() => setShowPayment(false)}
          className="mt-4 text-gray-500 text-sm font-medium"
        >
          Go Back
        </button>
      </div>
    )
  }

  // Question view
  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-[3px] flex flex-col items-center justify-center z-50 px-6">
      <h1 className="text-3xl font-bold text-white mb-4 text-center">Did you complete<br/>this habit?</h1>
      
      {/* Habit Card */}
      <div className="w-full bg-white/10 rounded-2xl p-5 mb-8">
        <h2 className="text-xl font-bold text-white text-center">{habitName}</h2>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={() => {
            if (onComplete) onComplete();
          }}
          className="w-full bg-green-500 text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
        >
          Yes, I did it! ✓
        </button>
        
        <button
          onClick={() => setShowPayment(true)}
          className="w-full bg-white/10 text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
        >
          No, I missed it
        </button>

        <button 
          onClick={onClose}
          className="w-full text-gray-500 text-sm font-medium pt-2"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

export default CheckInModal
