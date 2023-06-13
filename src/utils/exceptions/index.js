// the base class for custom error handling
const HttpException = require('./HttpException');
const ForbiddenException = require('./ForbiddenException');
const BadRequestException = require('./BadRequestException');
const InternalServerErrorException = require('./InternalServerErrorException');
const NotFoundException = require('./NotFoundException');
const UnauthorisedException = require('./UnauthorisedException');
const ConflictException = require('./ConflictException');

module.exports = {
  HttpException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorisedException,
  ConflictException,
};
