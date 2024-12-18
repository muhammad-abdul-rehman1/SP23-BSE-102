const express = require('express');
const router = express.Router({ mergeParams: true });
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const isLoggedIn = authMiddleware.isLoggedIn;

router.get('/', isLoggedIn, async (req, res) => {
    try {
      let query = {};
      if (req.query.search) {
        const search = req.query.search.toLowerCase();
        if (!isNaN(search)) {
          query = {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { price: { $gte: Number(search) } },
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
  
      const products = await Product.find(query).skip(skip).limit(limit);
  
      const count = await Product.countDocuments(query);
  
      res.render('products', {
        req: req,
        title: 'Products',
        showNavbar: true,
        products: products,
        cart: req.session.cart || [],
        success: req.flash('success') || '',
        error: req.flash('error') || '',
        pages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      req.flash('error', 'Unable to load products.');
    }
  });
  
  module.exports = router;