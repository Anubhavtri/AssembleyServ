const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Role = require('../config/constant.js').Role
const UserSchema = Schema({
    full_name: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        default: ""
    },
    mobileNo: {
        type: Number,
        required: true,
    },
    role: {
        type: Number,
        default: Role.driver
    },
    lat: {
        type: Number,
        default: 0
    },
    long: {
        type: Number,
        default: 0
    },
    device_token: {
        type: String,
        default: ""
    },
    platform: {
        type: String,
        default: ""
    },
    bus_number: {
        type: String,
        default: ""
    },
    school_code: {
        type: String,
        default: ""
    },
    isSessionActive: {
        type: Boolean,
        default: false
    },
    verification_otp: {
        type: String,
        default: ""
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});


const User = module.exports = mongoose.model('User', UserSchema);