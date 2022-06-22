const managementController = require('../controller/school_management');
const auth = require('../middleware/auth')
module.exports = (router, app) => {

    router.route('/upload-feed')
        .post((req, res) => {
            managementController.uploadFeeds(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/feeds')
        .get((req, res) => {
            managementController.getFeeds(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
}