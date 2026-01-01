const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    role: { type: String, default: 'Customer' },
    profileImage: { type: String, default: '' },
    phoneNumber: { type: String },
    addresses: [{
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    }],
    paymentMethods: [{
        cardType: { type: String, required: true },
        last4: { type: String, required: true },
        expiryDate: { type: String, required: true },
        holderName: { type: String, required: true },
        encryptedData: { type: String, required: true } // Simulation string
    }]
}, {
    timestamps: true
});

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
