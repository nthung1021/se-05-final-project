var express = require('express');
var { getRegister, postRegister, getLogin, postLogin } = require('./usersController');
var router = express.Router();

router.get('/register', getRegister);
router.post('/register', postRegister);
router.get('/login', getLogin);
router.post('/login', postLogin);

module.exports = router;