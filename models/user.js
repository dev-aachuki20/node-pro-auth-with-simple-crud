const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema(
    {
        first_name:
        {
            type: String,
            default: null,
            trim: true
        },
        last_name:
        {
            type: String,
            default: null,
            trim: true
        },
        email:
        {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: props => `${props.value} is not a valid email address!`
            },
        },
        password:
        {
            type: String,
            required: [true, 'Password is required']
        },
        mobile_number:
        {
            type: String,
            default: null
        },
        status:
        {
            type: Boolean,
            default: true
        },
        image: { type: String, default: null },
    }, {
    timestamps: true
});


// Hash password before saving user
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare entered password with stored hash
userSchema.methods.comparePassword = function (userPassword) {
    return bcrypt.compare(userPassword, this.password);
};

// create a model.
const User = mongoose.model('User', userSchema);
module.exports = User;