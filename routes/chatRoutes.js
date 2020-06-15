const express = require('express');

const chatController = require('../controllers/chatCtrl');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/chat/:recipientUserId', isAuth, chatController.getChat);

router.post('/chat/send-message/:chatId', isAuth, chatController.sendMessage);

module.exports = router;