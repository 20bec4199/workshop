const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwt");

exports.registerUser = catchAsyncError(async (req, res, next) => {
   const user = await User.create(req.body);

   sendToken(user, 201, res);
})

exports.loginUser = catchAsyncError(async (req, res, next) => {
   const { email, password } = req.body;
   // console.log(req.body)
   if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400))
   }
   const user = await User.findOne({ email }).select("+password");
   console.log(user);
   if (!user) {

      return next(new ErrorHandler("User not found", 401));
   }
   if (! await user.validatePassword(password)) {
      return next(new ErrorHandler("Password is incorrect", 401));
   }
   return sendToken(user, 201, res);

})
 
exports.logoutUser = (req, res, next) => {
   res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true
   })
      .status(200)
      .json({
         success: true,
         message: "Logged out successfully!"
      })
}