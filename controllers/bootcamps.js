// here we will be creating different methods that will be associated in certain routes, this is where we will be adding all of our functionality for those on the ASSOCIATED url path of /api/v1/bootcamps/

// we're going to export each method so we can bring it into the routes file
// these are basically "middleware functions" so they will take in a (req, res, next), middleware are essentially functions that have access to the request-response cycle (req, res). therefore they run DURING the cycle. you can actually set req variables and all other things. you can create authentication middleware, error handling middleware, etc... you will learn more later about middleware

// @desk        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public -ERASE:no token required:ERASE-
exports.getBootcamps = (req, res, next) => {
  // because we create a variable/attribute within our "req" we have access to "hello" within our route, which we test in "./controllers/bootcamp.js"
  //   res
  //     .status(200)
  //     .json({ success: true, msg: "Show all bootcamps", hello: req.hello });

  // that above was just an example of having access to "req.[attribute]" within our route
  res.status(200).json({ success: true, msg: "Show all bootcamps" });
};

// @desk        Get single bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Public -ERASE:no token required:ERASE-
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Get bootcamp ${req.params.id}` });
};

// @desk        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private -ERASE:token required/sign in/etc...:ERASE-
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: "Create new bootcamp" });
};

// @desk        Update bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private -ERASE:token required/sign in/etc...:ERASE-
exports.updateBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
};

// @desk        Delete bootcamp
// @route       Delete /api/v1/bootcamps/:id
// @access      Private -ERASE:token required/sign in/etc...:ERASE-
exports.deleteBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
};
