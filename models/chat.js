const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    users: [
        {
            userId: {
                type: mongoose.Types.ObjectId,
                required: true
            }
        }
    ],
    messages: [
        {
            content: {
                type: String,
                required: true
            },
            user: {
                userId: {
                    type: mongoose.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                name: {
                    type: String,
                    required: true
                }
            },
            date: {
                type: Date,
                default: Date.now
            } 
        }
    ]
});


module.exports = mongoose.model('Chat', chatSchema);