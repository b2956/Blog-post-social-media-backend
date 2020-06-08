const express = require('express');
const mongoose = require('mongoose');

const envVariables = require('./config/environmentVariables');

const feedRoutes = require('./routes/feedRoutes');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

app.use('/feed', feedRoutes);

mongoose
    .connect(
        envVariables.MongoDbUri, {       useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(result => {
        app.listen(8080, console.log('Server is connected'));
    })
    .catch(err => {
        console.log(err);
    });
