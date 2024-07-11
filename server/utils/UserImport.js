const mongoose = require('mongoose');
const User = require('../models/userModel');
const { readCSV } = require('./csvUtils');

const inserUser = async (userData) => {
    const {
        name,
        email,
        dob,
        campus,
        department,
        designation,
        password,
        gender,
    } = userData
    try {
        const users = new User({
            name,
            email,
            dob,
            campus,
            department,
            designation,
            password,
            gender,
        })


        const Users = await User.create(users)
    }
    catch (error) {
        const errorDetails = { userData, errorFields: {} };

        if (error.errors) {
            for (const field in error.errors) {
                errorDetails.errorFields[field] = error.errors[field].message;
            }
        } else {
            errorDetails.errorFields.general = error.message;
        }

        throw errorDetails;
    }

}

const createUsersFromCSV = async (filePath) => {
    try {
        const users = await readCSV(filePath);
        const errors = [];

        for (const user of users) {
            try {
                await insertUser(user);
            } catch (errorDetails) {
                errors.push(errorDetails);
                // console.error(Error inserting user ${user.facultyId}:, errorDetails.errorFields);
            }
        }

        return errors;
    } catch (error) {
        throw error;
    }
};

module.exports = { createUsersFromCSV };