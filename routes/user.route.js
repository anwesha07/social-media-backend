const router = require("express").Router();
const userRepo = require('../models/User.js');
const authMiddleware = require('../middlewares/auth.middleware')


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
    try {
        const user = await userRepo.find({ username : { $regex : name, $options : 'i' } }, {
            username: 1,
            profilePicture: 1,
            coverPicture: 1,
            followers: 1,
            following: 1
        }).lean();
        res.json(user);
    } catch(err) {
        res.json({message: err.message});
    }
});

router.put('/me', authMiddleware, async(req, res) => {
    try {
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

module.exports = router;