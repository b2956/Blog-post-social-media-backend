const { validationResult }  = require('express-validator');

const Post = require('../models/post');
const clearImage = require('../utils/clearImage');
const callErrorHandler = require('../utils/callErrorHandler');

exports.getFeed = (req, res, next) => {
    const { page } = +req.query || 1;
    const postsPerPage = 2;
    let totalPosts;
    Post.find()
    .countDocuments()
    .then(count => {
        totalPosts = count;

        return Post
            .find()
            .skip((page - 1) * postsPerPage)
            .limit(postsPerPage)
            .then(posts => {
                if(!posts) {
                    callErrorHandler.synchronous('Could not find posts.', 404);
                }

                res.status(200).json({
                    posts,
                    totalItems: totalPosts
                })
            });
    })
    .catch(err => {
        callErrorHandler.asynchronous(err, next);
    });
}

exports.createPost = (req, res, next) => {
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

    const post = new Post({
        title,
        content,
        imageUrl: imageUrl,
        creator: {
            name: 'Bruno'
        }
    });

    post
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Post created sucessfully!',
                post: result
            });
            console.log('New post created!')
        })
        .catch(err => {
            callErrorHandler.asynchronous(err, next);
        });
}

exports.getPost = (req, res, next) => {
    const { postId } =  req.params;

    Post
        .findById(postId)
        .then(post => {
            if(!post) {
                callErrorHandler.synchronous('Could not find post.', 404);
            }

            res.status(200).json({
                message: 'Post fetched.',
                post
            });
        })
        .catch(err => {
            callErrorHandler.asynchronous(err, next);
        });
}

exports.editPost = (req, res, next) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        callErrorHandler.synchronous('Validation failed, entered data is incorrect', 422);
    }

    const { postId } = req.params;
    const { title, content } = req.body;
    let imageUrl;

    if(req.file) {
        imageUrl = req.file.path;
    }

    Post
    .findById(postId)
    .then(post => {
        if(!post) {
            callErrorHandler.synchronous('Could not find post.', 404);
        }

        if(imageUrl !== undefined) {
            clearImage(post.imageUrl);
            post.imageUrl = imageUrl;
        }

        post.title = title;
        post.content = content;
        
        return post.save()
    })
    .then(result => {
        res.status(200).json({
            message: 'Post edited with succes!',
            post: result
        });
        console.log('Post updated successfully!')
    })
    .catch(err => {
        callErrorHandler.asynchronous(err, next);
    });
}

exports.deletePost = (req, res, next) => {
    const { postId } = req.params;

    Post
    .findById(postId)
    .then(post => {
        if(!post) {
            callErrorHandler.synchronous('Could not find post.', 404);
        }
        clearImage(post.imageUrl);

        return Post.findByIdAndRemove(postId);
    })
    .then(result => {
        res.status(200).json({
            message: 'Post deleted successfully!'
        });
        console.log('Post deleted successfully!');
    })
    .catch(err => {
        callErrorHandler.asynchronous(err, next);
    });

}