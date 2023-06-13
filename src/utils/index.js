const { HttpException } = require("./exceptions");

const asyncWrap = (func) => {
  return (req, res, next) => func(req, res, next).catch((error) => next(error));
};

// global error handling mw
function globalErrorHandler(error, _req, res, next) {
  if (res.headersSent) {
    // Delegating to built-in error handler
    next(error);
    return;
  }
  console.log(error);

  // This is my custom error
  if (error instanceof HttpException) {
    res.status(error.body.statusCode).send({ message: error.body.message });
    return;
  }

  // any unhandled error
  res.status(500).send({ message: error.message });
}

module.exports = {
  globalErrorHandler,
  asyncWrap,
};
