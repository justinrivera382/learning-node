// remember this is middleware, so we gotta run it through app.use in "./server.js" to use it
// NOTE: "./utils/errorResponse.js" has a class errorResponse that extends from the base Error class. But do note that "err" is an INSTANCE of the Error class, aka an object. that is why we have access to the stack, status code, and message here
const errorHandler = (err, req, res, next) => {
  // Log to console for developer
  console.log(err.stack.red.inverse);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Server Error",
  });
};

module.exports = errorHandler;
