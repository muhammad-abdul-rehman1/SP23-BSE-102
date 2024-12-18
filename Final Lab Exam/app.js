const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('connect-flash');

const app = express();
const authMiddleware = require('./middleware/auth');

const session = authMiddleware.sessionConfig(app);

const isLoggedIn = authMiddleware.isLoggedIn;
const isAdmin = authMiddleware.isAdmin;

app.use(flash());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/authenticationApp')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));


// Middleware
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/layouts'));

// Define a layout
app.set('layout', 'main');

const indexRoutes = require('./routes/index');
const cartRoutes = require('./routes/cart');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');

app.use('/', indexRoutes);
app.use('/cart', cartRoutes);
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);


app.post('/checkout', isLoggedIn, async (req, res) => {
  const success = req.flash('success') || '';
  const error = req.flash('error') || '';
  res.render('checkout', { req: req, title: 'Checkout', showNavbar: true, success: success, error: error, name: req.session.user.firstName });
});

// Define routes
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/home');
  } else {
  
    res.render('login', { title: 'Login', showNavbar: false });
  }
});

app.get('/home', isLoggedIn, (req, res) => {
  const success = req.flash('success') || '';
  res.render('index', { req: req, title: 'Home', showNavbar: true, success: success, name: req.session.user.firstName });
});

app.get('/signup', (req, res) => {
  if (req.session.user) {
    res.redirect('/login');
  } else {
    res.render('signup', { title: 'SignUp', showNavbar: false });
  }
});


app.listen(8000, () => {
  console.log('Server started on port 8000');
});