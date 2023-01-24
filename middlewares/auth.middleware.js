const userRepo = require('../models/User.js');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const authenticateUser = async(req, res, next) => {
    try {
        const { user_id: userId } = jwt.verify(req.headers['x-token'], process.env.TOKEN_KEY);
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
};

const validateRegisterData = (req, res, next) => {
    const registerSchema = Joi.object().keys({ 
        username: Joi.string().required(),
        password: Joi.string().min(6).required(), 
        email: Joi.string().email().required(),
        profilePicture: Joi.string().default(''),
        coverPicture: Joi.string().default(''),
        isAdmin: Joi.boolean().default(false)
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

module.exports = {
    authenticateUser,
    validateRegisterData,
    validateLoginData
};