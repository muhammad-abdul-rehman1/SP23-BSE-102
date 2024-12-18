const express = require('express');
const router = express.Router({ mergeParams: true });
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const isLoggedIn = authMiddleware.isLoggedIn;
const isAdmin = authMiddleware.isAdmin;

router.get('/', isLoggedIn, isAdmin, async (req, res) => {
    try {
      // Fetch products from MongoDB
      const products = await Product.find();
      const orders = await Order.find();
      const users = await User.find();
  
      // Pass the cart data (session.cart) to the view
      const cart = req.session.cart || [];
      const success = req.flash('success') || '';
      const error = req.flash('error') || '';
  
      res.render('admin', {
        req: req,
        title: 'Admin Panel',
        showNavbar: true,
        products: products,
        orders: orders,
        users: users,
        cart: cart,
        success: success,
        error: error,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      req.flash('error', 'Unable to load products.');
    }
  });

  
  router.post('/add-product', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image,
    });
    await product.save();
    req.flash('success', 'Product added successfully!');
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error adding product!');
    res.redirect('/admin');
  }
});

module.exports = router;