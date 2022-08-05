const managementController = require('../controller/school_management');
const auth = require('../middleware/auth')
module.exports = (router, app) => {

    router.route('/upload-feed')
        .post(auth, (req, res) => {
            managementController.uploadFeeds(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/feeds')
        .get(auth, (req, res) => {
            managementController.getFeeds(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/feeds/:feedid')
        .put(auth, (req, res) => {
            managementController.updateFeeds(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/delete-feed')
        .delete(auth, (req, res) => {
            managementController.deleteFeed(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/add-view')
        .post(auth, (req, res) => {
            managementController.addFeedView(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/add-like')
        .post(auth, (req, res) => {
            managementController.addFeedLike(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/remove-like')
        .post(auth, (req, res) => {
            managementController.removeFeedLike(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/comment')
        .post(auth, (req, res) => {
            managementController.addComments(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
        .delete(auth, (req, res) => {
            managementController.deleteComments(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })


}