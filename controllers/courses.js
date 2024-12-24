const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @desc        Get courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    // .populate("bootcamp") lets us see the actual bootcamp connected to the course along with ALL of the bootcamp's data
    // query = Course.find().populate("bootcamp");

    // doing .populate(...) this way allows us to grab specific data only
    // query = Course.find().populate({
    //   path: "bootcamp",
    //   select: "name description",
    // });
    res.status(200).json(res.advancedResults);
  }
});

// @desc        Get single course
// @route       GET /api/v1/courses/:id
// @access      Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc        Add course
// @route       POST /api/v1/bootcamps/:bootcampId/courses
// @access      Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  // assign the id found in the request URL to the bootcamp found in "./models/Course.js"
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is the bootcamp owner, it works in this instance because of the nature of the relationship. And since we know that a Bootcamp is attached to a User, and that a Course is attached to a Bootcamp. We check the Bootcamp's User and see their ID, and if they DO NOT match and the Request's User's role is NOT "admin" then throw an error.
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }

  // which includes the bootcampId from the request URL
  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc        Update course
// @route       PUT /api/v1/courses/:id
// @access      Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is the course owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update course ${course._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc        Delete course
// @route       DELETE /api/v1/courses/:id
// @access      Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is the course owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete course ${course._id}`,
        401
      )
    );
  }

  // we don't need to save this into a variable, it's a permanent action that our backend will tell our database to do and then it's done
  // and from what I can tell, the reason why we this instantly works here and when we had to "cascade delete" and have to have that handled via "./models/Bootcamp.js" is because we had to "cascade delete" if we delete the parents we also gotta delete the children otherwise the children exist without any parents and that would be a waste of space
  // otherwise, you can just use ".deleteOne()" like this and you can just instant delete this specific instance based on the "req.params.id"
  await course.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
