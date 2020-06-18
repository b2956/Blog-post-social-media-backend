const path = require('path'); 

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const graphqlHttp = require('express-graphql');

const envVariables = require('./config/environmentVariables');
const graphqlSchema = require('./graphql/schema');
const graphqlResover = require('./graphql/resolver');
const clearImage = require('./utils/clearImage');
const isAuth = require('./utils/isAuth');

const app = express();

const multerFileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const multerFileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(express.json());
app.use(multer({
    storage: multerFileStorage,
    fileFilter: multerFileFilter
}).single('image'));

app.use('/images', express.static(path.resolve(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.put('/post-image', (req, res, next) => {
    isAuth(req);

    if(!req.file) {
        return res.status(200).json({
            message: 'No image file provided',
            filePath: req.body.oldPath
        });
    }
    if(req.body.oldPath) {
        clearImage(req.body.oldPath);
    }
    return res.status(201).json({
        message: 'New image file store',
        filePath: req.file.path
    });
});

app.use('/graphql', 
    graphqlHttp({
        schema: graphqlSchema,
        rootValue: graphqlResover,
        graphiql: true,
        customFormatErrorFn(err) {
            if(!err.originalError) {
                return err;
            }

            const error = {
                message:  err.originalError.message,
                status:  err.originalError.statusCode || 500
            }

            return error;
        }
    })
);

app.use((error, req, res, next) => {
    console.log(error);

    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;

    res.status(status).json({
        message: message,
        data: data
    });
});

mongoose
    .connect(
        envVariables.MongoDbUri, {       useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(result => {
        app.listen(8080);
        console.log('Server is connected');
    })
    .catch(err => {
        console.log(err);
    });
