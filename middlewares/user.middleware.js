const Joi = require('joi');

const validateUpdateUserData = (req, res, next) => {
    const updateUserDataSchema = Joi.object().keys({ 
        username: Joi.string(),
        password: Joi.string().min(6), 
        profilePicture: Joi.string(),
        coverPicture: Joi.string(),
        isAdmin: Joi.boolean()
    }); 
    const { error } = updateUserDataSchema.validate(req.body);
    if (!error) next();
    else {
        res.status(400).json({message: error.details[0].message});
    }
};

module.exports = validateUpdateUserData;