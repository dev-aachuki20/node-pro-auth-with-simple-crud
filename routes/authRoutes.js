const express = require('express');
const User = require('../models/user');
const { redirectIfAuthenticated } = require('../middleware');
const router = express.Router();
const toastr = require('express-toastr');
const { status } = require('../constants/constant');

// Display login form
router.get('/', redirectIfAuthenticated, function (req, res) {
    try {
        res.locals.title = "Login Page";
        return res.render('auth/login', { activePage: '/' });
    } catch (error) {
        res.status(500).render('error', { message: 'There was an error in signin.' });
    }
})

// Display login form
router.get('/login', redirectIfAuthenticated, function (req, res) {
    try {
        res.locals.title = "Login Page";
        return res.render('auth/login', { activePage: 'login' });
    } catch (error) {
        res.status(500).render('error', { message: 'There was an error in signin.' });
    }
})

// Login user
router.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            req.toastr.error('User does not exist.');
            return res.redirect('/login');
        }
        // Compare entered password with the stored hash
        const isMatch = await existingUser.comparePassword(password);
        if (!isMatch) {
            req.toastr.error('Invalid credentials.');
            return res.redirect('/login');
        }
        req.session.userId = existingUser._id.toString();
        req.session.user = existingUser;

        req.toastr.success('Login successfully.');
        return res.redirect('/home');
    } catch (error) {
        console.error(`There was an error in sign in: ${error}`);
        req.toastr.error('An error occurred. Please try again.');
        return res.redirect('/login');

        // res.status(500).render('error', { message: 'An unexpected error occurred. Please try again later.' });
    }
})

// Logout user
router.get('/logout', (req, res) => {
    try {
        // Set toastr message before destroying the session
        req.session.toastrMessage = { type: 'success', message: 'Logout successfully.' };

        // Now destroy the session
        req.session.destroy((err) => {
            if (err) {
                req.session.toastrMessage = { type: 'error', message: 'Failed to logout.' };
            }

            // Clear the session cookie
            res.clearCookie('connect.sid');

            // Redirect to login page after logging out
            return res.redirect('/login');
        });
    } catch (error) {
        req.session.toastrMessage = { type: 'error', message: 'An error occurred during logout.' };
        return res.redirect('/login');
    }
});

// Display signup form.
router.get('/signup', function (req, res) {
    try {
        res.locals.title = "Sign Up Page";
        return res.render('auth/register', {activePage: 'signup'});
    } catch (error) {
        res.status(500).render('error', { message: 'There was an error to open register form.' });
    }

})

// Store users or register users
router.post('/signup', async function (req, res) {
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
        req.toastr.success('Account created successfully. Please log in.');
        return res.redirect('/login');

    } catch (error) {
        req.toastr.error('An error occurred. Please try again.');
        return res.redirect('/signup');
    }
})

module.exports = router;