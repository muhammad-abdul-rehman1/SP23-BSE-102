const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/User');


router.get('/login', (req, res) => {

  const success = req.flash('success') || '';
  const error = req.flash('error') || '';

    res.render('login', { 
      title: 'Login', 
      showNavbar: false,
      success: success,
      error: error,
    });
  });

// Signup Route
router.post('/signup', async (req, res) => {
    try {
      const { firstName, lastName, email, password, confirmPassword, isAdmin  } = req.body;
  
      // Check for missing fields
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        req.flash('error', 'All fields are required.');
        return res.render('signup', { 
          title: 'signup', 
          showNavbar: false, 
          error: req.flash('error') || '' 
        });
      }
  
      // Check if passwords match
      if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match');
        return res.render('signup', { 
          title: 'signup', 
          showNavbar: false, 
          error: req.flash('error') || '' 
        });
      }
  
          // Check if email already exists
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            req.flash('error', 'Email already in use.');
            return res.render('signup', { 
              title: 'signup', 
              showNavbar: false, 
              error: req.flash('error') || '' 
            });
          }
  
      // Create new user
      const role = isAdmin === 'admin' ? 'admin' : 'user';
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        role: role,
      });
  
      await user.save();
  
      req.flash('success', 'Account created successfully!');
      res.redirect('/login');
    } catch (error) {
      req.flash('error', 'Error during signup. Please try again later.');
      return res.render('signup', {
        title: 'signup', 
        showNavbar: false, 
        error: req.flash('error') || '' 
      });
    }
  });
  
  // Login Route
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (user && user.password === password) {
        // Store user information in the session
        req.session.user = {
          _id: user._id,
          firstName: user.firstName,
          email: user.email,
          role: user.role,
        };
  
        req.flash('success', 'Login Successful...');
        res.redirect('/home');
      } else if (user && user.password !== password) {
        req.flash('error', 'Invalid password provided');
        return res.render('login', { 
          title: 'Login',
          error: req.flash('error') || '' 
        });
      } else {
        req.flash('error', 'E-mail not found');
        return res.render('login', { 
          title: 'Login',
          error: req.flash('error') || '' 
        });
      }
    } catch (error) {
      console.error(error);
      req.flash('error', 'Error during login. Please try again.');
      return res.render('login', { 
        title: 'Login',
        error: req.flash('error') || '' 
      });
    }
  });
  
  // Logout route
  router.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.redirect('/home');
      }
  
      // Clear the session cookie
      res.clearCookie('connect.sid'); // 'connect.sid' is the default cookie name for express-session
      
      // Redirect to the login page
      res.redirect('/');
    });
  });


module.exports = router;