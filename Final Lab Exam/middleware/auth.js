const session = require('express-session');

module.exports = {
  sessionConfig: (app) => {
    app.use(
      session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
      })
    );
  },
  isLoggedIn: (req, res, next) => {
    if (!req.session.user) {
      return res.render('login', { title: 'Login', showNavbar: false });
    }
    next();
  },
  isAdmin: (req, res, next) => {
    if (req.session.user.role === 'admin') {
      next();
    } else {
      req.flash('error', 'You are not authorized to access this page!');
      res.redirect('/home');
    }
  },
};