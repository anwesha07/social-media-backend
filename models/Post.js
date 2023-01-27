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
    comments: {
        type: Array,
        default: [],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;