const path = require('path');

const dotenv = require('dotenv').config({
    path: path.resolve(__dirname, 'variables.env')
});

module.exports = {
    MongoDbUri: process.env.MONGO_DB_URI,
    JWTSecret: process.env.JSON_WEB_TOKEN_SECRET,
    MongoDbTest: process.env.MONGO_DB_TEST_URI
}

