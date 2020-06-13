const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); 

const User = require('../models/user');
const callErrorHandler = require('../utils/callErrorHandler');



exports.userSignUp = (req, res, next) => {
    const { email, name, password } = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
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
            callErrorHandler(err, next);
        })






}