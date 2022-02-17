const authController = require('../controller/auth');
module.exports = (router, app) => {
    router.route('/login')
        .post((req, res) => {
            authController.login(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
    router.route('/lat-long/:userid')
        .put((req, res) => {
            authController.updateLatLong(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
    router.route('/lat-long/:userid')
        .get((req, res) => {
            authController.getLatLong(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
    router.route('/drivers')
        .get((req, res) => {
            authController.getAllDrivers(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
}