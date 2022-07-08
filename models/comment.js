const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CommentSchema = new Schema({
    comment: {
        type: String,
        default: ""
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


const Comment = mongoose.model('Comment', CommentSchema);
module.exports = {
    Comment,
    CommentSchema
}