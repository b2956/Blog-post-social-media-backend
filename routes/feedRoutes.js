const express = require('express');

const feedController = require('../controllers/feedCtrl');
const validators = require('../middleware/validators');

const router = express.Router();

router.get('/posts', feedController.getPosts);

router.post('/post', validators.createPostValidator ,feedController.createPost);

module.exports = router;