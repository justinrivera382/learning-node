const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // the point is the standard syntax with a "Bearer Token" is:
    // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjhlNDYwOTA2MjljMWQ3NjYwMjU2YyIsImlhdCI6MTczNDk4ODE4MywiZXhwIjoxNzM3NTgwMTgzfQ.2yN05oAabG7iIsWwamIHUFdc_oHtpdeHnxRqVVNlxkk"
    // if you can't tell, there's an empty space between "Bearer" and the "actual token". So that's why we're checking if it starts with "Bearer" and then we're formatting it with ".split(" ")[1]" with the [0]-index holding the value "Bearer" and the [1]-index holding whatever the "actual token" value is which is what we're storing in our token variable
    // NOTE the Bearer token was actually flagged by a 3rd party as a "leak" which is fine because this is just a practice project and not going to be actually released outside of just for fun in this case. the 3rd party seems legitimate though after some research on them. not a fan of them just "scraping" for emails on github but they did have a decent check with what appears to be good intentions so no real complaints here
    token = req.headers.authorization.split(" ")[1];
  }
  // we will handle this later
  //   else if(req.cookies.token) {
  // token = req.cookies.token
  //   }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    // We're verifying the payload which is an object that looks like this:
    // { id: 1, iat: 1734989044, expiration: 1737581044 }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    // this line essentially means that this will always be the currently logged in user
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

// Grant access to specific roles
// this function will receive a "comma separated values" array of roles like
// publisher, admin, user
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role "${req.user.role}" is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};
