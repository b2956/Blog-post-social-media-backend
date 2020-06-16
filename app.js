const path = require('path'); 

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const envVariables = require('./config/environmentVariables');

const feedRoutes = require('./routes/feedRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

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
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

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
        const server = app.listen(8080);
        console.log('Server is connected');
        const io = require('./config/socket').init(server);
        io.on('connection', socket => {
            console.log('Client connected');
        });
    })
    .catch(err => {
        console.log(err);
    });
