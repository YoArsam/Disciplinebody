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

  const onConfirm = async (event) => {
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setErrorMessage(confirmError.message);
    } else {
      onPaymentSuccess();
    }
  };

  const onReady = ({ availablePaymentMethods }) => {
    console.log('Express Checkout available methods:', availablePaymentMethods);
    if (availablePaymentMethods) {
      setIsReady(true);
    }
  };

  return (
    <div className="w-full space-y-4">
      <ExpressCheckoutElement 
        onConfirm={onConfirm} 
        onReady={onReady}
        options={{
          buttonType: {
            applePay: 'buy'
          },
          paymentMethods: {
            applePay: 'always',
            googlePay: 'never',
            link: 'never'
          }
        }}
      />
      
      {!isReady && !errorMessage && (
        <div className="text-gray-400 text-xs text-center p-4 bg-white/5 rounded-2xl animate-pulse">
          Checking Apple Pay availability...
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
