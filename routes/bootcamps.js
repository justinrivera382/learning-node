const express = require("express");

// we delete the original routes and exported them from our controllers directory to clean everything up and now they're imported into our "routes/bootcamps.js"
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");

// Include other resource routers
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

// initialize router and we will no longer have access to app here and instead we will be using "router"
// the entire point of the express.Router() is to give us the ability to "modularize" and maintain our url paths more easily
// you should see when we go use the "user signup" route where we will be authenticating users with a different route in, probably, a different file called "authentication.js" or something like that
const router = express.Router();

const advancedResults = require("../middleware/advancedResults");
// protecting our routes by checking their credentials, essentially creating that "private" routes we talked about in "./controllers" directory
// now we brought in "authorize" so only accounts with certain roles can access certain routes
const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers
// from what I'm seeing, we're "building" up the URL so the "full" URL for router.use("/:bootcampId/courses", courseRouter) would be "/api/v1/bootcamps/:bootcampId/courses" which is then passed into the courseRouter found in "./routes/courses.js"
// when having to add a course, we have to "attach" it to something. a course can NOT be standalone. so we have to
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

// in the "./server.js" we have app.use("/api/v1/bootcamps") meaning we don't have to write "/api/v1/bootcamps" in our routes here as they're already included in the "./server.js" file
// so now our "full" route in this specific router.route(...) is "/api/v1/bootcamps/radius/:zipcode/:distance"
router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

// here since our getBootcamps and createBootcamp found in our "./controllers/bootcamp.js" file shares the same base url path, in this case "/api/v1/bootcamps" which we got from our "./server.js" file from [app.use("/api/v1/bootcamps", bootcamps)] which gets pushed into "./controllers/bootcamps.js"
router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);

// ORDER MATTERS, protect is what "sets" the account role which authorize() uses to cross check the roles given to it. If we place "protect" after "authorize(...)" we will run into ERRORS
router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

// since our getBootcamp, updateBootcamp, and deleteBootcamp require the :id, we have to route them like this and, just like stated earlier, we get the rest of the base url path, "/api/v1/bootcamps" from our "./server.js" file from [app.use("/api/v1/bootcamps", bootcamps)] which gets pushed into "./controllers/bootcamps.js"
router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

module.exports = router;
