// Utils are just non-middleware that are more helpers and utilities
class ErrorResponse extends Error {
  // constructors are just methods that run when we instantiate an object from the class, here we are customizing the message and status code
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
