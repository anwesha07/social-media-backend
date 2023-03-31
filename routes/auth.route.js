const router = require('express').Router();
const userRepo = require('../models/User.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {authenticateUser: authMiddleware, validateRegisterData, validateLoginData} = require('../middlewares/auth.middleware')
const {upload} = require('../middlewares')


router.get('/', (req, res)=>{
    res.json("auth route checked");
});



//registration logic

//creating a middleware to call the middleware returned by upload.fields and handle the errors 
//multer middleware
const uploadPhotos = upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'coverPicture', maxCount: 1 }]);

const handleUploadPhotos = (req, res, next) => {
    uploadPhotos(req, res, function (err) {
        if (err) {
            //error ocurred while uploading the filea using multer
            res.status(400).json({message: err.message})
            return;
        }
        //uploading was successful
        next();
    })
}

router.post('/register', handleUploadPhotos, validateRegisterData, async (req, res)=>{

        const profilePicture = req.files.profilePicture?req.files.profilePicture[0].path:'';
        const coverPicture = req.files.coverPicture?req.files.coverPicture[0].path:'';
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const user = new userRepo({
                ...req.body,
                password : hashedPassword,
                profilePicture: profilePicture,
                coverPicture: coverPicture

            })

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
            const {password, ...savedUser} = user.toObject();
            
            res.status(201).json({
                message: "user saved succesfully",
                ...savedUser,
                token
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({error: error.message});

        }
});

//login logic
router.post('/login', validateLoginData, async(req, res) => {
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

            const {_id: userId, username, email, profilePicture} = user;

            res.json({ userId, username, email, token, profilePicture});
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
        await userRepo.findOneAndUpdate({_id: userId}, {$pull: { token: currentToken}}, {new: true});
        res.json();
    }catch(err) {
        res.json(err.message);
    }
});

module.exports = router;