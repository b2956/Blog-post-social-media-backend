const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); 
const jsonWebToken = require('jsonwebtoken');

const User = require('../models/user');
const callErrorHandler = require('../utils/callErrorHandler');
const envVariables = require('../config/environmentVariables');



exports.userSignUp = async (req, res, next) => {
    const { email, name, password } = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const errorData = errors.array();

        callErrorHandler.synchronous('Validation failed', 422, errorData);
    }

    try {
        const hashedPassword = await 
            bcrypt
            .hash(password, 12);

        const user = new User({
            email,
            name,
            password: hashedPassword
        });

        await user.save();
        
        res.status(201).json({
            message: 'New user created',
            user
        });

        console.log('New user created');
    } catch (err) {
        callErrorHandler.asynchronous(err, next);
    }
    
}

exports.userLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {

        const user = await 
            User
            .findOne({ email: email });
        
        if(!user) {
            callErrorHandler.synchronous('No user found with that email.', 401);               
        }

        const isEqual = await 
            bcrypt
            .compare(password, user.password);
        
        if(!isEqual) {
            callErrorHandler.synchronous('Invalid password!', 401);
        }

        const token = jsonWebToken.sign({
            email: user.email,
            userId: user._id.toString()
        }, envVariables.JWTSecret, {
            expiresIn: '1h'
        });

        res.status(200).json({
            token,
            userId: user._id.toString()
        });

        console.log('User has logged In');
        return;
    } catch (err) {
        return callErrorHandler.asynchronous(err, next);
    }
}