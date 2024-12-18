const express = require('express');
const router = express.Router({ mergeParams: true });
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const isLoggedIn = authMiddleware.isLoggedIn;

router.get('/', async (req, res) => {

  if (!req.session.user) {
    req.flash('error', 'Please login to access your cart.');
    res.render('login');
    return;
  }
  
  const success = req.flash('success') || '';
  const error = req.flash('error') || '';

  const userId = req.session.user._id;

  const cart = await Cart.findOne({ userId });

  const cartItems = cart ? cart.products : [];
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const orders = await Order.find({ user: userId }).populate({
    path: 'products',
    model: 'Product',
  });
  
  res.render('cart', { req: req, title: 'Cart', orders: orders, cart: cartItems, total: total, showNavbar: true, success: success, error: error });
});

router.post('/add/:id', isLoggedIn, async (req, res) => {
  const productId = req.params.id;
  const userId = req.session.user._id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/products');
    }

    // Find the user's cart or create one if it doesn't exist
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    // Check if product is already in the cart
    const existingProduct = cart.products.find(
      (item) => item.productId.toString() === productId
    );

    if (existingProduct) {
      existingProduct.quantity += 1; // Increment quantity if already exists
    } else {
      cart.products.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
      });
    }

    await cart.save();
    req.flash('success', `${product.name} added to cart.`);
    res.redirect('/products');
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).send('Error adding product to cart.');
  }
});

router.post('/remove/:id', isLoggedIn, async (req, res) => {
    const productId = req.params.id;
    const userId = req.session.user._id;
  
    const orders = await Order.find({ user: userId }).populate({
      path: 'products',
      model: 'Product',
    });
  
    try {
      const cart = await Cart.findOne({ userId });
  
      if (cart) {
        cart.products = cart.products.filter(
          (item) => item.productId.toString() !== productId
        );
  
        await cart.save();
        req.flash('success', 'Product removed from cart.');
      } else {
        req.flash('error', 'No cart found for this user.');
      }
  
      res.render('cart', {
        req: req,
        title: 'Cart',
        cart: cart ? cart.products : [],
        total: cart ? cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0) : 0,
        showNavbar: true,
        orders: orders,
        success: req.flash('success') || '',
        error: req.flash('error') || '',
      });
    } catch (error) {
      console.error('Error removing product from cart:', error);
      res.status(500).send('Error removing product from cart.');
    }
  });

  router.post('/order', isLoggedIn, async (req, res) => {
    try {
      const userId = req.session.user._id;
      const cart = await Cart.findOne({ userId });
      let cartItems = cart ? cart.products : [];
  
      const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
      const order = new Order({
        user: userId,
        products: cartItems,
        total: total,
        address: {
          personName: req.body.personName,
          street: req.body.street,
          city: req.body.city,
          postalCode: req.body.postalCode,
        },
        orderDate: new Date(),
      });
  
      await order.save().then(() => {
        cartItems = [];
        req.session.cart = [];
        req.session.total = 0;
      });
  
      const orders = await Order.find({ user: userId }).populate({
        path: 'products',
        model: 'Product',
      });
  
      await Cart.updateOne({ userId }, { $set: { products: []} });
  
      req.flash('success', 'Order placed successfully! Please pay cash on delivery.');
      res.render('cart', {
        req: req,
        title: 'Cart',
        cart: cartItems,
        orders: orders,
        success: req.flash('success'),
        total: total,
        showNavbar: true,
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Error placing order!');
      res.redirect('/cart');
    }
  });

module.exports = router;