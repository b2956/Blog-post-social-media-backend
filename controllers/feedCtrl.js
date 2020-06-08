const { validationResult }  = require('express-validator');

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
        return res.status(422).json({
            message: 'Validation failed, entered data is incorrect',
            errors: errors.array()
        });
    }

    const { title, content } = req.body;

    res.status(201).json({
        message: 'Post created successfully!',
        post: {
            _id: new Date().toISOString(),
            title,
            content,
            creator: {
                name: 'Bruno'
            },
            createdAt: new Date()
        }
    });
};