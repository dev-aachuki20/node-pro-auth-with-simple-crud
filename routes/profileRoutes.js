const express = require('express');
const User = require('../models/user');
const { requireAuth } = require('../middleware');
const router = express.Router();
const toastr = require('express-toastr');
const { status } = require('../constants/constant');

// Get profile with values.
router.get('/', requireAuth, function (req, res) {
    try {
        if (req.session && req.session.user) {
            const profileData = req.session.user;
            res.locals.title = "Profile Page";
            return res.render('profile/index', { profileData: profileData, activePage: 'profile' });
        }
    } catch (error) {
        console.log(`Something want wrong to fetch profile ${error}`);
    }
})


// Update profile
router.post('/update', async function (req, res) {
    try {
        const userId = req.session.userId;
        if (!userId) {
            req.toastr.error('Session expired. Please log in again.');
            return res.redirect('/login');
        }

        const { first_name, last_name, mobile_number, status } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            req.toastr.error('User not found!!');
            return res.redirect('/login');
        }

        await User.updateOne(
            { _id: userId },
            {
                first_name, last_name, mobile_number, status: status || user.status,
            });

        const updatedUser = await User.findById(userId);
        req.session.user = updatedUser;
        req.toastr.success('Profile updated successfully.');
        return res.redirect('/home');
    } catch (error) {
        console.log(`Error during profile update: ${error}`);
        req.toastr.error('An error occurred. Please try again.');
        return res.redirect('/profile');
    }
});


module.exports = router;