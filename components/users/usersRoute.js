var express = require('express');
var usersController = require('./usersController');
var router = express.Router();

router.get('/register', usersController.getRegister);
router.post('/register', usersController.postRegister);

router.get('/login', usersController.getLogin);
router.post('/login', usersController.postLogin);

router.get('/forgotpassword', usersController.getForgotPassword);
router.post('/forgotpassword', usersController.postForgotPassword);

router.get('/resetpassword/:token', usersController.getResetPassword);
router.post('/resetpassword', usersController.postResetPassword);

router.get('/logout', usersController.getLogout);

module.exports = router;
