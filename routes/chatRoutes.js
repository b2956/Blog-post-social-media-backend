const express = require('express');

const chatController = require('../controllers/chatCtrl');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/get-users', isAuth, chatController.getUsers);

router.get('/:recipientUserId', isAuth, chatController.getChat);

router.post('/send-message/:chatId', isAuth, chatController.sendMessage);

module.exports = router;