// EXAMPLE middleware function, note all middleware have (req, res, next) parameters

// @desc        Logs request to console
const logger = (req, res, next) => {
  // because we create a variable/attribute within our "req" we have access to "hello" within our route, which we test in "./controllers/bootcamp.js"
  //   req.hello = "Hello World";
  console.log(
    `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`
  );
  // must call next so middleware knows when to move on in the req-res cycle, next() comes from our 3rd parameter
  next();
};

module.exports = logger;
