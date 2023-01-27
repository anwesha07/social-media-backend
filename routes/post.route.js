const router = require('express').Router();
const postRepo = require('../models/Post');
const {authenticateUser: authMiddleware} = require('../middlewares/auth.middleware');

router.get('/', (req, res) => {
    res.json({message: 'post route checked'});
});

//create post
router.post('/', authMiddleware, async(req, res) => {
    try {
        const post = new postRepo({
            ...req.body,
            author : req.user._id,
        })
        await post.save();
        res.status(201).json(post);
    } catch(err) {
        res.status(500).json({message: err.message})
    }
});

// edit post
router.put('/:id', authMiddleware, async(req, res) => {
    try {
        const postId = req.params.id;
        const post = await postRepo.findOne({_id: postId});
        if (post) {
            await post.updateOne({$set: req.body});
            res.status(200).json({message: 'Post updated successfully'});
        } else {
            res.status(404).json({message: "post doesnot exist"});
        }
    } catch(err) {
        res.status(500).json({message: err.message})
    }
});

//delete post
router.delete('/:id', authMiddleware, async(req, res) => {
    try {
        const postId = req.params.id;
        const post = await postRepo.findOne({_id: postId});
        if (post) {
            await post.deleteOne();
            res.status(200).json();
        } else {
            res.status(404).json({message: "post doesnot exist"});
        }
    } catch(err) {
        res.status(500).json({message: err.message})
    }
});

// get posts

// get post by post id
router.get('/:id', async(req, res) => {
    try {
        const post = await postRepo.findOne({_id: req.params.id}).populate({
            path: 'author', // field in post schema to be populated
            select: '_id username profilePicture'
        }).lean();
        if (post) {
            res.json(post);
        } else {
            res.status(404).json({message: "post doesnot exist"});
        }
    } catch(err) {
       res.status(500).json({message: err.message})       
    }
})

module.exports = router;
