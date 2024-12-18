// remember this is middleware, so we gotta run it through app.use in "./server.js" to use it

const ErrorResponse = require("../utils/errorResponse");

// NOTE: "./utils/errorResponse.js" has a class errorResponse that extends from the base Error class. But do note that "err" is an INSTANCE of the Error class, aka an object. that is why we have access to the stack, status code, and message here
const errorHandler = (err, req, res, next) => {
  // we're taking the "err" that was passed in from "./controllers/bootcamps.js" and passing it into error variable, spreading the data into the error variable. which works thanks to "./server.js" with the line of code that says app.use(errorHandler);
  let error = { ...err };

  // we're reconfiguring the error.message to have the err.message that was passed in from "./controllers/bootcamps.js". which works thanks to "./server.js" with the line of code that says app.use(errorHandler);
  error.message = err.message;
  // Log to console for developer
  console.log(err.stack.red.inverse);

  // Mongoose "bad ObjectId"
  // What we're using this console log is to see the name of the error, in this we find it to be a "CastError" which in Mongoose is a "bad ObjectId"
  // console.log(err.name);

  // now since we know what the name of the error is, we commented it out and used the if statement to "catch" the name and output a certain result, in this case a custom message and error response. an ErrorResponse class that we created and extended from the base Error class.
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
