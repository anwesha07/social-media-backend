// create a base http exception class inheriting the Error class

class HttpException extends Error {
  body;

  constructor(statusCode, message) {
    super(message);
    this.body = {
      status: 'failure',
      statusCode,
      message,
    };
  }
}

module.exports = HttpException;
