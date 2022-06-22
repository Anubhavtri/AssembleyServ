const commonController = require('../controller/common');
const auth = require('../middleware/auth')
module.exports = (router, app) => {

    router.route('/upload-base64')
        .post((req, res) => {
            commonController.uploadBase64(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
}