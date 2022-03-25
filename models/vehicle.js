const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const VehicleSchema = Schema({
    vehicle_number: {
        type: String,
        default: ""
    },
    vehicle_type: {
        type: String,
        default: ""
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});


const Vehicle = module.exports = mongoose.model('Vehicle', VehicleSchema);