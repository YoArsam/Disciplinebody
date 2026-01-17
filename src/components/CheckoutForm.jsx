import { useState, useEffect } from 'react';
import {
  PaymentRequestButtonElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

export default function CheckoutForm({ clientSecret, amount, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
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
        console.log('Apple Pay check result:', result);
        if (result && result.applePay) {
          setPaymentRequest(pr);
          setCanMakePayment(true);
        } else {
          setCanMakePayment(false);
        }
      }).catch(err => {
        console.error('Error checking payment availability:', err);
        setCanMakePayment(false);
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

  if (!canMakePayment) {
    return (
      <div className="text-gray-400 text-sm text-center p-4 bg-white/5 rounded-2xl">
        Apple Pay is not available. 
        Please use Safari on an Apple device with a card in your Wallet.
      </div>
    );
  }

  return (
    <div className="w-full">
      <PaymentRequestButtonElement options={{ paymentRequest }} />
      {message && <div className="text-red-400 text-sm text-center mt-4">{message}</div>}
    </div>
  );
}
