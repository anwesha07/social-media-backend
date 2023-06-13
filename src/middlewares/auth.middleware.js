const userRepo = require("../models/User.js");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { asyncWrap } = require("../utils");
const BadRequestException = require("../utils/exceptions/BadRequestException.js");
const UnauthorisedException = require("../utils/exceptions/UnauthorisedException.js");
const InternalServerErrorException = require("../utils/exceptions/InternalServerErrorException.js");

const authenticateUser = asyncWrap(async (req, res, next) => {
  let userId;
  try {
    ({ user_id: userId } = jwt.verify(
      req.headers["x-token"],
      process.env.TOKEN_KEY
    ));
    try {
      const user = await userRepo
        .findOne({ _id: userId }, { __v: 0, password: 0 })
        .lean();
      if (user.token.includes(req.headers["x-token"])) {
        req.user = user;
        next();
      } else {
        // token doesnot exist
        throw new UnauthorisedException("Invalid token");
      }
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  } catch (err) {
    throw new UnauthorisedException("Invalid token");
  }
});

const validateRegisterData = asyncWrap(async (req, _res, next) => {
  const registerSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
    dateOfBirth: Joi.string(),
    description: Joi.string().allow(""),
    profilePicture: Joi.string().allow(""),
    coverPicture: Joi.string().allow(""),
    isAdmin: Joi.boolean(),
  });
  const { error } = registerSchema.validate(req.body);
  if (!error) next();
  else {
    throw new BadRequestException(error.details[0].message);
  }
});

const validateLoginData = asyncWrap(async (req, _res, next) => {
  const loginSchema = Joi.object().keys({
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required(),
  });
  const { error } = loginSchema.validate(req.body);
  if (!error) next();
  else {
    throw new BadRequestException(error.details[0].message);
  }
});

module.exports = {
  authenticateUser,
  validateRegisterData,
  validateLoginData,
};
