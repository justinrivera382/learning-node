// here we will be creating different methods that will be associated in certain routes, this is where we will be adding all of our functionality for those on the ASSOCIATED url path of /api/v1/bootcamps/

// we're going to export each method so we can bring it into the routes file
// these are basically "middleware functions" so they will take in a (req, res, next), middleware are essentially functions that have access to the request-response cycle (req, res). therefore they run DURING the cycle. you can actually set req variables and all other things. you can create authentication middleware, error handling middleware, etc... you will learn more later about middleware

// bringing in the Bootcamp model from "../models/Bootcamp" to call our methods (CRUD operations) in this file ("./controllers/bootcamp.js") onto the Bootcamp model
const Bootcamp = require("../models/Bootcamp");

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
exports.createBootcamp = async (req, res, next) => {
  try {
    // req.body is where the data is going to live when we send data in the body from the client
    // IMPORTANT: to use req.body we have to use a piece of middleware known as the "body parser" within "./server.js". it will be app.use(express.json()). as you can tell it comes by default with Express
    //   console.log(req.body);

    // now that we've verified that we can use req.body thanks to the "body parser" we will now use our Bootcamp model and populate it with our req.body data
    // if there is a field that exists within req.body that doesn't exist within our model then Mongoose will ignore it
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({ success: true, data: bootcamp });

    // the code directly below was great but now that we have our Bootcamp model implemented and have our req.body able to send data to our Bootcamp model, this code is no longer needed
    //   res.status(200).json({ success: true, msg: "Create new bootcamp" });
  } catch (err) {
    res.status(400).json({ success: false });
  }
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
