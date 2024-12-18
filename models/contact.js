const mongoose = require('mongoose');

// Define Schema.
const contactSchema = new mongoose.Schema(
    {
        name:
        {
            type: String,
            required: true
        },
        email:
        {
            type: String,
            required: true
        },
        message:
        {
            type: String,
            required: true
        },
    }, {
    timestamps: true
});

// create a model.
const Contact = mongoose.model('Contact', contactSchema);

// Export the model so it can be used in other files.
module.exports = Contact;