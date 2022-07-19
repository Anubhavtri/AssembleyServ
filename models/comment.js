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
    schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'School'
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

const comment = module.exports = mongoose.model('Comment', CommentSchema);
// const comment = mongoose.model('Comment', CommentSchema);
// module.exports = {
//     comment,
//     CommentSchema
// }