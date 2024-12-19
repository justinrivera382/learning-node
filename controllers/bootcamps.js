// here we will be creating different methods that will be associated in certain routes, this is where we will be adding all of our functionality for those on the ASSOCIATED url path of /api/v1/bootcamps/

// we're going to export each method so we can bring it into the routes file
// these are basically "middleware functions" so they will take in a (req, res, next), middleware are essentially functions that have access to the request-response cycle (req, res). therefore they run DURING the cycle. you can actually set req variables and all other things. you can create authentication middleware, error handling middleware, etc... you will learn more later about middleware

const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
// bringing in the Bootcamp model from "../models/Bootcamp" to call our methods (CRUD operations) in this file ("./controllers/bootcamp.js") onto the Bootcamp model
const Bootcamp = require("../models/Bootcamp");

// @desk        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public -ERASE:no token required:ERASE-
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // try {
  // } catch (err) {
  //   res.status(400).json({ success: false });
  // }
  // because we create a variable/attribute within our "req" we have access to "hello" within our route, which we test in "./controllers/bootcamp.js"
  //   res
  //     .status(200)
  //     .json({ success: true, msg: "Show all bootcamps", hello: req.hello });

  // that above was just an example of having access to "req.[attribute]" within our route
  const bootcamps = await Bootcamp.find();
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desk        Get single bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Public -ERASE:no token required:ERASE-
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  // try {
  const bootcamp = await Bootcamp.findById(req.params.id);

  // this is needed because a CORRECTLY formatted :id of a resource that does NOT exist will still give a success 200 status. so this if statement will catch that and give a 400 status, which is the desired status to give the end user in this instance
  if (!bootcamp) {
    //   return res.status(400).json({ success: false });
    // now we use this code directly below to have a more custom error response which we get from "./utils/errorResponse.js", remember our constructor for ErrorResponse takes in a message and status code (message, statusCode) in that order just like how we see it below
    // although we've just updated our "./middleware/error.js" to receive the "err" body caught and sent to it via the "catch" branch. it will NOT work here since we aren't catching and sending an "err" body here. so all we have currently is the standard new ErrorResponse(...) which is fine for now
    // another thing to NOTE is that this Error update works only when we're grabbing for certain :id's. so something like "Get All" will not be affected since we're grabbing everything at once, for example
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
  // } catch (err) {
  // res.status(400).json({ success: false });
  // the standard result when doing next(err) is we will send html, but we don't want that we want to send JSON so now we're going to create an error.js in "./middleware/error.js"
  // even though we created the next(new ErrorResponse...), it's just not DRY enough so the plan is to move the newErrorResponse... into the "./middleware/error.js" to clean up the code
  // NOTE that the next(err); works here and with all other methods that require a specific :id. So "Get All" will not work with this current error update cause we're looking for, in this case, a "CastError".
  // But it doesn't matter the specific error, our goal here is to catch any "err" (error) and pass it into the next(err); So if we have a different type, all we have to do is go to "./middleware/error.js" and add it with our if-statement
  // NOTE that different Error Types have different properties and values that we have to test for. In the case of "CastError", it's an improper :id. Keep that in mind
  // next(err);

  // now we use this code directly below to have a more custom error response which we get from "./utils/errorResponse.js", remember our constructor for ErrorResponse takes in a message and status code (message, statusCode) in that order just like how we see it below
  // next(
  //   new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
  // );
  // }
});

// @desk        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private -ERASE:token required/sign in/etc...:ERASE-
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // try {
  // req.body is where the data is going to live when we send data in the body from the client
  // IMPORTANT: to use req.body we have to use a piece of middleware known as the "body parser" within "./server.js". it will be app.use(express.json()). as you can tell it comes by default with Express
  //   console.log(req.body);

  // now that we've verified that we can use req.body thanks to the "body parser" we will now use our Bootcamp model and populate it with our req.body data
  // if there is a field that exists within req.body that doesn't exist within our model then Mongoose will ignore it
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({ success: true, data: bootcamp });

  // the code directly below was great but now that we have our Bootcamp model implemented and have our req.body able to send data to our Bootcamp model, this code is no longer needed
  //   res.status(200).json({ success: true, msg: "Create new bootcamp" });
  // } catch (err) {
  // next(err);
  // }
});

// @desk        Update bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private -ERASE:token required/sign in/etc...:ERASE-
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  // try {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
  // } catch (err) {
  // next(err);
  // res.status(400).json({ success: false });
  // }
});

// @desk        Delete bootcamp
// @route       Delete /api/v1/bootcamps/:id
// @access      Private -ERASE:token required/sign in/etc...:ERASE-
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  // try {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: {} });
  // } catch (err) {
  // next(err);
  // res.status(400).json({ success: false });
  // }
});

// @desk        Get bootcamps within a radius
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private -ERASE:token required/sign in/etc...:ERASE-
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get latitude/longitude from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // calculate the radius using radians
  // Divide distance by radius of Earth
  // Earth Radius = 3,963 miles || 6,378 kilometers
  const radius = distance / 3963;

  // NOTE that the ".find()" method exists on the Bootcamp model but not the Bootcamp schema. So we can't find ".find()" in the Bootcamp schema only the Bootcamp model aka the instance of the Bootcamp schema
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });

  // now we have to create routes because we need a way to access ".getBootcampsInRadius"
});
