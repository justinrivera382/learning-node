// here we will be creating different methods that will be associated in certain routes, this is where we will be adding all of our functionality for those on the ASSOCIATED url path of /api/v1/bootcamps/

// we're going to export each method so we can bring it into the routes file
// these are basically "middleware functions" so they will take in a (req, res, next), middleware are essentially functions that have access to the request-response cycle (req, res). therefore they run DURING the cycle. you can actually set req variables and all other things. you can create authentication middleware, error handling middleware, etc... you will learn more later about middleware

// path will be useful to get the file extension, I think
const path = require("path");
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

  // Did this to test what the query would look like when we take it in
  // console.log(req.query);

  // we have access to res.advancedResults because the ".getBootcamps" in our "./controllers/bootcamp.js" is being used in the "./routes/bootcamp.js" route which is using the "./middleware/advancedResults.js" middleware
  // in short: route is called (if invokes any middleware, it must complete before moving on) -> looks at controller to see what to do (if invokes any middleware, it must complete before moving on) -> now you get the final result
  res.status(200).json(res.advancedResults);
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

  // Add user to req.body so we can use it in const bootcamp
  req.body.user = req.user.id;

  // Check for any prior published bootcamp
  // we're finding the user via the login id, aka req.user.id
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // if the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

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
  // With the code before being "findByIdAndUpdate()" there would be no checks to see the user's permissions so we're updating it so we can find the user and their role/authorization then update if they are permitted by using "findById()" first
  // also using "let" so with any data changes we can just re-assign to bootcamp again
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is the bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

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

  // to use the middleware BootcampSchema.pre("deleteOne", ...) found in "./models/Bootcamp.js" you can NOT use "findByIdAndDelete(req.params.id)" so we changed it to ".findById(req.params.id)" which gets the bootcamp and checks if it exists
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is the bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this bootcamp`,
        401
      )
    );
  }

  // this is where we delete the actual bootcamp, the ".deleteOne()" triggers the middleware from "./models/Bootcamp.js"
  await bootcamp.deleteOne();

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

// @desk        Upload photo for bootcamp
// @route       PUT /api/v1/bootcamps/:id/photo
// @access      Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is the bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  console.log(req.files);
  const file = req.files.file;

  // Make sure the image is a photo
  // if you look at the console.log(req.files) you will see there is an attribute called "mimetype" which we check and its value is "image/jpeg" so we're just checking if it starts with an "image" and if not raise error
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename by importing "file"
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });

  // console.log(file.name);
});
