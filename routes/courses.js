const express = require("express");

const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");

// the params must be merged for us to use the "re-route" we did from "./routes/bootcamps.js"
const router = express.Router({ mergeParams: true });

// I'm still kinda confused, all I can understand so far is that, probably, all POST requests are routed via a root route "/", maybe?
// if so then it's just a pattern but to be fair we did have to "re-route" the "/api/v1/bootcamps" from "./server.js" to "./routes/bootcamps.js" where we build it further using "/:bootcampId/courses" turning it into a longer route of "/api/v1/bootcamps/:bootcampId/courses" which then gets passed into the current file "./routes/courses.js"
// what does confuse me is how both the ".get(getCourses)" and ".post(addCourse)" use the same route in this file. But that possibly could be attributed to using "two default" routes that the program might branch and do its own if-statement until it finds a valid "root" route? that's all I can surmise from all the information that I've looked back on.
// after re-looking I've found that the specific route at the ".get(getCourses)" is NOT just a single route, but both "/api/v1/courses" AND "/api/v1/bootcamps/:bootcampId/courses" so maybe that's how it's capable of being connected to the same "root" route
// all of this is kind of confusing but by building more of this it should come more easily
router.route("/").get(getCourses).post(addCourse);
router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
