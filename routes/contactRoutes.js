const express = require('express');
const Contact = require('../models/contact');
const { requireAuth } = require('../middleware');
const toastr = require('express-toastr');
const router = express.Router();

// Create contact form page.
router.get('/create', function (req, res) {
    try {
        res.locals.title = "Contact Page";
        return res.render('contact/create');
    } catch (error) {
        console.error('Error fetching  contact:', error);
        res.status(500).render('error', { message: 'There was an error fetching the contact form.' });
    }
})

// Store contact details.
router.post('/', async (req, res) => {
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
router.get('/', requireAuth, async function (req, res) {
    try {
        const contacts = await Contact.find();
        if (!contacts) {
            res.status(404).send('Zero records found')
        }
        res.locals.title = "Contact Page";
        return res.render('contact/index', { contacts: contacts });
    } catch (error) {
        console.error('Error fetching  contact:', error);
        res.status(500).send('Error fetching the contact details.');
    }
})

// Fetch single record by id
router.get('/:id', async function (req, res) {
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
router.get('/:id/edit', async function (req, res) {
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
router.post('/:id/update', async function (req, res) {
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
router.post('/:id/delete', async function (req, res) {
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

module.exports = router;