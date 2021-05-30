const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String },
    address: { type: String, required: true },
    aadhaar: { type: String },
    email: { type: String },
    phone: { type: String },
    requestsrec: { type: Array },
    requestssent: { type: Array }
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;