const db = require('../config/db')
const FCM = require('fcm-node')
const fcm = new FCM('AAAAErYwE8A:APA91bFLtFKA3V5cf0QQroy-jYoLM6jOYPY95vHDfOhv-YUxE91FzsvDdvdUoHIkwOPNPujxXDf7Xxk4pvo7jx1giznYBoGknnJ4oc8CW3c5yKGbevALtu2SAWcpL5XM_GfOJOzowAMK');
module.exports = {
    login: async (req, callback) => {
        try {
            let user = req.body;
            if (user.mobileNo.toString().length == 10) {
                let existUser = await db['user'].findOne({ mobileNo: user.mobileNo });
                console.log(!existUser.platform, !existUser.device_token)
                if (!existUser.platform || !existUser.device_token) {
                    let tempObj = {}
                    tempObj.platform = user.platform;
                    tempObj.device_token = user.device_token;
                    db['user'].findByIdAndUpdate(existUser.id, tempObj)
                        .then(user => {
                            callback(200, "Login Successful", user)
                        })
                        .catch(error => {
                            callback(500, error.message, error)
                        })
                }
                else if (existUser) {
                    callback(200, "Login Successful", existUser)
                } else {
                    const newUser = new db['user'](req.body);
                    newUser.mobileNo = user.mobileNo;
                    newUser.role = user.role ? user.role : 2;
                    newUser.platform = user.platform;
                    newUser.device_token = user.device_token;
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
    },
    sendNotificationToCustomers: async (req, callback) => {
        try {
            let query = {
                role: 2,
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