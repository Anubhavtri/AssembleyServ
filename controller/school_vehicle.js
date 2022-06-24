const db = require('../config/db')
module.exports = {
    insertSchool: async (req, callback) => {
        const newSchool = await db['school'](req.body)
        newSchool.save()
            .then(async school => {
                callback(200, "School added", school)
            })
            .catch(error => {
                callback(500, error.message, error);
            })
    },
    insertVehicle: async (req, callback) => {
        const newVehicle = await db['vehicle'](req.body)
        newVehicle.save()
            .then(async vehicle => {
                callback(200, "Vehicle added", vehicle)
            })
            .catch(error => {
                callback(500, error.message, error);
            })
    },
    linkBusAndSchool: async (req, callback) => {
        const newBusLink = await db['school_vehicle'](req.body)
        newBusLink.save()
            .then(async vehicleLink => {
                callback(200, "Vehicle Linked", vehicleLink)
            })
            .catch(error => {
                callback(500, error.message, error);
            })
    },
    getAllSchools: async (req, callback) => {
        try {
            let schools = await db['school'].find({ is_active: true })
            .select({ school_code: 1, school_name: 1, school_address: 1 })
            callback(200, "Schools", schools);
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },
    getAllBus: async (req, callback) => {
        try {
            let schools = await db['vehicle'].find({ is_active: true })
            callback(200, "Schools", schools);
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },
    getBusOfSchools: async (req, callback) => {
        try {
            let schools = await db['school_vehicle'].find({ school_id: req.query.school_id })
                .populate({ path: 'vehicle_id' });
            callback(200, "Schools Vehicle", schools);
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },
}