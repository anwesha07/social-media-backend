const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    description: {
        type : String,
        default: '',
    },
    image: {
        type: Array,
        default: [],
    },
    likes: {
        type: Array,
        default: [],
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
},
{
    timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;