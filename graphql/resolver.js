const bcrypt = require('bcryptjs');
const validator = require('validator');
const jsonWebToken = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');
const callErrorHandler = require('../utils/callErrorHandler');
const environmentVariables = require('../config/environmentVariables');
const isAuth = require('../utils/isAuth');
const clearImage = require('../utils/clearImage');


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

    getPost: async function({ postId }, req) {
        isAuth(req);

        const post = await Post
            .findById(postId)
            .populate({
                path: 'creator', 
                select: 'name'
            });

        if(!post) {
            callErrorHandler.synchronous('Could not find the desired post', 404);
        }

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
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
        const { title, content, imageUrl } = postInput;

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

        console.log('New post created');
        return {
            ...post._doc,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }
    },

    editPost: async function({ postInput }, req) {
        const { title, content, imageUrl, postId } = postInput;

        isAuth(req);

        if(validator.isEmpty(title) || !validator.isLength(title, {min: 5})) {
            callErrorHandler.synchronous('Invalid title, text must be at least 5 characters long', 422);
        }

        if(validator.isEmpty(content)  || !validator.isLength(content, {min: 5})) {
            callErrorHandler.synchronous('Invalid content, text must be at least 5 characters long', 422);
        }

        const post = await 
            Post
                .findById(postId)
                .populate({
                    path: 'creator', 
                    select: 'name'
                });
        
        if(!post) {
            callErrorHandler.synchronous('Could not find the post you are trying to edit', 404);
        }

        if(post.creator._id.toString() !== req.userId.toString()) {
            callErrorHandler.synchronous(`User id doesn't match that of the post.`, 422);
        }

        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;

        const savedPost = await post.save();

        if(!savedPost) {
            callErrorHandler.synchronous('Could not save your post to the database', 500);
        }

        console.log('Post edited successfully');
        return {
            ...post._doc,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        }
    },

    deletePost: async function({ postId }, req) {
        isAuth(req);

        const post = await Post.findById(postId);

        if(!post) {
            callErrorHandler.synchronous('Could not find post.', 404);
        }

        if(post.creator._id.toString() !== req.userId.toString()) {
            callErrorHandler.synchronous(`User id doesn't match that of the post.`, 422);
        }

        const user = await User.findById(req.userId);

        if(!user){
            callErrorHandler.synchronous('Could not find the user that created this post', 404);
        }

        await post.remove();
        await user.posts.pull(postId);
        await user.save();
        clearImage(post.imageUrl);

        console.log('Post deleted successfully');

        return {
            ...post._doc
        }
    },

    getUserStatus: async function(args, req) {
        isAuth(req);

        const user = await User.findById(req.userId);

        if(!user){
            callErrorHandler.synchronous('User could not be found');
        }

        return {
            status: user.status
        }
    },

    updateStatus: async function({ statusInput }, req) {
        isAuth(req);

        const user = await User.findById(req.userId);

        if(!user) {
            callErrorHandler.synchronous('User could not be found', 404);
        }

        user.status = statusInput;

        await user.save();
        
        console.log('Status updated successfully');

        return {
            status: user.status
        }
    }
}