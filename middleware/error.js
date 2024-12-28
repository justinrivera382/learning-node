// remember this is middleware, so we gotta run it through app.use in "./server.js" to use it

const ErrorResponse = require("../utils/errorResponse");

// NOTE: "./utils/errorResponse.js" has a class errorResponse that extends from the base Error class. But do note that "err" is an INSTANCE of the Error class, aka an object. that is why we have access to the stack, status code, and message here
const errorHandler = (err, req, res, next) => {
  // we're taking the "err" that was passed in from "./controllers/bootcamps.js" and passing it into error variable, spreading the data into the error variable. which works thanks to "./server.js" with the line of code that says app.use(errorHandler);
  let error = { ...err };

  // we're reconfiguring the error.message to have the err.message that was passed in from "./controllers/bootcamps.js". which works thanks to "./server.js" with the line of code that says app.use(errorHandler);
  error.message = err.message;
  // Log to console for developer
  // console.log(err.stack.red.inverse);

  //log to console to better understand "err"
  // shows us where we got err.value that we use in the if-statement err.name === "CastError"
  console.log(err);

  // Mongoose "bad ObjectId"
  // What we're using this console log is to see the name of the error, in this we find it to be a "CastError" which in Mongoose is a "bad ObjectId"
  // console.log(err.name);

  // now since we know what the name of the error is, we commented it out and used the if statement to "catch" the name and output a certain result, in this case a custom message and error response. an ErrorResponse class that we created and extended from the base Error class.
  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  // in this instance the name was "MongoServerError" but we decided to use the "code" property that is found in this specific error. I tested it and didn't find a "code" property on the "CastError"
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  // You gotta use what you have to work with, this seems to be what I understand. If there is a "code" attribute, go ahead and use that to identify the Error Type. Otherwise go ahead and use the error "name" attribute and create a condition based on that
  // This is phenomenal because we now have implemented VALIDATION without a 3rd party package and it's simple to do
  if (err.name === "ValidationError") {
    // in this instance, the "ValidationError" has an array of error objects associated with it, so we're using Object.values(...) to grab all the values in each error object
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);

    // I was trying to find where the "message" property existed, but I just couldn't find it so this is more of a "Just believe it scenario right now"
    // const errorObjects = Object.values(err.errors);
    // const firstError = errorObjects[0];
    // console.log(firstError.message);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
