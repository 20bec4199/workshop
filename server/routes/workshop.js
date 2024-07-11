const express = require('express');
const router = express.Router();
const { create, register, deleteWorkshop, updateWorkshop, getWorkshop, allWorkshops, fetchWorkshopRegisteredUsers, statusChange, deleteRegisteredWorkshop, countWorkshop, workhsopRegisteredDetails, StaffRegisteredWorkshops, StaffCertifiedWorkshops, myEvents } = require('../controllers/workshopController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticateUser');


router.route('/create/workshop/:campus').post(isAuthenticatedUser, authorizeRoles('admin'), create);
router.route('/register/workshop/:id').post(isAuthenticatedUser, authorizeRoles('admin', 'staff'), register);
router.route('/delete/workshop/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteWorkshop);
router.route('/update/workshop/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateWorkshop);
router.route('/get/workshops/:campus').get(isAuthenticatedUser, getWorkshop);
router.route('/get/all/workshops').get(isAuthenticatedUser, authorizeRoles('admin'), allWorkshops);
router.route('/get/workshop/registeredusers/:workshopId').get(isAuthenticatedUser, fetchWorkshopRegisteredUsers);
router.route('/update/workshop/status/:Id').put(isAuthenticatedUser, authorizeRoles('admin'), statusChange);
router.route('/delete/registered/workshop/:Id').delete(isAuthenticatedUser, authorizeRoles('admin', 'staff'), deleteRegisteredWorkshop);
router.route('/get/workshop/count').get(isAuthenticatedUser, countWorkshop);
router.route('/get/registered/user/workshops').get(isAuthenticatedUser, authorizeRoles('admin', 'staff'), workhsopRegisteredDetails);
router.route('/individual/registered/workshop/details').get(isAuthenticatedUser, StaffRegisteredWorkshops);
router.route('/individual/certified/workshops').get(isAuthenticatedUser, authorizeRoles('admin', 'staff'), StaffCertifiedWorkshops);
router.route('/created/workshops').get(isAuthenticatedUser, authorizeRoles('admin'), myEvents);
module.exports = router;