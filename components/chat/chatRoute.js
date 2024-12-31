var express = require('express');
var chatController = require('./chatController');
var {ensureAuthenticated} = require('../users/usersController');
var router = express.Router();

router.get('/list', ensureAuthenticated, chatController.getChatList);
router.get('/:id', chatController.getChatHistory);
router.post('/create', chatController.createChat);
router.post('/send', chatController.sendMessage);
router.post('/delete', chatController.handleDeleteChat);
router.get('/', ensureAuthenticated, chatController.renderChatPage);

module.exports = router;
