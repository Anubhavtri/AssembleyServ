const db = require('../config/db')
const fs = require('fs')
module.exports = {
    uploadFeeds: async (req, callback) => {
        try {
            const newFeed = await db['feeds']({ ...req.body, schoolId: req.user })
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
            console.log(req.query)
            let feeds = await db['feeds'].find({ schoolId: req.query.schoolId })
                .populate({
                    path: 'schoolId', select: {
                        "school_code": 1,
                        "school_name": 1,
                        "school_address": 1
                    }
                })
            callback(200, "Feeds ", feeds);
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },
    addFeedView: async (req, callback) => {
        try {
            console.log(req.body)
            db['feeds'].findByIdAndUpdate(req.body.feedId, { $inc: { view_count: 1 } })
                .then(user => {
                    callback(200, "view updated")
                })
                .catch(error => {
                    callback(500, error.message, error)
                })
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },
    addFeedLike: async (req, callback) => {
        try {
            db['feeds'].findByIdAndUpdate(req.body.feedId, { $inc: { like_count: 1 } })
                .then(user => {
                    callback(200, "Feed Liked")
                })
                .catch(error => {
                    callback(500, error.message, error)
                })
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },
}