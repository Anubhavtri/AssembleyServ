const db = require('../config/db')
const FCM = require('fcm-node')
const mobileNumberValidation = require('../config/common').mobileNumberValidation;
const fcm = new FCM('AAAAErYwE8A:APA91bFLtFKA3V5cf0QQroy-jYoLM6jOYPY95vHDfOhv-YUxE91FzsvDdvdUoHIkwOPNPujxXDf7Xxk4pvo7jx1giznYBoGknnJ4oc8CW3c5yKGbevALtu2SAWcpL5XM_GfOJOzowAMK');
const bcrypt = require('bcrypt');
const BcryptSalt = require('bcrypt-salt');
const bs = new BcryptSalt();
const crypto = require('crypto');
const Role = require('../config/constant.js').Role
const { request } = require('gaxios');
const contant = require('../config/constant');
const constant = require('../config/constant');

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
    let access_token_obj = {
        token: access_token,
        expire_date: new Date(Date.now() + (300 * 24 * 3600000)).toString(),
        userId: userId,
        client_id: null,
        role: role
    }
    let refresh_token_obj = {
        token: refresh_token,
        expire_date: new Date(Date.now() + (300 * 24 * 3600000)).toString(),
        userId: userId,
        client_id: null,
        role: role
    }
    // if(role == Role.management){
    //     access_token_obj.schoolId = access_token_obj.userId;
    //     delete access_token_obj.userId
    //     refresh_token_obj.schoolId = refresh_token_obj.userId;
    //     delete refresh_token_obj.userId
    // }

    createAccessToken(access_token_obj, role)
    createRefreshToken(refresh_token_obj, role);
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
                                school: await db['school'].findOne({ school_code: userEmail.school_code }).select({
                                    _id: 1,
                                    mobileNo: 1,
                                    role: 1,
                                    school_name: 1,
                                    school_code: 1,
                                    school_address: 1,
                                    is_active: 1
                                }),
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
                        let driverExist = await db['user'].findOne({ role: 2, school_code: user.school_code, bus_number: user.bus_number })
                        if (user.role == 2 && driverExist) {
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
    insertSchool: async (req, callback) => {
        try {
            let user = req.body;

            const newSchool = new db['school'](req.body);
            // newSchool.email = user.email.toLowerCase()
            newSchool.save()
                .then(async (userDetails) => {
                    callback(200, 'School Added',);
                })
                .catch(err => {
                    console.log(err);
                    callback(500, 'error in saving School details');
                });
        } catch (error) {
            console.log(error);
            callback(500, error.message, error);
        }
    },
    schoolLogin: async (req, callback) => {
        try {
            let user = req.body;
            if (user.grant_type && user.grant_type == "refresh") {
                let refresh_token = await db['refresh_token'].findOne({ token: user.refresh_token })
                // console.log("****************** refresh token ****************", refresh_token)
                if (refresh_token) {
                    let userEmail = await db['school'].findById(refresh_token.userId)
                    let userDetails = {
                        id: userEmail.id,
                        mobileNo: userEmail.mobileNo,
                        school_name: userEmail.school_name,
                        school_address: userEmail.school_address,
                        school_code: userEmail.school_code,
                        is_active: userEmail.is_active,
                        platform: userEmail.platform,
                        device_token: userEmail.device_token,
                        ...createToken(userEmail.id, userEmail.role)
                    }

                    callback(200, "Login Successfull", userDetails)
                } else {
                    callback(404, "Token Expired")
                }
            } else {
                let userEmail = await db['school'].findOne({ mobileNo: user.mobileNo });
                console.log(userEmail)
                if (userEmail == null) {
                    callback(404, 'Mobile Number ' + req.body.mobileNo + ' not found in db')
                } else {
                    if (user.password) {
                        if (await bcrypt.compare(user.password, userEmail.password)) {
                            let userDetails = {
                                id: userEmail.id,
                                mobileNo: userEmail.mobileNo,
                                school_name: userEmail.school_name,
                                school_address: userEmail.school_address,
                                school_code: userEmail.school_code,
                                is_active: userEmail.is_active,
                                platform: userEmail.platform,
                                device_token: userEmail.device_token,
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
    updateProfile: async (req, callback) => {
        try {
            db['user'].findByIdAndUpdate(req.params.userid, { ...req.body, profile_updated: true })
                .then(user => {
                    callback(200, "Profile updated sucessfully")
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
            let user = await db['user'].findById(req.params.userid).select({
                lat: 1,
                long: 1
            });
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

            let users = await db['user'].find(query).select('-password ');

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
    },
    loginWithOTP: async (req, callback) => {
        try {
            let user = req.body;
            if (user.mobileNo) {
                otpUser = await db['user'].findOne({ mobileNo: user.mobileNo, role: user.role });
                if (otpUser) {
                    let otp = Math.floor(1000 + Math.random() * 9000)

                    // let otp = 5005;
                    let loginOtp = ""
                    loginOtp = await db['user'].findByIdAndUpdate(otpUser.id, {
                        verification_otp: otp
                    })
                    try {
                        const res = await request({
                            url: `https://2factor.in/API/V1/${constant.message_key.Key}/SMS/${user.mobileNo}/${otp}/OTP%20Verification`
                        });
                    } catch (error) {

                    }

                    // console.log(res)
                    console.log(otp)
                    // let sendSms = await textlocalComplete.sendSms('N2E2Yjc5Mzc3MTcwNjY3MzMxNzU1YTc4NDc1NzRhMzA=', req.body.mobileNo, 'GoodXI',
                    //     `Dear User, Your OTP for login to GoodX is ${otp}. Valid for 10 minutes. Please do not share this OTP. Regards, GoodX Team`);
                    // console.log(sendSms.data)
                    callback(200, "OTP Sent", "")
                } else {
                    // let otp = Math.floor(1000 + Math.random() * 9000)

                    let otp = 5005;
                    let loginOtp = ""

                    const newUser = new db['user']({
                        mobileNo: user.mobileNo,
                        verification_otp: otp,
                        role: user.role
                    });
                    await newUser.save()
                    callback(200, "Registered and OTP Sent", otp)
                }
            } else {
                callback(400, "Invalid Mobile Number")
            }
        } catch (error) {
            console.log(error);
            callback(500, error.message, error);
        }
    },
    verifyOTP: async (req, callback) => {
        try {
            let verification_otp = null;
            let otp = req.body.login_otp;


            verification_otp = await db['user'].findOne({ mobileNo: req.body.mobileNo, role: req.body.role });

            console.log(verification_otp)

            if (otp && verification_otp && verification_otp.verification_otp) {
                console.log(otp, verification_otp.verification_otp)
                if (JSON.parse(otp) == verification_otp.verification_otp) {
                    let userDetails = {
                        "_id": verification_otp.id,
                        "full_name": verification_otp.full_name,
                        "mobileNo": verification_otp.mobileNo,
                        "role": verification_otp.role,
                        "lat": verification_otp.lat,
                        "long": verification_otp.long,
                        "device_token": verification_otp.device_token,
                        "platform": verification_otp.platform,
                        "bus_number": verification_otp.bus_number,
                        "school_code": verification_otp.school_code,
                        "isSessionActive": verification_otp.isSessionActive,
                        "profile_updated": verification_otp.profile_updated,
                        "created_at": verification_otp.created_at,
                        ...createToken(verification_otp.id, verification_otp.role)
                    }
                    callback(200, "Login Successfull", userDetails)

                } else {
                    callback(400, "Invalid OTP", {})
                }
            } else {
                callback(404, "Invalid OTP")
            }
        } catch (error) {
            console.log("Error in verify otp ", error);
            callback(500, error.message, error);
        }
    },
}