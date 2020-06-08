const path = require('path');

const dotenv = require('dotenv').config({
    path: path.resolve(__dirname, 'variables.env')
});

module.exports = {
    MongoDbUri: process.env.MONGO_DB_URI
}

