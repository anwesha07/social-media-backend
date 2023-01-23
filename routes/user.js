const router = require("express").Router();
const userRepo = require('../models/User.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


router.get('/me', async(req, res)=>{
    try{
        const tokenUser = jwt.verify(req.headers['x-token'], process.env.TOKEN_KEY);
        const userId = tokenUser.user_id;
        try {
            const user = await userRepo.findOne({_id : userId}, {__v:0, token:0, password:0});
            res.json(user);
        } catch(err) {
            res.json(err.message);
        }
    } catch(err) {
        res.json({message: "Invalid token"});
    }

    res.json();
});
router.get('/:id', async(req, res)=>{
    userId = req.params.id;
    try {
        const user = await userRepo.findOne({_id : userId}, {
            username: 1,
            profilePicture: 1,
            coverPicture: 1,
            followers: 1,
            following: 1
        })
        res.json(user);
    } catch(err) {
        res.json({message: err.message});
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
        })
        res.json(user);
    } catch(err) {
        res.json({message: err.message});
    }
});

router.put('/me', async(req, res) => {
    try{
        const tokenUser = jwt.verify(req.headers['x-token'], process.env.TOKEN_KEY);
        const userId = tokenUser.user_id;
        try {
            const updatedUser = await userRepo.findOneAndUpdate({_id : userId},{$set: req.body}, { new: true});
            res.json(updatedUser);
        } catch(err) {
            res.json(err.message);
        }
    } catch(err) {
        res.json({message: "Invalid token"});
    }   
});

router.delete('/me', async(req, res) => {
    try{
        const tokenUser = jwt.verify(req.headers['x-token'], process.env.TOKEN_KEY);
        const userId = tokenUser.user_id;
        try {
            await userRepo.deleteOne({_id: userId});
            res.status(204).json();
        } catch(err) {
            res.json(err.message);
        }
    } catch(err) {
        res.json({message: "Invalid token"});
    }   
});

module.exports = router;