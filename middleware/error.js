// remember this is middleware, so we gotta run it through app.use in "./server.js" to use it
const errorHandler = (err, req, res, next) => {
  // Log to console for developer
  console.log(err.stack.red);

  res.status(500).json({
    success: false,
    error: err.message,
  });
};

module.exports = errorHandler;
