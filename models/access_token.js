const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AccessTokenSchema = Schema({
    token: {
        type: String,
        required: true
    },
    expiry: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});


const AccessToken = module.exports = mongoose.model('AccessToken', AccessTokenSchema);