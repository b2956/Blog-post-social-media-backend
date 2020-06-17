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

    getPosts: async function(args, req) {
        const itemsPerPage = 2;
        const page = +req.query.page || 1;
        
        isAuth(req);

        const totalPosts = await Post
            .countDocuments();

        let posts = await 
            Post
                .find()
                .populate({ path: 'creator', select: 'name' })
                .skip((page - 1) * itemsPerPage)
                .limit(itemsPerPage)
                .sort({ createdAt: -1 });

        if(!posts) {
            callErrorHandler.synchronous('Could not find posts.', 404);
        }

        posts = posts.map(post => {
            return {
                ...post._doc,
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString()
            }
        });

        return {
            posts,
            totalPosts
        }
    },

    createPost: async function({ postInput }, req) {
        const { title, content } = postInput;
        // const imageUrl = req.file.path;
        const imageUrl = 'Hello there';

        isAuth(req);

        const { userId } = req;

        const user = await User.findById(userId);

        if(!user) {
            callErrorHandler.synchronous('No user was found', 404);
        }

        if(validator.isEmpty(title) || !validator.isLength(title, {min: 5})) {
            callErrorHandler.synchronous('Invalid title, text must be at least 5 characters long', 422);
        }

        if(validator.isEmpty(content)  || !validator.isLength(content, {min: 5})) {
            callErrorHandler.synchronous('Invalid content, text must be at least 5 characters long', 422);
        }

        if(!imageUrl) {
            callErrorHandler.synchronous('Must insert a valid image', 422);
        }

        const post = await new Post({
            title,
            content,
            imageUrl,
            creator: user._id
        }).save();

        if(!post) {
            callErrorHandler.synchronous('Could not create post', 500);
        }

        user.posts.push(post._id);

        await user.save();

        await post
            .populate({path: 'creator', select: 'name'})
            .execPopulate();

        return {
            ...post._doc,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }
    },
}