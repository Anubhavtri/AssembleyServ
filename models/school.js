const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Role = require('../config/constant.js').Role
const SchoolSchema = Schema({
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
        default: Role.management
    },
    device_token: {
        type: String,
        default: ""
    },
    platform: {
        type: String,
        default: ""
    },
    school_code: {
        type: String,
        default: ""
    },
    school_name: {
        type: String,
        default: ""
    },
    school_address: {
        type: String,
        default: ""
    },
    is_active: {
        type: Boolean,
        default: true
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


const School = module.exports = mongoose.model('School', SchoolSchema);