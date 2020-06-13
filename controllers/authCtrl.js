const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); 
const jsonWebToken = require('jsonwebtoken');

const User = require('../models/user');
const callErrorHandler = require('../utils/callErrorHandler');
const envVariables = require('../config/environmentVariables');



exports.userSignUp = (req, res, next) => {
    const { email, name, password } = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const errorData = errors.array();

        callErrorHandler.synchronous('Validation failed', 422, errorData);
    }

    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                name,
                password: hashedPassword
            });

            return user.save();
        })
        .then(user => {
            res.status(201).json({
                message: 'New user created',
                user
            });
            console.log('New user created');
        })
        .catch(err => {
            callErrorHandler.asynchronous(err, next);
        })
}

exports.userLogin = (req, res, next) => {
    const { email, password } = req.body;
    let retrievedUser;

    User
        .findOne({ email: email })
        .then(user => {
            if(!user) {
                callErrorHandler.synchronous('No user found with that email.', 401);               
            }

            retrievedUser = user;

            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if(!isEqual) {
                callErrorHandler.synchronous('Invalid password!', 401);
            }

            const token = jsonWebToken.sign({
                email: retrievedUser.email,
                userId: retrievedUser._id.toString()
            }, envVariables.JWTSecret, {
                expiresIn: '1h'
            });

            res.status(200).json({
                token,
                userId: retrievedUser._id.toString()
            });
            console.log('User has logged In');
        })
        .catch(err => {
            callErrorHandler.asynchronous(err, next);
        });
}