const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const FeedsSchema = Schema({
    title: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    url: {
        type: String,
        default: ""
    },
    view_count: {
        type: Number,
        default: 0
    },
    like_count: {
        type: Number,
        default: 0
    },
    feed_type: {
        type: String,
        default: ""
    },
    schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'School'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});


const feeds = module.exports = mongoose.model('Feeds', FeedsSchema);