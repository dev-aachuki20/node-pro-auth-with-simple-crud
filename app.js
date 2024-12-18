const express = require('express');
const Contact = require('./models/contact');
const User = require('./models/user');
const connectDB = require('./db/conn');
const { port } = require('./db/config');
const { status } = require('./constants/constant');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser')
const crypto = require('crypto');
const flash = require('connect-flash');
const toastr = require('express-toastr');
const app = express();


connectDB(); // Connect to MongoDB , call the function to connect to mongodb

// Use Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser('secret'));
app.use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 3600000
    }
}));
app.use(flash());
app.use(toastr());

const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        return res.redirect('/login');
    }
}

app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.toasts = req.toastr.render();

    if (req.session.toastrMessage) {
        const { type, message } = req.session.toastrMessage;
        req.toastr[type](message);
        delete req.session.toastrMessage;
    }
    next();
});

// Middleware to check if the user is already logged in
const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/home');
    }
    next();
};


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Login page
app.get('/', redirectIfAuthenticated, function (req, res) {
    try {
        res.render('auth/login');
    } catch (error) {
        res.status(500).render('error', { message: 'There was an error in signin.' });
    }
})

// Display login page
app.get('/login', redirectIfAuthenticated, function (req, res) {
    try {
        return res.render('auth/login');
    } catch (error) {
        res.status(500).render('error', { message: 'There was an error in signin.' });
    }
})

// login user
app.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            req.toastr.error('User not exist in database.');
            res.redirect('/login');
        }
        // Compare entered password with the stored hash
        const isMatch = await existingUser.comparePassword(password);
        if (!isMatch) {
            req.toastr.error('Invalid credentials.');
            return res.redirect('/login');
        } else {
            req.session.userId = existingUser._id.toString();
            req.session.user = existingUser;
            req.toastr.success('Login successfully.');
            return res.redirect('/home');
        }
    } catch (error) {
        console.error(`There was an error in sign in: ${error}`);
        // res.status(500).render('error', { message: 'An unexpected error occurred. Please try again later.' });
    }
})

// get register form.
app.get('/signup', function (req, res) {
    try {
        return res.render('auth/register');
    } catch (error) {
        res.status(500).render('error', { message: 'There was an error to open register form.' });
    }

})

// store Register users.
app.post('/signup', async function (req, res) {
    try {
        const { first_name, last_name, email, password, mobile_number } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.toastr.error('Email already registered. Please try to log in.');
            return res.redirect('/login');
        }
        const user = await User.create(
            {
                first_name,
                last_name,
                email,
                password,
                mobile_number,
                status: status.active,
            });
        req.toastr.success('Congrats!! Registered successfully');
        return res.redirect('/login');

    } catch (error) {
        console.log(`There was an error in sign in ${error}`);
    }
})

app.get('/logout', function (req, res) {
    try {
        req.session.toastrMessage = { type: 'success', message: 'Logout successfully.' };
        req.session.destroy((err) => {
            if (err) {
                req.session.toastrMessage = { type: 'error', message: 'Failed to logout.' };
            }
            return res.redirect('/login');
        });
    } catch (error) {
        console.log('Failed');
    }
})


app.get('/home', requireAuth, function (req, res) {
    try {
        res.render('index');
    } catch (error) {
        res.status(500).render('error', { message: 'There was an error in signin.' });
    }
})


// Create contact form page.
app.get('/contacts/create', function (req, res) {
    try {
        return res.render('contact/create');
    } catch (error) {
        console.error('Error fetching  contact:', error);
        res.status(500).render('error', { message: 'There was an error fetching the contact form.' });
    }
})

// Store contact details.
app.post('/contacts', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        await Contact.create({ name, email, message });
        req.toastr.success('Query sent successfully');
        return res.redirect('/contacts')
    } catch (error) {
        console.error('Error saving contact:', error);
    }
});

// Fetch all records for contact
app.get('/contacts', requireAuth, async function (req, res) {
    try {
        const contacts = await Contact.find();
        if (!contacts) {
            res.status(404).send('Zero records found')
        }
        res.render('contact/index', { contacts: contacts });
    } catch (error) {
        console.error('Error fetching  contact:', error);
        res.status(500).send('Error fetching the contact details.');
    }
})

// Fetch single record by id
app.get('/contacts/:id', requireAuth, async function (req, res) {
    try {
        id = req.params.id;
        const contactById = await Contact.findById(id);
        if (!contactById) {
            res.status(404).send('Sorry!! contact not found');
        }
        res.render('contact/show', { contact: contactById });
    } catch (error) {
        console.error('Error fetching  contact:', error);
        res.status(500).send('Error fetching the contact details.');
    }
})

// Edit contact by id
app.get('/contacts/:id/edit', requireAuth, async function (req, res) {
    try {
        const id = req.params.id;
        const contact = await Contact.findById(id);
        res.render('contact/edit', { contact: contact });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).send('Error deteting the contact details.');
    }
});

// Update contact by id
app.post('/contacts/:id/update', requireAuth, async function (req, res) {
    try {
        const id = req.params.id;
        const { name, email, message } = req.body;
        const contact = await Contact.findByIdAndUpdate(id, { name, email, message });
        if (!contact) {
            req.toastr.error('Sorry!! contact not found');
            return res.redirect('/contacts');
        }
        req.toastr.success('Record updated successfully')
        return res.redirect('/contacts');
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).send('Error deteting the contact details.');
    }
});

// Delete single contact by id
app.post('/contacts/:id/delete', requireAuth, async function (req, res) {
    try {
        const id = req.params.id;
        const contactDelete = await Contact.findByIdAndDelete(id);
        if (!contactDelete) {
            res.status(404).send('Sorry!! contact not found');
        }
        req.toastr.success('Record deleted successfully');
        return res.redirect('/contacts');
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).send('Error deteting the contact details.');
    }
});



// Listen port
app.listen(port, () => {
    console.log(`Project is running on port: ${port}`);
})



