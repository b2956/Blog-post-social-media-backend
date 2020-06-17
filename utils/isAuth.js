const jsonWebToken = require('jsonwebtoken');

const envVariables = require('../config/environmentVariables');
const callErrorHandler = require('../utils/callErrorHandler');

module.exports = (req) => {
    const authHeader = req.get('Authorization')

    if(!authHeader) {
        callErrorHandler.synchronous('User is not authenticated', 401);
    }

    const token = authHeader.split(' ')[1];

    const decodedToken = jsonWebToken.verify(token, envVariables.JWTSecret);

    if(!decodedToken) {
        callErrorHandler.synchronous('User is not authenticaded', 401);
    }

    return req.userId = decodedToken.userId;
}