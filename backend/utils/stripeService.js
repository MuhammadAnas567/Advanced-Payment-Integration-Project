const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true
      }
    });
    return paymentIntent;
  } catch (error) {
    throw error;
  }
};

const confirmPaymentIntent = async (paymentIntentId, paymentMethod) => {
  try {
    const confirmed = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethod,
      return_url: `${process.env.CLIENT_URL}/payment-success`
    });
    return confirmed;
  } catch (error) {
    throw error;
  }
};

const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    throw error;
  }
};

const createRefund = async (chargeId, amount = null, reason = 'requested_by_customer') => {
  try {
    const refund = await stripe.refunds.create({
      charge: chargeId,
      ...(amount && { amount: Math.round(amount * 100) }),
      reason,
      metadata: {
        refund_timestamp: new Date().toISOString()
      }
    });
    return refund;
  } catch (error) {
    throw error;
  }
};

const getChargeDetails = async (chargeId) => {
  try {
    return await stripe.charges.retrieve(chargeId);
  } catch (error) {
    throw error;
  }
};

const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata
    });
    return customer;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  retrievePaymentIntent,
  createRefund,
  getChargeDetails,
  createCustomer
};