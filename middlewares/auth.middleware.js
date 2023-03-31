const userRepo = require('../models/User.js');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const authenticateUser = async(req, res, next) => {
    let userId
    try {
        ({ user_id: userId } = jwt.verify(req.headers['x-token'], process.env.TOKEN_KEY));
        try {
            const user = await userRepo.findOne({ _id: userId }, { __v : 0, password: 0 }).lean();
            if (user.token.includes(req.headers['x-token'])) {
                req.user = user;
                next();
            } else {
                res.status(403).json({ message: "Invalid token" });
            }
        } catch(err) {
            res.status(403).json({ message: "Invalid token" });
    
        }
    } catch(err) {
        res.status(403).json({ message: "Invalid token" });
    }
    

};

const validateRegisterData = (req, res, next) => {
    const registerSchema = Joi.object().keys({ 
        username: Joi.string().required(),
        password: Joi.string().min(6).required(), 
        email: Joi.string().email().required(),
        dateOfBirth: Joi.string(),
        description: Joi.string().allow(''),
        profilePicture: Joi.string().allow(''),
        coverPicture: Joi.string().allow(''),
        isAdmin: Joi.boolean()
    }); 
    const { error } = registerSchema.validate(req.body);
    if (!error) next();
    else {
        res.status(400).json({message: error.details[0].message});
    }
};

const validateLoginData = (req, res, next) => {
    const loginSchema = Joi.object().keys({ 
        password: Joi.string().min(6).required(), 
        email: Joi.string().email().required(),
    }); 
    const { error } = loginSchema.validate(req.body);
    if (!error) next();
    else {
        res.status(400).json({message: error.details[0].message});
    }
};

// named export -> two ways to import either full obj or destructure it, should give same file name
module.exports = {
    authenticateUser,
    validateRegisterData,
    validateLoginData
};