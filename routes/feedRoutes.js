const express = require('express');

const feedController = require('../controllers/feedCtrl');
const validators = require('../middleware/validators');

const router = express.Router();

router.get('/posts', feedController.getFeed);

router.post('/post', validators.createPostValidator ,feedController.createPost);

router.get('/post/:postId', feedController.getPost)

module.exports = router;