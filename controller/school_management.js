const db = require('../config/db')
const fs = require('fs')
module.exports = {
    uploadFeeds: async (req, callback) => {
        try {
            if (await db['user'].findById(req.user)) {
                const newFeed = await db['feeds']({ ...req.body, userId: req.user })
                newFeed.save()
                    .then(async feed => {
                        callback(200, "Feed Uploaded", feed)
                    })
                    .catch(error => {
                        callback(500, error.message, error);
                    })
            } else {
                callback(400, "Only school allowed to upload feeds", {})
            }

        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },

    deleteFeed: async (req, callback) => {
        try {
            console.log(req.body, req.query)
            if (req.body.feedId) {
                let feedByUser = await db['feeds'].findOne({ id: req.body.feedId, userId: req.user })
                console.log("feed id and user id ", req.body.feedId, req.user)
                console.log("Title of feed ", feedByUser?.title)
                if (feedByUser) {
                    let deleteFeed = await db['feeds'].findByIdAndDelete(req.body.feedId)
                    callback(200, "Feed Deleted", {})
                } else {
                    callback(400, "User is not allowed to delete the feed", {})
                }
            } else {
                callback(200, "Feed Deleted", {})
            }

        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },

    updateFeeds: async (req, callback) => {
        try {
            db['feeds'].findByIdAndUpdate(req.params.feedid, req.body)
                .then(user => {
                    callback(200, "Feed updated sucessfully")
                })
                .catch(error => {
                    callback(500, error.message, error)
                })

        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },

    getFeeds: async (req, callback) => {
        try {
            console.log(req.query)
            let feeds = await db['feeds'].find({ school_code: req.query.school_code })
                .populate([
                    {
                        path: 'userId', select: {
                            full_name: 1,
                            mobileNo: 1,
                            role: 1,
                            lat: 1,
                            long: 1,
                            bus_number: 1,
                            school_code: 1
                        }
                    },
                    {
                        path: 'comments',
                        select: {
                            _id: 1,
                            comment: 1,
                        }, populate: [{
                            path: 'userId',
                            model: 'User',
                            select: {
                                full_name: 1,
                                mobileNo: 1,
                                role: 1,
                                lat: 1,
                                long: 1,
                                bus_number: 1,
                                school_code: 1
                            }
                        }]
                    },
                    {
                        path: 'comments.userId', select: {
                            _id: 1,
                            full_name: 1,
                            mobileNo: 1,
                            role: 1,
                            lat: 1,
                            long: 1,
                            bus_number: 1,
                            school_code: 1
                        }
                    },
                    {
                        path: 'comments.schoolId', select: {
                            _id: 1,
                            school_code: 1,
                            mobileNo: 1,
                            role: 1,
                            school_name: 1,
                            school_address: 1,
                            is_active: 1
                        }
                    }]).lean()
            for (let feed of feeds) {
                let isLiked = await db['likes'].findOne({ feedId: feed._id, userId: req.user })
                console.log(isLiked)
                if (isLiked) {
                    feed['isLikedByUser'] = true
                } else {
                    feed['isLikedByUser'] = false
                }


            }
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
            let feedLiked = await db['likes'].findOne({
                feedId: req.body.feedId,
                userId: req.user
            })
            if (feedLiked) {
                callback(200, "Already Liked")
            } else {
                db['likes'].create({
                    feedId: req.body.feedId,
                    userId: req.user
                })
                db['feeds'].findByIdAndUpdate(req.body.feedId, { $inc: { like_count: 1 } })
                    .then(user => {
                        callback(200, "Feed Liked")
                    })
                    .catch(error => {
                        callback(500, error.message, error)
                    })
            }

        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },

    removeFeedLike: async (req, callback) => {
        try {
            let feedLiked = await db['likes'].findOne({
                feedId: req.body.feedId,
                userId: req.user
            })
            if (feedLiked) {
                await feedLiked.delete();
                db['feeds'].findByIdAndUpdate(req.body.feedId, { $inc: { like_count: -1 } })
                    .then(user => {
                        callback(200, "Removed")
                    })
                    .catch(error => {
                        callback(500, error.message, error)
                    })

            } else {

                callback(200, "You haven't liked")
            }
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },

    addComments: async (req, callback) => {
        try {
            let comment = {
                comment: req.body.comment,
                feedId: req.body.feedId,
                userId: req.user
            }

            let newComment = new db['comment'](comment);
            newComment = await newComment.save();

            db['feeds'].findByIdAndUpdate(req.body.feedId, {
                $push: { "comments": newComment.id }
            })
                .then((feed) => {
                    console.log(feed)
                    callback(200, "Comment Added")
                })
                .catch(error => {
                    console.log("error comment : ", error)
                    callback(500, error.message, error)
                })
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },
}