const express = require('express');
const { registerUser, loginUser, userProfile, updateUserProfile, ForgetPassword, resetPassword, getAllUsers,toggleBlockUser } = require('../controllers/user');
const { middleWare } = require("../middlewares/AuthMiddleware");

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', ForgetPassword);
router.post('/reset-password/:token', resetPassword);
router.get("/GetAllUser", getAllUsers)
router.get("/userProfile", middleWare, userProfile);
router.put('/updateProfile', middleWare, updateUserProfile);
router.put("/toggleBlock/:userId", middleWare, toggleBlockUser);

module.exports = router;
