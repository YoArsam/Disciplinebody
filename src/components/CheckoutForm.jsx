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
      <div className="min-h-[50px]">
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
      
      {!isReady && !errorMessage && !hasTimedOut && (
        <div className="text-gray-400 text-xs text-center p-4 bg-white/5 rounded-2xl animate-pulse">
          Checking Apple Pay availability...
        </div>
      )}

      {hasTimedOut && !isReady && (
        <div className="text-gray-400 text-sm text-center p-4 bg-white/5 rounded-2xl">
          Apple Pay is taking too long to load. 
          Please ensure you are in Safari and have a card in your Wallet.
        </div>
      )}

      {errorMessage && (
        <div className="text-red-400 text-xs text-center p-2">
          {errorMessage}
        </div>
      )}

      {isReady && (
        <p className="text-gray-500 text-[10px] text-center italic">
          Apple Pay only available in Safari on compatible devices.
        </p>
      )}
    </div>
  );
}
