const express = require('express');

const feedController = require('../controllers/feedCtrl');
const validators = require('../middleware/validators');

const router = express.Router();

router.get('/posts', feedController.getFeed);

router.post('/post', validators.createPostValidator ,feedController.createPost);

router.get('/post/:postId', feedController.getPost);

router.put('/post/:postId', validators.createPostValidator, feedController.editPost);

router.delete('/post/:postId', feedController.deletePost);

module.exports = router;