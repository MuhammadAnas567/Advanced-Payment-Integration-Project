import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import paymentService from '../services/paymentAPI';
import '../styles/Payment.css';

export const CheckoutForm = ({ orderId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!stripe || !elements) {
      setError('Payment system not loaded');
      return;
    }

    setLoading(true);

    try {
      const intentRes = await paymentService.createPaymentIntent({
        amount,
        currency: 'usd',
        orderId,
        description: `Order ${orderId}`
      });

      const { clientSecret, paymentId } = intentRes.data;

      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: 'Customer Name',
          email: 'customer@example.com'
        }
      });

      if (methodError) {
        setError(methodError.message);
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id
        }
      );

      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        const confirmRes = await paymentService.confirmPayment({
          paymentId,
          stripePaymentIntentId: paymentIntent.id
        });

        setSuccess('Payment successful!');
        if (onSuccess) {
          onSuccess(confirmRes.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="form-group">
        <label>Card Details</label>
        <div className="card-element">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4'
                  }
                },
                invalid: {
                  color: '#9e2146'
                }
              }
            }}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button type="submit" disabled={!stripe || loading} className="pay-button">
        {loading ? `Processing...` : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};