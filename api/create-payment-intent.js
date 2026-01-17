import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let { amount, habitName, stripeCustomerId } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is missing');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const amountInCents = Math.round(amount * 100);
    if (amountInCents < 100) {
      return res.status(400).json({ error: 'Minimum contribution is $1.00 USD' });
    }

    // If no customer ID was provided, create a new one
    if (!stripeCustomerId) {
      console.log('Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        description: `Customer for Discipline Body`,
        metadata: { habitName }
      });
      stripeCustomerId = customer.id;
      console.log('New customer created:', stripeCustomerId);
    } else {
      console.log('Reusing existing customer:', stripeCustomerId);
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: stripeCustomerId,
      automatic_payment_methods: {
        enabled: true,
      },
      setup_future_usage: 'off_session',
      description: `Habit skip penalty for: ${habitName}`,
      metadata: {
        habitName,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      stripeCustomerId: stripeCustomerId
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
}
