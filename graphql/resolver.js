const bcrypt = require('bcryptjs');
const validator = require('validator');
const jsonWebToken = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');
const callErrorHandler = require('../utils/callErrorHandler');
const environmentVariables = require('../config/environmentVariables');
const isAuth = require('../utils/isAuth');


module.exports = {
    createUser: async function ({ userInput }, req){
        const { email, name, password } = userInput;

        const errors = [];

        if(!validator.isEmail(email)) {
            errors.push({message: 'E-mail is invalid'});
        }
        if(validator.isEmpty(password) || !validator.isLength(password, { min: 5 })) {
            errors.push({message: 'Password must be at least 5 characters long'});
        }
        if(errors.length > 0) {
            callErrorHandler.synchronous(errors[0].message, 422);
        }

        const existingUser = await User.findOne({ email: email });

        if(existingUser) {
            callErrorHandler.synchronous('User with that email already exists', 422);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await new User({
            email,
            name,
            password: hashedPassword
        }).save();

        console.log('User created successfully!');

        return {
            ...user._doc,
            _id: user._id.toString()
        };
    },

    loginUser: async function({ loginInput }, req) {
        const { email, password } = loginInput;

        const user = await User.findOne({email: email});

        if(!user) {
            callErrorHandler.synchronous('No user found with that email', 404);
        }

        const comparePasswords = await bcrypt.compare(password, user.password);

        if(!comparePasswords) {
            callErrorHandler.synchronous('Password is incorrect', 401);
        }

        const token = jsonWebToken.sign({
            email: user.email,
            userId: user._id.toString()
        }, environmentVariables.JWTSecret, {
            expiresIn: '1h'
        });

        console.log('User has logged in!');

        return {
            token: token,
            userId: user._id.toString()
        }
    },

    getPosts: async function({ page }, req) {
        const itemsPerPage = 2;
        
        // isAuth(req);

        const totalPosts = await Post
            .countDocuments();

        const posts = await 
            Post
                .find()
                .skip((+page - 1)*2)
                .limit(itemsPerPage);

        if(!posts) {
            callErrorHandler.synchronous('Could not find posts.', 404);
        }

        return {
            posts: posts,
            totalPosts
        }
    }
}