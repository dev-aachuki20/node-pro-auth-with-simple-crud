const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser')
const crypto = require('crypto');
const toastr = require('express-toastr');
const connectDB = require('./db/config');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const profileRoutes = require('./routes/profileRoutes');
const { requireAuth } = require('./middleware');
const flash = require('connect-flash');
const app = express();
const port = 5000;

// Connect to MongoDB
connectDB();

// Use Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser('secret'));
app.use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false, // Prevent saving empty sessions
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 3600000 // 1 hour in milliseconds.
    }
}));
app.use(flash());
app.use(toastr());

app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.toasts = req.toastr.render();
    res.locals.title = "Node App";
    if (req.session.toastrMessage) {
        const { type, message } = req.session.toastrMessage;
        req.toastr[type](message);
        delete req.session.toastrMessage;
    }
    next();
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Home route.
app.get('/home', requireAuth, function (req, res) {
    try {
        res.locals.title = "Home Page";
        return res.render('index', { activePage: 'home' });
    } catch (error) {
        res.status(500).render('error', { message: 'There was an error in signin.' });
    }
})

// Authentication routes
app.use('/', authRoutes);
app.use('/login', authRoutes);
app.use('/signup', authRoutes);
app.use('/logout', authRoutes);

app.use('/contacts', contactRoutes); // Contacts routes
app.use('/profile', profileRoutes); // Profile routes.

// Listen port
app.listen(port, () => {
    console.log(`Project is running on port: ${port}`);
})



