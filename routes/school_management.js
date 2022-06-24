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
}