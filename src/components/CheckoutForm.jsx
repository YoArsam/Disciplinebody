import { useState, useEffect } from 'react';
import {
  PaymentRequestButtonElement,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

export default function CheckoutForm({ clientSecret, amount, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (stripe && clientSecret) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Habit Buddy Skip',
          amount: Math.round(amount * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then(result => {
        if (result && result.applePay) {
          setPaymentRequest(pr);
          setCanMakePayment(true);
        } else {
          setCanMakePayment(false);
        }
      });

      pr.on('paymentmethod', async (ev) => {
        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );

        if (confirmError) {
          ev.complete('fail');
          setMessage(confirmError.message);
        } else {
          ev.complete('success');
          if (paymentIntent.status === "succeeded") {
            onPaymentSuccess();
          }
        }
      });
    }
  }, [stripe, clientSecret, amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required'
    });

    if (error) {
      setIsLoading(false);
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onPaymentSuccess();
    }
  };

  return (
    <div className="w-full space-y-6">
      {canMakePayment && paymentRequest && (
        <div className="space-y-4">
          <PaymentRequestButtonElement options={{ paymentRequest }} />
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase">Or pay with card</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>
        </div>
      )}

      <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement 
          id="payment-element" 
          options={{
            layout: "tabs",
            business: { name: "Habit Buddy" },
          }} 
        />
        <button 
          disabled={isLoading || !stripe || !elements} 
          id="submit"
          className="w-full bg-white text-gray-900 font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </button>
        {message && <div className="text-red-400 text-sm text-center">{message}</div>}
      </form>

      {!canMakePayment && (
        <p className="text-gray-500 text-[10px] text-center italic">
          Apple Pay is only available in Safari on compatible devices.
        </p>
      )}
    </div>
  );
}
