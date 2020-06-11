const { body } = require('express-validator');

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