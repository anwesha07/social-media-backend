const router = require('express').Router();
const userRepo = require('../models/User.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth.middleware')


router.get('/', (req, res)=>{
    res.json("auth route checked");
});

//registration logic
router.post('/register', async (req, res)=>{
    console.log(req.body);
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const user = new userRepo({
            username : req.body.name,
            email : req.body.email,
            password : hashedPassword,
        })
        console.log(user);
        await user.save();
        res.status(201).json({message: "user saved succesfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});

    }
});

//login logic
router.post('/login', async(req, res) => {
    const user = await userRepo.findOne({email: req.body.email});
    if (user) {
        //if user exists, match password
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            //password matched, create jwt token
            const token = jwt.sign(
                {   user_id: user._id,
                    email: user.email
                },
                process.env.TOKEN_KEY,
                {
                  expiresIn: "8h",
                }
              );
        
            // save user token
            user.token.push(token);
            await user.save();
            
            const {_id: userId, username, email} = user;

            res.json({ userId, username, email, token});
            return;
        }
    }
    res.status(401).json({message : "incorrect credentials"});
});

//logout logic
router.post('/logout', authMiddleware, async(req, res) => {
    const userId = req.user._id;
    const currentToken = req.headers['x-token'];
    try{
        const updatedUser = await userRepo.findOneAndUpdate({_id: userId}, {$pull: { token: currentToken}}, {new: true});
        res.json();
    }catch(err) {
        res.json(err.message);
    }
});

module.exports = router;