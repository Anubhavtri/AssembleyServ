const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LikeSchema = new Schema({
    isLiked: {
        type: Boolean,
        default: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    feedId:{
        type: Schema.Types.ObjectId,
        ref: 'Feeds'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const likes = module.exports = mongoose.model('likes', LikeSchema);