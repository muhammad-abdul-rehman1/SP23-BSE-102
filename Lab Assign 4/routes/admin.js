const express = require('express');
const router = express.Router({ mergeParams: true });
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');

const isLoggedIn = authMiddleware.isLoggedIn;
const isAdmin = authMiddleware.isAdmin;


router.get('/product-form', isLoggedIn, isAdmin, async (req, res) => {

  const categories = await Category.find();
  const success = req.flash('success') || '';
  const error = req.flash('error') || '';

  res.render('productform', {
    req: req,
    title: 'Add Product',
    showNavbar: true,
    categories: categories,
    success: success,
    error: error,
  });
});


router.get('/products-list', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const success = req.flash('success') || '';
    const error = req.flash('error') || '';

    if (!req.session.user.role === 'admin') {
      req.flash('error', 'Please login to access admin Panel.');
      res.render('login');
      return;
    }
    
    let query = {};
    if (req.query.search) {
      const search = req.query.search.toLowerCase();
      if (!isNaN(search)) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { price: { $gte: Number(search) } },
            { 'category.name': { $regex: search, $options: 'i' } }, // Search by category name
          ],
        };
      } else {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        };
      }
    }

    const limit = 5; // Number of products to display per page
    const page = req.query.page || 1; // Current page number
    const skip = (page - 1) * limit; // Number of products to skip

    const products = await Product.find(query).populate('category').skip(skip).limit(limit);
    const count = await Product.countDocuments(query);

    res.render('productslist', {
      req: req,
      title: 'Products',
      showNavbar: true,
      products: products,
      success: success,
      error: error,
      pages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    req.flash('error', 'Unable to load products.');
  }
});

router.post('/product/delete', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const productId = req.body.id;
    await Product.findByIdAndDelete(productId);
    req.flash('success', 'Product deleted successfully!');
    res.redirect('/admin/products-list');
  } catch (error) {
    console.error('Error deleting product:', error);
    req.flash('error', 'Unable to delete product.');
    res.redirect('/admin/products-list');
  }
});

router.get('/', isLoggedIn, isAdmin, async (req, res) => {

  if (!req.session.user) {
    req.flash('error', 'Please login to access your cart.');
    res.render('login');
    return;
  }

    try {
      // Fetch products from MongoDB
      const categories = await Category.find();
      const products = await Product.find();
      const orders = await Order.find().sort({ orderDate: -1 }).populate('user');
      const users = await User.find();
  
      // Pass the cart data (session.cart) to the view
      const cart = req.session.cart || [];
      const success = req.flash('success') || '';
      const error = req.flash('error') || '';
  
      res.render('admin', {
        req: req,
        title: 'Admin Panel',
        showNavbar: true,
        categories: categories,
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
  
  router.post('/product-form', isLoggedIn, isAdmin, async (req, res) => {
  try {

    const categories = await Category.find();

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image,
      category: req.body.category,
    });
    await product.save();
    req.flash('success', 'Product added successfully!');
    res.render('productform', {
      req: req,
      title: 'Add Product',
      showNavbar: true,
      categories: categories,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error adding product!');
    res.render('productform', {
      req: req,
      title: 'Add Product',
      showNavbar: true,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  }
});

// ...

// Category routes
router.get('/categories', isLoggedIn, isAdmin, async (req, res) => {
    try {
      const categories = await Category.find();
      const success = req.flash('success') || '';
      const error = req.flash('error') || '';

      res.render('category', {
        req: req,
        categories: categories,
        title: 'Categories',
        showNavbar: true,
        success: success,
        error: error,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      req.flash('error', 'Unable to load categories.');
    }
  });

  router.post('/categories', isLoggedIn, isAdmin, async (req, res) => {
    try {
      const category = new Category({
        name: req.body.name,
      });
      await category.save();
      req.flash('success', 'Category added successfully!');
      res.redirect('/admin/categories');
    } catch (error) {
      console.error('Error adding category:', error);
      req.flash('error', 'Unable to add category.');
      res.redirect('/admin/categories');
    }
  });

  router.post('/categories/delete', isLoggedIn, isAdmin, async (req, res) => {
    try {
      await Category.findByIdAndDelete(req.body.id);
      req.flash('success', 'Category deleted successfully!');
      res.redirect('/admin/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
      req.flash('error', 'Unable to delete category.');
    }
  });

module.exports = router;