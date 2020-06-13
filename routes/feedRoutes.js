const express = require('express');

const feedController = require('../controllers/feedCtrl');
const validators = require('../middleware/validators');
const isAuth = require('../middleware/is-auth'); 

const router = express.Router();

router.get('/posts', isAuth,feedController.getFeed);

router.post('/post', validators.createPostValidator, isAuth, feedController.createPost);

router.get('/post/:postId', isAuth, feedController.getPost);

router.put('/post/:postId',  isAuth, validators.createPostValidator, feedController.editPost);

router.delete('/post/:postId',  isAuth,feedController.deletePost);

module.exports = router;