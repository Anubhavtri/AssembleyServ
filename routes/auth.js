const authController = require('../controller/auth');
const auth = require('../middleware/auth')
module.exports = (router, app) => {
    router.route('/register')
        .post((req, res) => {
            authController.signUp(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/login')
        .post((req, res) => {
            console.log("try to login")
            authController.login(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/lat-long/:userid')
        .put(auth, (req, res) => {
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
    router.route('/customer-notification')
        .post((req, res) => {
            authController.sendNotificationToCustomers(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/notifications')
        .get((req, res) => {
            authController.getSentNotifications(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/tracking')
        .get(auth, (req, res) => {
            authController.getBusTrackingDetails(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/driver-session-notificaion')
        .post(auth, (req, res) => {
            authController.sendSessionNotificationToCustomers(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })

    router.route('/end-driver-session')
        .post(auth, (req, res) => {
            authController.endDriverSession(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
}