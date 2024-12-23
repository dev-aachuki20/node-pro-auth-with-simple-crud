const express = require('express');
const User = require('../models/user');
const { requireAuth } = require('../middleware');
const router = express.Router();
const toastr = require('express-toastr');
const { status } = require('../constants/constant');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images/uploads/'));  // specify the folder where images will be stored
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));  // generate a unique file name.
    }
});

const upload = multer({ storage: storage });


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
router.post('/update', upload.single('profile_image'), async function (req, res) {
    try {
        const userId = req.session.userId;
        const data = req.body;
        const updatedData = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            mobile_number: data.mobile_number
        };

        // If a new profile image is uploaded
        if (req.file) {
            const user = await User.findById(userId);
            if (user.image) {
                fs.unlink(path.join(__dirname, '../public/images/uploads/', user.image), (err) => {
                    if (err) console.error('Error deleting old image:', err);
                });
            }

            // Save the new image path to the database
            updatedData.image = req.file.filename;
        }

        // Update the user in the database
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        if (!updatedUser) {
            return res.status(404).send('User not found.');
        }

        req.session.user = updatedUser;
        req.toastr.success('Profile updated successfully.');
        return res.redirect('/home');
    } catch (error) {
        console.log(`Error during profile update: ${error}`);
        req.toastr.error(`An error occurred. Please try again. ${error}`);
        return res.redirect('/profile');
    }
});


module.exports = router;