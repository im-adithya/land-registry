const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adminSchema = new Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    aadhaar: { type: String, required: true },
    citytown: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true }
}, {
    timestamps: true,
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;