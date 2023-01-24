const router = require('express').Router();
const userRepo = require('../models/User.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/', (req, res)=>{
    res.json("auth route checked");
})

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
})

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
            console.log(user);

            const {_id: userId, username, email} = user;

            res.json({ userId, username, email, token});
            return;
        }
        // else {
        //     //wrong password
        //     res.status(401).json({message: "incorrect credentials"});
        // }
    }
    res.status(401).json({message : "incorrect credentials"});
})

module.exports = router;