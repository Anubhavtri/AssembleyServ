const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchoolSchema = Schema({
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
    created_at: {
        type: Date,
        default: Date.now
    }
});


const School = module.exports = mongoose.model('School', SchoolSchema);