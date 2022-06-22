const db = require('../config/db')
const fs = require('fs')
module.exports = {
    uploadFeeds: async (req, callback) => {
        try {
            const newFeed = await db['feeds'](req.body)
            newFeed.save()
                .then(async feed => {
                    callback(200, "Feed Uploaded", feed)
                })
                .catch(error => {
                    callback(500, error.message, error);
                })
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },
    getFeeds: async (req, callback) => {
        try {
            let feeds = await db['feeds'].find()
                .populate({ path: 'userId' });
            callback(200, "Feeds ", feeds);
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },
}