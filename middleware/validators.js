const { body } = require('express-validator');

exports.createPostValidator = [
    body('title')
    .trim()
    .isAlphanumeric()
    .isLength({
        min: 7
    }),
    body('content')
    .trim()
    .isAlphanumeric()
    .isLength({
        min: 7
    })
]