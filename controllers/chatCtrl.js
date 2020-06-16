const Chat = require('../models/chat');
const User = require('../models/user');
const callErrorHandler = require('../utils/callErrorHandler');

exports.getUsers = async (req, res, next) => {
    const page  = +req.query.page || 1;

    const usersPerPage = 2;

    try {
        const totalUsers = await User.find().countDocuments();

        const users = await User
            .find()
            .skip((page - 1) * usersPerPage)
            .limit(usersPerPage);

        if(!users) {
            callErrorHandler.synchronous('No users found', 404)
        }

        const responseUsers = users.map(user => {
            return {
                name: user.name,
                id: user._id,
            }
        });

        res.status(200).json({
            users: responseUsers,
            totalItems: totalUsers
        });
    } catch (err) {
        callErrorHandler.asynchronous(err, next);
    }
}

exports.getChat = async (req, res, next) => {
    const { userId } = req;
    const { recipientUserId } = req.params;

    try {
        let emiter = await User.findById(userId);
        
        let recipient = await User.findById(recipientUserId);

        if(!emiter || !recipient) {
            callErrorHandler.synchronous('Could not find the related user', 404);
        }

        let chat = await 
            Chat
            .findOne({
                'users.userId': userId,
                'users.userId': recipientUserId
            });
        if (!chat) {
            chat = new Chat({
                users: [
                    {
                        userId: userId                
                    },
                    {
                        userId: recipientUserId
                    }
                ]
            });

            await chat.save();

            emiter.chats.push(chat._id);
            await emiter.save();
            await recipient.chats.push(chat._id);
            await recipient.save();

            console.log('New chat created!');
        }
        res.status(200).json({
            chat
        });

    } catch (err) {
        callErrorHandler.asynchronous(err, next);
    }    
}

exports.sendMessage = async (req, res, next) => {
    const { userId } = req;
    const { chatId } = req.params;
    const { msgContent } = req.body;

    try {
        let emiter = await User.findById(userId);

        if(!emiter) {
            callErrorHandler.synchronous('Could not find the related user', 404);
        }

        let chat = await 
            Chat
            .findOne({
                'users.userId': userId,
                _id: chatId 
            });
        
        if(!chat) {
            callErrorHandler.synchronous('Could not find the desired chat', 404);
        }

        chat.messages.unshift({
            content: msgContent,
            user: {
                userId: emiter._id,
                name: emiter.name
            }
        });

        await chat.save();

        res.status(201).json({
            chat
        });
        console.log('message sent successfully!');
    } catch (err) {
        callErrorHandler.asynchronous(err, next);
    }
}