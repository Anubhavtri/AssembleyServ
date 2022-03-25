const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchoolVehicleSchema = Schema({
    school_id: {
        type: Schema.Types.ObjectId,
        ref: 'School'
    },
    vehicle_id: {
        type: Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});


const SchoolVehicle = module.exports = mongoose.model('SchoolVehicle', SchoolVehicleSchema);