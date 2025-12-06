import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from './CheckoutForm';
import paymentService from '../services/paymentAPI';
import '../styles/Payment.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const PaymentCheckout = ({ items = [] }) => {
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [order, setOrder] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const calculateTotal = () => {
    if (!items || items.length === 0) return 0;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const shipping = 10;
    return subtotal + tax + shipping;
  };

  const calculateSubtotal = () => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await paymentService.createOrder({
        items,
        shippingAddress,
        billingAddress: shippingAddress
      });

      setOrder(res.data.order);
      setOrderCreated(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create order');
    }

    setLoading(false);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="payment-container">
      {!orderCreated ? (
        <div className="order-form">
          <h2>Shipping Information</h2>

          <form onSubmit={handleCreateOrder}>
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="street"
                value={shippingAddress.street}
                onChange={handleAddressChange}
                placeholder="Enter street address"
                required
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={shippingAddress.city}
                onChange={handleAddressChange}
                placeholder="Enter city"
                required
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={shippingAddress.state}
                onChange={handleAddressChange}
                placeholder="Enter state"
                required
              />
            </div>

            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={shippingAddress.zipCode}
                onChange={handleAddressChange}
                placeholder="Enter zip code"
                required
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={shippingAddress.country}
                onChange={handleAddressChange}
                placeholder="Enter country"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Creating Order...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
      ) : (
        <div className="payment-section">
          <h2>Complete Payment</h2>

          <div className="order-summary">
            <h3>Order Summary</h3>
            {items?.map((item, index) => (
              <div key={index} className="order-item">
                <span>{item.productName} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <div className="order-total">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax (10%):</span>
                <span>${(calculateSubtotal() * 0.1).toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>$10.00</span>
              </div>
              <div className="total">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm
              orderId={order._id}
              amount={calculateTotal()}
              onSuccess={(data) => {
                alert('Payment successful! Order ID: ' + order._id);
              }}
            />
          </Elements>
        </div>
      )}
    </div>
  );
};