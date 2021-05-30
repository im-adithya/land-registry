const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const propertySchema = new Schema({
    address: { type: String, required: true },
    surveynumber: { type: String, required: true },
    type: { type: String, required: true },
    citytown: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    marketvalue: { type: String, required: true },
    registeredby: { type: String, required: true },
    sale: { type: Boolean, required: true },
    approved: { type: Boolean }
}, {
    timestamps: true,
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;