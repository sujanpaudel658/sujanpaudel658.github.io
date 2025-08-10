const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function () { return this.provider === 'local'; } },
    bio: { type: String, default: '' },
    photo: { type: String, default: '' },
    username: { type: String },
    gender: { type: String, default: '' },
    phone: { type: String, default: '' },
    profileCompleted: { type: Boolean, default: false },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, sparse: true, unique: true },
    updatedAt: { type: Date, default: Date.now }
});

const SignupModel = mongoose.model('signup', signupSchema);

module.exports = SignupModel;
