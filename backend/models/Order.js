// ============= models/Order.js (FIXED) =============
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: String,
        productName: String,
        quantity: Number,
        price: Number,
        total: Number
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    taxAmount: Number,
    discountAmount: {
      type: Number,
      default: 0
    },
    shippingAmount: {
      type: Number,
      default: 0
    },
    finalAmount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    customerEmail: String,
    customerName: String,
    customerPhone: String,
    notes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);