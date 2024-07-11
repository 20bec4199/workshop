const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [30, "Name cannot exceeds 30 characters"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, 'Invalid Email'],

    },
    dob: {
        type: Date,
        required: [true, "please enter your date of birth"],

    },
    department: {
        type: String,
        // required:[true, "Please enter your department"],
        enum: {
            values: [
                'CSE',
                'ECE',
                'EEE',
                'CIVIL',
                'MECH',
                'IT',
                'CSBS',
                'AIDS'
            ]
        }
    },
    gender: {
        type: String,
        enum: {
            values: [
                'Male',
                'Female',
                'Others'
            ]
        }
    },
    experience: {
        type: String,

    },
    designation: {
        type: String,
        // required:[true,'Designation is required'],
        maxLength: [40, 'Designation must not be exceeds 40 characters']
    },
    campus: {
        type: String,
        enum: {
            values: [
                'KTR',
                'RMP',
                'VDP',
                'NCR',
                'TPJ'
            ]
        }
        // required:[true,'Campuse is required']
    },
    password: {
        type: String,
        required: [true, "Password is required!"],
        select: false

    },
    role: {
        type: String,
        default: 'staff'
    },
    imageData: {
        type: String
    },
    community: {
        type: String,
        enum: {
            values: ['SC/ST', 'EWS', 'OBC', 'GEN', 'PWD']
        }
    },
    joiningDate: {
        type: Date,
        // required:[true,'joining date is required!']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    }
});

userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

userSchema.methods.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

let User = mongoose.model('User', userSchema);

module.exports = User;