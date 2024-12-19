const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    total: { type: Number, required: true },
    address: {
      personName: String,
      street: String,
      city: String,
      postalCode: String,
    },
    orderDate: { type: Date, default: Date.now }
  });

  const Order = mongoose.model('Order', orderSchema);

  module.exports = Order;

