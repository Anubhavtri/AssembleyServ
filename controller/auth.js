const db = require('../config/db')
const FCM = require('fcm-node')
const mobileNumberValidation = require('../config/common').mobileNumberValidation;
const fcm = new FCM('AAAAErYwE8A:APA91bFLtFKA3V5cf0QQroy-jYoLM6jOYPY95vHDfOhv-YUxE91FzsvDdvdUoHIkwOPNPujxXDf7Xxk4pvo7jx1giznYBoGknnJ4oc8CW3c5yKGbevALtu2SAWcpL5XM_GfOJOzowAMK');
const bcrypt = require('bcrypt');
const BcryptSalt = require('bcrypt-salt');
const bs = new BcryptSalt();
const crypto = require('crypto');


createAccessToken = async (data, callback) => {
    try {
        let token = await db['access_token'].findOneAndUpdate({
            userId: data.userId
        }, data,
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );
        console.log(token);
        return token

    } catch (error) {
        console.log("Error in create access token : ", error);
        return error
    }
}

createRefreshToken = async (data, callback) => {
    try {
        let token = await db['refresh_token'].findOneAndUpdate({
            userId: data.userId
        }, data,
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );
        console.log(token);
        // callback(token)
        return token
    } catch (error) {
        console.log("Error in create refresh token : ", error);
        // callback(error);
        return error
    }
}

createToken = (userId, role) => {
    const access_token = crypto.randomBytes(64).toString('hex');
    const refresh_token = crypto.randomBytes(64).toString('hex');
    createAccessToken({
        token: access_token,
        expire_date: new Date(Date.now() + (300 * 24 * 3600000)).toString(),
        userId: userId,
        client_id: null
    })
    createRefreshToken({
        token: refresh_token,
        expire_date: new Date(Date.now() + (300 * 24 * 3600000)).toString(),
        userId: userId,
        client_id: null
    });
    return { access_token, refresh_token, userId, role }
}

revokeToken = async (token) => {
    try {
        let refreshToken = await this.refreshRepository.findOne({ where: { token: token } });
        console.log(" <<<<<<<<<<<<<<<<<< Grant type Refresh Token >>>>>>>>>>>>>>> ", token);
        console.log(refreshToken);
        return refreshToken
    } catch (error) {
        console.log(`Error in revoke token : ${error}`)
    }
}

module.exports = {
    login: async (req, callback) => {
        try {
            let user = req.body;
            if (user.grant_type && user.grant_type == "refresh") {
                let refresh_token = await db['refresh_token'].findOne({ token: user.refresh_token })
                console.log("****************** refresh token ****************", refresh_token)
                if (refresh_token) {
                    let userEmail = await db['user'].findById(refresh_token.userId)
                    let userDetails = {
                        id: userEmail.id,
                        mobileNo: userEmail.mobileNo,
                        full_name: userEmail.full_name,
                        lat: userEmail.lat,
                        long: userEmail.long,
                        bus_number: userEmail.bus_number,
                        school_code: userEmail.school_code,
                        ...createToken(userEmail.id, userEmail.role)
                    }
                    callback(200, "Login Successfull", userDetails)
                } else {
                    callback(404, "Token Expired")
                }
            } else {
                let userEmail = await db['user'].findOne({ mobileNo: user.mobileNo });
                console.log(userEmail)
                if (userEmail == null) {
                    callback(404, 'Mobile Number ' + req.body.mobileNo + ' not found in db')
                } else {
                    if (user.password) {
                        if (await bcrypt.compare(user.password, userEmail.password)) {
                            let userDetails = {
                                id: userEmail.id,
                                mobileNo: userEmail.mobileNo,
                                full_name: userEmail.full_name,
                                lat: userEmail.lat,
                                long: userEmail.long,
                                bus_number: userEmail.bus_number,
                                school_code: userEmail.school_code,
                                ...createToken(userEmail.id, userEmail.role)
                            }
                            callback(200, "Login Successfull", userDetails)
                        } else {
                            callback(404, "Invalide Credentials")
                        }
                    } else {
                        callback(404, "Invalide Credentials")
                    }
                }
            }
        } catch (error) {
            console.log(error);
            callback(500, error.message, error);
        }

    },
    signUp: async (req, callback) => {
        try {
            let user = req.body;

            if (user.mobileNo) {
                console.log(user.mobileNo);
                var mobileValid = mobileNumberValidation(user.mobileNo);
                if (mobileValid != true) {
                    callback(400, mobileValid);
                } else {
                    let userExist = await db['user'].findOne({ mobileNo: user.mobileNo })
                    if (userExist && userExist.mobileNo == user.mobileNo) {
                        callback(400, 'User Already Exists');
                    } else {
                        let driverExist = await db['user'].findOne({ school_code: user.school_code, bus_number: user.bus_number })
                        if (driverExist) {
                            callback(400, 'Driver Already Exists For this Bus');
                        } else {
                            let hashPassword = '';
                            hashPassword = await bcrypt.hash(user.password, bs.saltRounds);

                            const newUser = new db['user'](req.body);
                            newUser.password = hashPassword;
                            // newUser.email = user.email.toLowerCase()
                            newUser.save()
                                .then(async (userDetails) => {

                                    callback(200, 'Sign-Up Successfull', { id: userDetails.id, mobileNo: userDetails.mobileNo, full_name: userDetails.full_name, lat: userDetails.lat, long: userDetails.long, bus_number: userDetails.bus_number, school_code: userDetails.school_code, ...createToken(userDetails.id, userDetails.role) });
                                })
                                .catch(err => {
                                    console.log(err);
                                    callback(500, 'error in saving user details');
                                });
                            // }
                        }

                    }

                }
            } else {
                callback(500, 'Please enter a valid mobile number');
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
    getBusTrackingDetails: async (req, callback) => {
        try {
            let school_code = req.query.school_code;
            let bus_number = req.query.bus_number;
            if (!school_code) {
                callback(400, "School Code Missing", {});
            }
            if (!bus_number) {
                callback(400, "Bus Number Missing", {});
            }


            let user = await db['user'].findOne({ id: req.user, school_code: school_code, bus_number: bus_number });
            if (user) {
                let driver = await db['user'].findOne({ role: 2, school_code: school_code, bus_number: bus_number, isSessionActive: true });
                if (driver)
                    callback(200, "Driver's Lat Long", { lat: driver.lat, long: driver.long });
                else
                    callback(200, "No Active Session Found", {});
            } else {
                callback(400, "Please Check (School Code/Bus Number)", user);
            }

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
    },
    sendNotificationToCustomers: async (req, callback) => {
        try {
            let query = {
                role: 1,
                platform: 'android'
            }
            let android_users = await db['user'].find(query);
            query.platform = 'ios'
            let ios_users = await db['user'].find(query);
            let regTokens = android_users.map(token => token.device_token);
            let regTokensIos = ios_users.map(token => token.device_token);
            console.log(regTokens, regTokensIos)
            let messageToSend = req.body.messageToSend
            let messageToSendTitle = req.body.messageToSendTitle
            var message = {};

            const newNotification = new db['notification']({
                title: messageToSendTitle,
                message: messageToSend
            });
            newNotification.save()
            if (regTokens && regTokens.length) {
                message = {
                    registration_ids: regTokens,
                    notification: {
                        title: messageToSendTitle,
                        body: messageToSend
                    }
                }
                fcm.send(message, function (err, response) {
                    if (err) {
                        // console.log("Something has gone wrong!");
                        console.log(err)
                        // callback(500, err.message, err)
                    } else {
                        console.log("Successfully sent with response: ", response);
                        // callback(200, "Successfully sent with response: ", response);
                    }
                })
            }
            if (regTokensIos && regTokensIos.length) {
                message = {
                    registration_ids: regTokensIos,
                    notification: {
                        title: messageToSendTitle,
                        body: messageToSend,
                        sound: "default"
                    }
                }
                fcm.send(message, function (err, response) {
                    if (err) {
                        // console.log("Something has gone wrong!");
                        console.log(err)
                        // callback(500, err.message, err)
                    } else {
                        console.log("Successfully sent with response: ", response);
                        // callback(200, "Successfully sent with response: ", response);
                    }
                })
            }
            callback(200, "Successfully sent", {});
        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },
    sendSessionNotificationToCustomers: async (req, callback) => {
        try {
            let access = await db['user'].findById(req.user);
            if (access.role == 2) {
                if (access.school_code == req.body.school_code && access.bus_number == req.body.bus_number) {
                    if (req.body.lat) {
                        access.lat = req.body.lat;
                    }
                    if (req.body.long) {
                        access.long = req.body.long;
                    }
                    access.isSessionActive = true;
                    await access.save();

                    let query = {
                        role: 1,
                        platform: 'android',
                        school_code: req.body.school_code,
                        bus_number: req.body.bus_number
                    }
                    let android_users = await db['user'].find(query);
                    query.platform = 'ios'
                    let ios_users = await db['user'].find(query);
                    let regTokens = android_users.map(token => token.device_token);
                    let regTokensIos = ios_users.map(token => token.device_token);
                    console.log(regTokens, regTokensIos)
                    let messageToSend = `Driver of Bus Number ${req.body.bus_number}, which working for School Code ${req.body.school_code} is started his/her session.`
                    let messageToSendTitle = "DRIVER SESSION STARTED"
                    var message = {};

                    const newNotification = new db['notification']({
                        title: messageToSendTitle,
                        message: messageToSend
                    });
                    newNotification.save()
                    if (regTokens && regTokens.length) {
                        message = {
                            registration_ids: regTokens,
                            notification: {
                                title: messageToSendTitle,
                                body: messageToSend
                            }
                        }
                        fcm.send(message, function (err, response) {
                            if (err) {
                                // console.log("Something has gone wrong!");
                                console.log(err)
                                // callback(500, err.message, err)
                            } else {
                                console.log("Successfully sent with response: ", response);
                                // callback(200, "Successfully sent with response: ", response);
                            }
                        })
                    }
                    if (regTokensIos && regTokensIos.length) {
                        message = {
                            registration_ids: regTokensIos,
                            notification: {
                                title: messageToSendTitle,
                                body: messageToSend,
                                sound: "default"
                            }
                        }
                        fcm.send(message, function (err, response) {
                            if (err) {
                                // console.log("Something has gone wrong!");
                                console.log(err)
                                // callback(500, err.message, err)
                            } else {
                                console.log("Successfully sent with response: ", response);
                                // callback(200, "Successfully sent with response: ", response);
                            }
                        })
                    }
                    callback(200, "Successfully sent", {});
                } else {
                    callback(400, "School Code/ Bus Number Missing", {})
                }
            } else {
                callback(400, "Parents are not allowed to start session ", {})
            }


        } catch (error) {
            console.error(error);
            callback(500, error.message, error);
        }
    },
    endDriverSession: async (req, callback) => {
        try {
            let driverSession = await db['user'].findById(req.user);
            driverSession.isSessionActive = false;
            await driverSession.save()
            callback(200, "Session ended successfully", driverSession);
        } catch (error) {
            console.log(error);
            callback(500, error.message, error);
        }
    },
    getSentNotifications: async (req, callback) => {
        try {
            let notifications = await db['notification'].find({});
            callback(200, "Notifications", notifications);
        } catch (error) {
            console.log(error);
            callback(500, error.message, error);
        }
    }
}