 const mongoose = require("mongoose");

// ==========================================
// DELIVERY ADDRESS SCHEMA
// ==========================================

const deliveryAddressSchema = new mongoose.Schema({

    // LOGIN EMAIL
    email: {
        type: String,
        required: true
    },

    // FULL NAME
    fullName: {
        type: String,
        required: true
    },

    // MOBILE NUMBER
    mobile: {
        type: String,
        required: true
    },

    // HOUSE / FLAT / BUILDING
    house: {
        type: String,
        required: true
    },

    // AREA / village
    area: {
        type: String,
        required: true
    },

    // CITY / TOWN
    city: {
        type: String,
        required: true
    },

    // STATE
    state: {
        type: String,
        required: true
    },

    // PIN CODE
    pincode: {
        type: String,
        required: true
    },

    // LANDMARK
    landmark: {
        type: String,
        default: ""
    },

    // GPS LATITUDE
    latitude: {
        type: Number,
        default: null
    },

    // GPS LONGITUDE
    longitude: {
        type: Number,
        default: null
    },

    // COMPLETE ADDRESS
    address: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});


// ==========================================
// EXPORT MODEL
// ==========================================

module.exports =
    mongoose.model(
        "DeliveryAddress",
        deliveryAddressSchema
    );