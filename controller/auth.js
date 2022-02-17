const db = require('../config/db')

module.exports = {
    login: async (req, callback) => {
        try {
            let user = req.body;
            if (user.mobileNo.toString().length == 10) {
                let existUser = await db['user'].findOne({ mobileNo: user.mobileNo })
                if (existUser) {
                    callback(200, "Login Successful", existUser)
                } else {
                    const newUser = new db['user'](req.body);
                    newUser.mobileNo = user.mobileNo;
                    newUser.role = user.role ? user.role : 2;
                    let registerUser = await newUser.save()
                    callback(200, "Login Successful", registerUser)
                }
            } else {
                console.log("Number is not 10 digit");
                callback(500, "Please enter valid Number", {});
            }

        } catch (error) {
            console.log(error);
            callback(500, error.message, error);
        }

    },
    updateLatLong: async (req, callback) => {
        try {
            db['user'].findByIdAndUpdate(req.params.userid, req.body)
                .then(user => {
                    callback(200, "Lat/Long updated sucessfully")
                })
                .catch(error => {
                    callback(500, error.message, error)
                })
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },
    getLatLong: async (req, callback) => {
        try {
            let user = await db['user'].findById(req.params.userid);
            callback(200, "User Lat/Long", user);
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },
    getAllDrivers: async (req, callback) => {
        try {
            let query = {
                role: 2
            }
            
            let users = await db['user'].find(query);
            
            callback(200, "Drivers", users);
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    }
}