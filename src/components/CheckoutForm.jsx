import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

export default function CheckoutForm({ amount, onPaymentSuccess, onEmailDetected }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

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

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
    business: { name: "Habit Buddy" },
    paymentMethodOrder: ['apple_pay', 'google_pay', 'card']
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="w-full space-y-6">
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <button 
        disabled={isLoading || !stripe || !elements} 
        id="submit"
        className="w-full bg-white text-gray-900 font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        <span id="button-text">
          {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </span>
      </button>
      {message && <div id="payment-message" className="text-red-400 text-sm text-center">{message}</div>}
    </form>
  );
}
