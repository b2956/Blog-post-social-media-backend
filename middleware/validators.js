const { body } = require('express-validator');

const User = require('../models/user');
const callErrorHandler = require('../utils/callErrorHandler');

exports.createPostValidator = [
    body('title')
    .trim()
    .isString()
    .isLength({
        min: 5
    }),
    body('content')
    .trim()
    .isString()
    .isLength({
        min: 5
    })
]

exports.sigUpValidator = [
    body('email')
    .isEmail()
    .normalizeEmail()
    .trim()
    .withMessage('Email must be a valid email')
    .custom((value, { req }) => {
        return User
            .findOne({ email: value })
            .then(user => {
                if(user) {
                    return Promise.reject('E-mail adress already exists');
                }
            });
    }),
    body('name')
    .trim()
    .isString()
    .withMessage('Enter a valid username'),
    body('password')
    .trim()
    .isString()
    .isLength({
        min: 5
    })
    .withMessage('Password must be at least 5 characters long')
]

exports.loginValidator = [
    body('email')
    .trim()
    .normalizeEmail()
]