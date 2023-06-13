const Joi = require("joi");
const BadRequestException = require("../utils/exceptions/BadRequestException");

const validateUpdateUserData = (req, res, next) => {
  const updateUserDataSchema = Joi.object().keys({
    username: Joi.string(),
    password: Joi.string().min(6),
    profilePicture: Joi.string().allow(""),
    coverPicture: Joi.string().allow(""),
    description: Joi.string().allow(""),
  });
  const { error } = updateUserDataSchema.validate(req.body);
  if (!error) next();
  else {
    throw new BadRequestException(error.details[0].message);
  }
};

module.exports = validateUpdateUserData;
