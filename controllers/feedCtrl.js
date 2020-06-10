const { validationResult }  = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                _id: '1',
                title: 'First Post',
                content: 'This is the first post!',
                imageUrl: 'images/wordpress-blog-post-checklist-guide.jpg',
                creator: {
                    name: 'Bruno'
                },
                createdAt: new Date()
            },
            {
                _id: '2',
                title: 'Second Post',
                content: 'This is the second post!',
                imageUrl: 'images/wordpress-blog-post-checklist-guide.jpg',
                creator: {
                    name: 'Bruno'
                },
                createdAt: new Date()
            },
            {
                _id: '3',
                title: 'Third Post',
                content: 'This is the third post!',
                imageUrl: 'images/wordpress-blog-post-checklist-guide.jpg',
                creator: {
                    name: 'Bruno'
                },
                createdAt: new Date()
            }
        ]
    });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect');
        console.log(error);
        error.statusCode = 422;
        throw error;
    }

    const { title, content } = req.body;

    const post = new Post({
        title,
        content,
        imageUrl: 'images/wordpress-blog-post-checklist-guide.jpg',
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
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

    
};