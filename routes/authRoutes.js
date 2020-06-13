const express = require('express');

const authController = require('../controllers/authCtrl');
const validators = require('../middleware/validators');

const router = express.Router();


router.put('/signup', validators.sigUpValidator, authController.userSignUp); 

router.post('/login', validators.loginValidator, authController.userLogin);


module.exports = router;