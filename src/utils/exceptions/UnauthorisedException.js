// 401
const HttpException = require('./HttpException');

class UnauthorisedException extends HttpException {
  constructor(message) {
    super(401, message);
  }
}

module.exports = UnauthorisedException;
