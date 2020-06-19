const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const Post = require('../models/post');
const envVariables = require('../config/environmentVariables');
const feedController = require('../controllers/feedCtrl');

describe('Feed Controller', function() {

    before(function (done) {
    
        mongoose.connect(envVariables.MongoDbTest, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(result => {
            const user = new User({
                name: 'Test User',
                password: 'test',
                email: 'test@test.com',
                _id: '5ee93de62497e326a186a3d1'
            });

            console.log('Connected to database...')
            return user.save();
        })
        .then(() => {
            console.log('New user created...')
            done();
        })
        .catch(err => console.log(err));
    });

    describe('Feed Controller - Get user status', function() {    
        it('should send a response with a valid user status for an existing user', function(done) {
            
            const req = {
                userId: '5ee93de62497e326a186a3d1'
            };
            const res = {
                statusCode: 500,
                userStatus: null,
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.userStatus = data.status;
                }
            };
            feedController.getUserStatus(req, res, () => {})
            .then(() => {
                console.log('Executed test...')
                expect(res.statusCode).to.be.equal(200);
                expect(res.userStatus).to.be.equal('I am new');
                done();
            })
            .catch(err => console.log(err));
            
        });
    });

    describe('Feed Controller - Create Post', function() {
        it('should create a new post and add it to the posts of the creator', function(done) {
            const req = {
                userId: '5ee93de62497e326a186a3d1',
                body: {
                    title: 'My post',
                    content: 'My post content'
                },
                file: {
                    path: 'My image path'
                }
            };

            const res = {
                statusCode: 500,
                message: null,
                post: null,
                creator: null,
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    // console.log(data);
                    this.message = data.message;
                    this.post = {
                        ...data.post,
                        _id: data.post._id.toString()
                    };
                    this.creator = {
                        _id: data.creator._id.toString(),
                        name: data.creator.name
                    }
                }
            };

            feedController.createPost(req, res, () => {})
            .then(result => {
                expect(res.statusCode).to.be.equal(201);
                expect(res.message).to.be.equal('Post created sucessfully!');
                expect(res.creator._id).to.be.equal('5ee93de62497e326a186a3d1');
                expect(res.creator.name).to.be.equal('Test User');
                done();
            })
            .catch(err => console.log(err));
        });

    });

    after(function(done) {
        User
            .deleteMany({})
            .then(() => {
                console.log('Test user deleted...');
                return Post.deleteMany({});
            }) 
            .then(() => {
                console.log('Test posts deleted...');
                return mongoose.disconnect();
            })
            .then(result => {
                console.log('Disconnected from database...');
                done();
            })
            .catch(err => console.log(err));     
    });

});

