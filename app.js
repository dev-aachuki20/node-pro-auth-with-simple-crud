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
const i18n = require('i18n');
const app = express();
const port = 5000;

// Connect to MongoDB
connectDB();

// Set up i18n configuration
i18n.configure({
    locales: ['en', 'es', 'fr'],
    defaultLocale: 'en',
    directory: path.join(__dirname, 'locales'),
    objectNotation: true,
    cookie: 'lang',
    queryParameter: 'lang',
    autoReload: true,
    syncFiles: true
});

// Use Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser('secret'));
app.use(flash());
app.use(toastr());
app.use(i18n.init);


app.use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 3600000
    }
}));


app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.toasts = req.toastr.render();
    res.locals.title = "Node App";
    res.locals.lang = req.cookies.lang;
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
app.use('/profile', profileRoutes); // Profile routes

// Route to change language (using the 'lang' query parameter or a cookie)
app.get('/set-language/:lang', (req, res) => {
    const lang = req.params.lang;
    req.session.language = lang;
    i18n.setLocale(req, lang);
    res.cookie('lang', lang);
    const redirectUrl = req.get('Referrer') || '/';
    res.redirect(redirectUrl);
});


// Listen port
app.listen(port, () => {
    console.log(`Project is running on port: ${port}`);
})



