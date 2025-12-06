// ============= models/Payment.js (FIXED) =============
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'usd'
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank_transfer', 'wallet'],
      default: 'card'
    },
    stripePaymentIntentId: String,
    stripeChargeId: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    description: String,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    customerEmail: String,
    customerName: String,
    customerPhone: String,
    cardDetails: {
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number
    },
    metadata: {
      orderId: String,
      productId: String,
      quantity: Number
    },
    errorMessage: String,
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    receiptUrl: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);