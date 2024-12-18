// the point of this handler is that, since we have created an easy "templated" way to handle our errors in "./controllers/bootcamps.js", that means we aren't DRY and since it's "templated/repeated" then we can just use this asyncHandler to take the entire method and check for errors, if there are errors then the asyncHandler will catch them and throw the error message with the right status code otherwise we will run successfully
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
