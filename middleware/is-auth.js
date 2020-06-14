const jsonWebToken = require('jsonwebtoken');

const envVariables = require('../config/environmentVariables');
const callErrorHandler = require('../utils/callErrorHandler');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization')

    if(!authHeader) {
        callErrorHandler.synchronous('User is not authenticated', 401);
    }

    const token  = authHeader.split(' ')[1];
    let decodedToken;

    try {
        decodedToken = jsonWebToken.verify(token, envVariables.JWTSecret);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }

    if(!decodedToken) {
        callErrorHandler.synchronous('User is not authenticaded', 401);
    }

    req.userId = decodedToken.userId;
    next();
}