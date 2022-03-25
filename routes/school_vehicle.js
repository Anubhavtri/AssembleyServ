const schoolController = require('../controller/school_vehicle');
const auth = require('../middleware/auth')
module.exports = (router, app) => {

    router.route('/schools')
        .post((req, res) => {
            schoolController.insertSchool(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
        .get((req, res) => {
            schoolController.getAllSchools(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
    router.route('/vehicles')
        .post((req, res) => {
            schoolController.insertVehicle(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
        .get((req, res) => {
            schoolController.getAllBus(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
    router.route('/link-vehicle')
        .post((req, res) => {
            schoolController.linkBusAndSchool(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
    router.route('/school-vehicles')
        .get((req, res) => {
            schoolController.getBusOfSchools(req, (status, message, data) => {
                res.status(status).json({ message: message, data: data });
            })
        })
}