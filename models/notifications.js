const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const NotificationSchema = Schema({
    title: {
        type: String,
        default: ""
    },
    message: {
        type: String,
        default: ""
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});


const Notification = module.exports = mongoose.model('Notification', NotificationSchema);