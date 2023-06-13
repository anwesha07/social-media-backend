// 500
const HttpException = require('./HttpException');

class InternalServerErrorException extends HttpException {
  constructor(message) {
    super(500, message);
  }
}

module.exports = InternalServerErrorException;
