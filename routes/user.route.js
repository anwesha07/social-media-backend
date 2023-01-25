const router = require("express").Router();
const userRepo = require('../models/User.js');
const bcrypt = require('bcrypt');
const {authenticateUser: authMiddleware} = require('../middlewares/auth.middleware')
const validateUpdateUserData = require('../middlewares/user.middleware')



router.get('/me', authMiddleware, async(req, res)=>{
    delete req.user.token;
    console.log(req.user);
    res.json(req.user);
});
router.get('/:id', async(req, res)=>{
    const userId = req.params.id;
    try {
        const user = await userRepo.findOne({_id : userId}, {
            username: 1,
            profilePicture: 1,
            coverPicture: 1,
            followers: 1,
            following: 1
        }).lean();
        if (user) {
            res.json(user);
        }else {
            res.status(404).json({ message: 'user doesnot exist'});
        }
    } catch(err) {
        res.status(500).json({message: err.message});
    }
});
router.get('/', async(req, res)=>{
    const name = req.query.name;
    const NUM_RESULTS_PER_PAGE = 2;
    const pageNumber = req.query.page - 1;
    // Take page as query param
    // const NUM_RESULTS_PER_PAGE = 10
    try {
        const user = await userRepo.find({ username : { $regex : name, $options : 'i' } }, {
            username: 1,
            profilePicture: 1,
            coverPicture: 1,
            followers: 1,
            following: 1
        }).lean()
        .skip(pageNumber * NUM_RESULTS_PER_PAGE)
        .limit(NUM_RESULTS_PER_PAGE);
        // Use .skip() for offset and .limit() for number of results
        res.json(user);
    } catch(err) {
        res.json({message: err.message});
    }
});

router.put('/me', validateUpdateUserData, authMiddleware, async(req, res) => {
    try {
        if(req.body.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            req.body.password = hashedPassword;
        }
        const updatedUser = await userRepo.findOneAndUpdate(
            {_id : req.user._id},
            {$set: req.body},
            {projection: {password: 0, __v: 0, token: 0}, new: true}
        ).lean();
        res.json(updatedUser);
    } catch(err) {
        res.json(err.message);
    }       
});


router.delete('/me', authMiddleware, async(req, res) => {
    try {
        await userRepo.deleteOne({ _id: req.user._id });
        res.status(204).json();
    } catch(err) {
        res.json(err.message);
    }
});


router.put('/follow/:id', authMiddleware, async(req, res) => {
    try {
        const currentUserId = req.user._id;
        const userId = req.params.id;

        if (currentUserId == userId) {
            res.json({message: 'You cannot follow yourself'});
        } else {
            const user = await userRepo.findOne({_id: userId}, {password: 0, __v: 0, token: 0});

            if (user) {
                // const updatedCurrentUser = await userRepo.findOne({_id: currentUserId}, {$push: {following: userId}}, {new: true});
                const currentUser = await userRepo.findOne({_id: currentUserId});

                if (currentUser.following.includes(userId)) res.json({message: 'user is already followed'});
                else {
                    await currentUser.updateOne({$push: {following: userId}});
                    await user.updateOne({$push: {followers: currentUserId}});
                    res.json({message: `user ${user._id} followed succesfully`});
                }
            } else {
                res.json({message: 'user doesnot exist'});
            }
        }

    } catch(err) {
        res.json(err.message);
    }
});

// unfollow logic
router.put('/unfollow/:id', authMiddleware, async(req, res) => {
    try {
        const currentUserId = req.user._id;
        const userId = req.params.id;

        if (currentUserId == userId) {
            res.json({message: 'You cannot unfollow yourself'});
        } else {
            const user = await userRepo.findOne({_id: userId}, {password: 0, __v: 0, token: 0});
            console.log(user);

            if (user) {
                const currentUser = await userRepo.findOne({_id: currentUserId}, {password: 0, __v: 0, token: 0});

                if (currentUser.following.includes(userId)) {
                    await currentUser.updateOne({$pull: {following: userId}});
                    await user.updateOne({$pull: {followers: currentUserId}});
                    res.json({message: `user ${user._id} unfollowed succesfully`});
                } else {
                    res.json({message: 'user is not followed'});
                }
            } else {
                res.json({message: 'user doesnot exist'});
            }
        }

    } catch(err) {
        res.json(err.message);
    }
});


module.exports = router;