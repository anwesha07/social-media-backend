// 403
const HttpException = require('./HttpException');

class ForbiddenException extends HttpException {
  constructor(message) {
    super(403, message);
  }
}

module.exports = ForbiddenException;
