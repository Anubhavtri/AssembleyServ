require('dotenv').config()
var mongoose = require('mongoose');
const mongoUrl = "mongodb+srv://appuser:b0qPe8slTLn8ut9U@cluster0.nvra7.mongodb.net/appServer?retryWrites=true&w=majority";
var db = mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.once('open', () => {
    console.log('conneted to database');
});

mongoose.connection.once('error', (error) => {
    console.log(error);
});

console.log(mongoose.connection.readyState);
var onerror = function (error, callback) {
    mongoose.connection.close();
    callback(error);
};

const user = require('../models/user');
const access_token = require('../models/access_token');
const refresh_token = require('../models/refresh_token');
const notification = require('../models/notifications');
const school = require('../models/school');
const vehicle = require('../models/vehicle');
const school_vehicle = require('../models/school_vehicle');
const feeds = require('../models/feeds');

mongoose.Promise = global.Promise;
module.exports.db = db;
module.exports = {
    user,
    notification,
    access_token,
    refresh_token,
    school,
    vehicle,
    school_vehicle,
    feeds
}