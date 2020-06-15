const { validationResult }  = require('express-validator');

const io = require('../config/socket');
const Post = require('../models/post');
const User = require('../models/user');
const clearImage = require('../utils/clearImage');
const callErrorHandler = require('../utils/callErrorHandler');
const socket = require('../config/socket');


exports.getFeed = async (req, res, next) => {
    const page  = +req.query.page || 1;

    const postsPerPage = 2;

    try {
        const totalPosts = await Post.find().countDocuments();

        const posts = await Post
            .find()
            .populate('creator')
            .sort({ createdAt: -1 })      
            .skip((page - 1) * postsPerPage)
            .limit(postsPerPage);

        if(!posts) {
            callErrorHandler.synchronous('Could not find posts.', 404);
        }

        res.status(200).json({
            posts,
            totalItems: totalPosts
        });

    } catch (err) { 
        callErrorHandler.asynchronous(err, next);
    }
}

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect');
        console.log(error);
        error.statusCode = 422;
        throw error;
    }
    if(!req.file) {
        callErrorHandler.synchronous('No image provided', 422);
    }

    const imageUrl = req.file.path;
    const { title, content } = req.body;
    const { userId } = req;

    try {
        const post = await new Post({
            title,
            content,
            imageUrl: imageUrl,
            creator: userId
        }).save();
    
        const user = await User.findById(userId);

        if(!user) {
            callErrorHandler.synchronous('No user found.', 401);
        }

        user.posts = [
            ...user.posts,
            post
        ]
        
        await user.save();
           
        console.log('New post created, user updated!');
        io.getIO().emit('posts', {
            action: 'create',
            post: {
                ...post._doc,
                creator: {
                    _id: user._id,
                    name: user.name
                }
            }
        })
        
        res.status(201).json({
            message: 'Post created sucessfully!',
            post: post,
            creator: {
                _id: user._id,
                name: user.name
            }
        });

    } catch (err) {
        callErrorHandler.asynchronous(err, next);
    }
}

exports.getPost = async (req, res, next) => {
    const { postId } =  req.params;


    try {

        const post = await  
            Post
            .findById(postId)
            .populate('creator');

        if(!post) {
            callErrorHandler.synchronous('Could not find post.', 404);
        }

        res.status(200).json({
            message: 'Post fetched.',
            post
        });
        
    } catch (err) {
        callErrorHandler.asynchronous(err, next);
    }
}

exports.editPost = async (req, res, next) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        callErrorHandler.synchronous('Validation failed, entered data is incorrect', 422);
    }

    const { postId } = req.params;
    const { title, content } = req.body;
    const { userId } = req;
    let imageUrl;

    if(req.file) {
        imageUrl = req.file.path;
    }

    try {

        const post = await
            Post
            .findById(postId)
            .populate('creator');

        if(!post) {
            callErrorHandler.synchronous('Could not find post.', 404);
        }

        if(post.creator._id.toString() !== userId.toString()) {
            callErrorHandler.synchronous(`User id doesn't match that of the post.`, 403);
        }

        if(imageUrl !== undefined) {
            clearImage(post.imageUrl);
            post.imageUrl = imageUrl;
        }

        post.title = title;
        post.content = content;
        
        const updatedPost = await post.save();

        io.getIO().emit('posts', {
            action: 'update', 
            post: updatedPost
        });

        res.status(200).json({
            message: 'Post edited with succes!',
            post
        });

        console.log('Post updated successfully!')
    } catch (err) {
        callErrorHandler.asynchronous(err, next);
    }
}

exports.deletePost = async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req;

    try {
        const post = await 
            Post
            .findById(postId);

        if(!post) {
            callErrorHandler.synchronous('Could not find post.', 404);
        }

        if(post.creator.toString() !== userId.toString()) {
            callErrorHandler.synchronous(`User id doesn't match that of the post.`, 403);
        }

        clearImage(post.imageUrl);

        await Post.findByIdAndRemove(postId);

        const user = await User.findById(userId);

        user.posts.pull(postId);

        await user.save();

        socket.getIO().emit('posts', {
            action: 'delete',
            post: postId
        });

        res.status(200).json({
            message: 'Post deleted successfully!'
        });

        console.log('Post deleted successfully!');
    } catch (err) {
        callErrorHandler.asynchronous(err, next);
    }
}

exports.getUserStatus = async (req, res, next) => {
    const { userId } = req;

    try {
        const user = await 
            User
            .findById(userId);
        
        if(!user) {
            callErrorHandler.synchronous('User could not be found in the database', 404);
        }

        res.status(200).json({
            status: user.status
        });

    } catch (err) {
        callErrorHandler.asynchronous(err, next);
    }
}

exports.editStatus = async (req, res, next) => {
    const { userId } = req;
    const { status } = req.body;

    if(!status) {
        callErrorHandler.synchronous('No new status was set', 401);
    }

    try {
        const user = await 
            User
            .findById(userId);
        
        if(!user) {
            callErrorHandler.synchronous('User could not be found in the database', 404);
        }

        user.status = status;

        await user.save();

        res.status(200).json({
            message: 'Status updated successfully',
            status
        });
        console.log('User status updated succesfully');
    } catch (err) {
        callErrorHandler.asynchronous(err, next);
    }        
}