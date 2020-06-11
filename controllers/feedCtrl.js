const { validationResult }  = require('express-validator');

const Post = require('../models/post');
const clearImage = require('../utils/clearImage');

exports.getFeed = (req, res, next) => {
    Post
        .find()
        .then(posts => {
            if(!posts) {
                const error = new Error('Could not find posts.');
                error.statusCode = 404;
                throw error;
            }

            res.status(200).json({
                posts
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

    // res.status(200).json({
    //     posts: [
    //         {
    //             _id: '1',
    //             title: 'First Post',
    //             content: 'This is the first post!',
    //             imageUrl: 'images/wordpress-blog-post-checklist-guide.jpg',
    //             creator: {
    //                 name: 'Bruno'
    //             },
    //             createdAt: new Date()
    //         },
    //         {
    //             _id: '2',
    //             title: 'Second Post',
    //             content: 'This is the second post!',
    //             imageUrl: 'images/wordpress-blog-post-checklist-guide.jpg',
    //             creator: {
    //                 name: 'Bruno'
    //             },
    //             createdAt: new Date()
    //         },
    //         {
    //             _id: '3',
    //             title: 'Third Post',
    //             content: 'This is the third post!',
    //             imageUrl: 'images/wordpress-blog-post-checklist-guide.jpg',
    //             creator: {
    //                 name: 'Bruno'
    //             },
    //             createdAt: new Date()
    //         }
    //     ]
    // });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect');
        console.log(error);
        error.statusCode = 422;
        throw error;
    }
    if(!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
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
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getPost = (req, res, next) => {
    const { postId } =  req.params;

    Post
        .findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }

            res.status(200).json({
                message: 'Post fetched.',
                post
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.editPost = (req, res, next) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect');
        error.statusCode = 422;
        throw error;
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
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
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
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}