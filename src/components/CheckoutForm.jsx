import { useState, useEffect } from 'react';
import {
  ExpressCheckoutElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

export default function CheckoutForm({ clientSecret, amount, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    // If Stripe doesn't report readiness within 5 seconds, show fallback message
    const timer = setTimeout(() => {
      if (!isReady) {
        console.log('Apple Pay availability check timed out after 5s');
        setHasTimedOut(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isReady]);

  const onConfirm = async (event) => {
    console.log('Confirming payment...');
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      console.error('Payment confirmation error:', confirmError);
      setErrorMessage(confirmError.message);
    } else {
      console.log('Payment successful!');
      onPaymentSuccess();
    }
  };

  const onReady = (event) => {
    console.log('Express Checkout onReady event:', event);
    const { availablePaymentMethods } = event;
    console.log('Available methods:', availablePaymentMethods);
    if (availablePaymentMethods) {
      setIsReady(true);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative min-h-[52px] flex flex-col justify-center">
        {/* Apple Pay Button Container */}
        <div className={`transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          <ExpressCheckoutElement 
            onConfirm={onConfirm} 
            onReady={onReady}
            options={{
              buttonType: {
                applePay: 'buy'
              },
              paymentMethods: {
                applePay: 'always'
              }
            }}
          />
        </div>
        
        {/* Loading State Overlay */}
        {!isReady && !errorMessage && !hasTimedOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-2xl animate-pulse border border-white/10">
            <span className="text-gray-400 text-xs font-medium tracking-wide">
              Initializing Apple Pay...
            </span>
          </div>
        )}

        {/* Timeout State */}
        {hasTimedOut && !isReady && (
          <div className="text-gray-400 text-xs text-center p-4 bg-white/5 rounded-2xl border border-white/10">
            Apple Pay is taking a moment. 
            <br/>
            <span className="text-[10px] opacity-60 mt-1 block">Ensure you are in Safari with an active Wallet.</span>
          </div>
        )}
      </div>
      
      {errorMessage && (
        <div className="text-red-400 text-xs text-center p-2 bg-red-400/10 rounded-xl border border-red-400/20">
          {errorMessage}
        </div>
      )}

      {isReady && (
        <p className="text-gray-500 text-[10px] text-center italic animate-fade-in">
          Secure payment via Apple Pay
        </p>
      )}
    </div>
  );
}
