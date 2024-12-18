// app.js
const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.use(express.static('public'));
app.use(expressLayouts);
app.set('views', './views/layouts'); // Set views directory to ./views
app.set('view engine', 'ejs'); // Set view engine to ejs

// Define a layout
app.set('layout', 'main');

// Define routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

app.listen(8080, () => {
  console.log('Server started on port 8080');
});