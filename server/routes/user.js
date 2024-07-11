const express = require('express');
const { getUser, newUser, getUsers, updateUser, deleteUser, login, countUsers, CreateUsersFromCSV } = require('../controllers/userController');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { registerUser, loginUser, logoutUser } = require('../controllers/AuthController');
const { isAuthenticatedUser } = require('../middlewares/authenticateUser');
const { authorizeRoles } = require('../middlewares/authenticateUser');
const { createUsersFromCSV } = require('../controllers/userController');
const uploads = require('../middlewares/multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename for each uploaded file
  }
});
const upload = multer({ storage: storage });
router.route('/user/register').post(registerUser);
router.route('/user/login1').post(loginUser);
router.route('/logoutUser').post(logoutUser);
router.route('/user').get(isAuthenticatedUser, getUser);
router.route('/users').get(isAuthenticatedUser, authorizeRoles('admin'), getUsers);
router.route('/user/new').post(newUser);

router.route('/count/users').get(isAuthenticatedUser, authorizeRoles('admin'), countUsers);
router.put('/user/update', isAuthenticatedUser, authorizeRoles('admin', 'staff'), upload.single('image'), updateUser);
router.route('/user/:id').delete(deleteUser);
router.route('/user/login').post(login);
router.route('/user/bulk/register').post(uploads, CreateUsersFromCSV);

module.exports = router;
