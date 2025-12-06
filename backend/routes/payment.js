// ============= routes/payment.js (NO AUTH) =============
const express = require('express');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const {
  createPaymentIntent,
  retrievePaymentIntent,
  createRefund
} = require('../utils/stripeService');

const router = express.Router();

// ============= CREATE PAYMENT INTENT =============
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', description, orderId } = req.body;

    if (!amount || amount <= 0) {   
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const paymentIntent = await createPaymentIntent(amount, currency, {
      orderId,
      description
    });

    const payment = new Payment({
      amount,
      currency,
      description,
      orderId,
      stripePaymentIntentId: paymentIntent.id,
      customerEmail: 'customer@example.com',
      customerName: 'Customer',
      status: 'pending',
      paymentMethod: 'card'
    });

    await payment.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============= CONFIRM PAYMENT =============
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentId, stripePaymentIntentId } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const paymentIntent = await retrievePaymentIntent(stripePaymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      payment.status = 'completed';
      
      // FIX: Check if charges exist
      if (paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length > 0) {
        payment.stripeChargeId = paymentIntent.charges.data[0].id;

        if (paymentIntent.charges.data[0].payment_method_details?.card) {
          const cardDetails = paymentIntent.charges.data[0].payment_method_details.card;
          payment.cardDetails = {
            last4: cardDetails.last4,
            brand: cardDetails.brand,
            expiryMonth: cardDetails.exp_month,
            expiryYear: cardDetails.exp_year
          };
        }
      }

      if (payment.orderId) {
        await Order.findByIdAndUpdate(payment.orderId, {
          status: 'paid',
          paymentId: payment._id
        });
      }

      await payment.save();

      return res.json({
        success: true,
        message: 'Payment successful',
        payment
      });
    }

    if (paymentIntent.status === 'requires_action') {
      return res.json({
        success: false,
        message: 'Payment requires further action',
        requiresAction: true
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Payment failed',
      status: paymentIntent.status
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// ============= GET PAYMENT DETAILS =============
router.get('/payment/:paymentId', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============= GET ALL PAYMENTS =============
router.get('/payments', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============= REFUND PAYMENT =============
router.post('/refund', async (req, res) => {
  try {
    const { paymentId, amount, reason = 'requested_by_customer' } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    if (amount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed original payment'
      });
    }

    const refund = await createRefund(payment.stripeChargeId, amount, reason);

    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundAmount = amount;
    payment.refundReason = reason;
    await payment.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: payment
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============= CREATE ORDER =============
router.post('/create-order', async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain items'
      });
    }

    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.price * item.quantity;
    });

    const taxAmount = totalAmount * 0.1;
    const shippingAmount = 10;
    const finalAmount = totalAmount + taxAmount + shippingAmount;

    const order = new Order({
      items,
      totalAmount,
      taxAmount,
      shippingAmount,
      finalAmount,
      shippingAddress,
      billingAddress,
      notes,
      status: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============= GET ALL ORDERS =============
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;