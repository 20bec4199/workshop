const mongoose = require('mongoose');

const workshopRegisterSchema = new mongoose.Schema({
    workshop: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: {
        type: String,
        enum: {
            values: [
                'Registered',
                'Certified',
                'Not-Attended'
            ]
        },
        default: 'Registered'
    },
    createdAt: { type: Date, default: Date.now(), }
});
let WorkshopRegistration = mongoose.model('WorkshopRegistration', workshopRegisterSchema);
module.exports = WorkshopRegistration;