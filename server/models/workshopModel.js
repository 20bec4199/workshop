const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter the title'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
    },
    campus: {
        type: String,
        enum:
        {
            values: [
                'KTR',
                'RMP',
                'VDP',
                'NCR',
                'TPJ'
            ]
        }
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    maxParticipants: { type: Number, required: true },
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
        type: String,
        enum: {
            values: [
                'Completed',
                'Upcoming'
            ]
        },
        default: 'Upcoming'
    }
})

module.exports = mongoose.model('Workshop', workshopSchema);
