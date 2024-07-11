const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const SECRET_KEY = 'yxfjihtg4545dfj';
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createUsersFromCSV } = require('../utils/UserImport');




const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(token);
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.userId = decoded.email;
    next();
  });
};

exports.getUsers = async (req, res, next) => {
  const user = await User.find();
  console.log(req.cookies);
  res.status(200).json({
    success: 'true',
    message: 'user data fetched successfully!',
    user
  });
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials!' });
    }
    const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: "2h" });
    res.json({ message: 'User loggedin successfully!', token, user });

  } catch (err) {
    console.log(err);
  }
}

exports.newUser = async (req, res, next) => {

  const user = await User.create(req.body);
  console.log(req.body);
  res.status(201).json({
    success: true,
    message: "Registered Successfully!"
  });
};

exports.getUser = async (req, res, next) => {
  console.log(req.user);
  const user = req.user;
  return res.json({
    success: true,
    user
  });

}

exports.updateUser = async (req, res, next) => {
  console.log("requested");
  // console.log('Updating user:', req.params.id); // Log the user ID being updated
  // console.log(req.body);
  console.log(req.user);
  console.log(req);


  try {
    const { name, email, dob, gender, experience, department, campus, designation } = req.body;
    console.log(experience);
    const imageUrl = req.file ? req.file.path : ''; // Get the file path if an image was uploaded
    const imageData = fs.readFileSync(imageUrl, { encoding: 'base64' });
    // Update the user profile in the database
    // console.log(imageData);
    // console.log(gender);
    await User.findOneAndUpdate({ email: req.user.email }, {
      name,
      email,
      gender,
      department,
      campus,
      designation,
      imageData,
      // req.body, 
    }

    );

    res.status(200).send('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Failed to update profile.');
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: 'false',
        message: 'User not found!'
      })
    }
    await user.deleteOne();
    res.status(200).json({
      success: true,
      message: 'User deleted successfully!'
    })
  }
  catch (error) {
    console.log(error);
  }
}

exports.countUsers = catchAsyncError(async (req, res, next) => {
  try {
    const campuses = ['KTR', 'RMP', 'VDP', 'NCR', 'TPJ'];

    // Create an object to hold the counts
    const counts = {};
    for (const campus of campuses) {
      const count = await User.countDocuments({ campus });
      counts[campus] = count;
    }

    console.log('Workshop counts by campus:', counts);
    return res.status(201).json({
      success: true,
      message: "fetched successfully!",
      counts
    })
  } catch (error) {
    console.error('Error counting workshops by campus:', error);
    throw error;
  }
});

exports.CreateUsersFromCSV = catchAsyncError(async (req, res, next) => {
  try {
    const filePath = req.file.path;  // This assumes the CSV file is uploaded and its path is available here
    const errors = await createUsersFromCSV(filePath);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Some users failed to insert. See details.",
        errors
      });
    } else {
      res.status(200).json({
        success: true,
        message: "All users inserted successfully."
      });
    }
  } catch (error) {
    next(error);
  }
});