// use path to make "./public" a static folder
const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
// const logger = require("./middleware/logger");
const morgan = require("morgan");
// I was testing things, and noticed that the package must be imported BEFORE being used within the "./server.js" file, but when I placed this import after either the importing of const connectDB = require("./config/db"); or invoking connectDB(); it did NOT HAVE AN ERROR. I can only surmise that occurred due to our entire "./server.js" MAYBE running and existing before we dive into the "./config/db" file but I do not know at the moment
const colors = require("colors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error");
// we can import many files, pretty much all files as far as I'm aware, before our dotenv.config({ path: "./config/config.env "}); but you will want to invoke the associated methods/functions after the dotenv.config({ path: "./config/config.env "});, especially if you need to use them in the invoked functions, like connectDB();
const connectDB = require("./config/db");

// Load env vars
// keep in mind that this makes it "temporarily" available via a "global" path known on the server side called "process", like the window object in the client
dotenv.config({ path: "./config/config.env" });

// Connect to database
// You will want to invoke the function BELOW the dotenv.config({ path: "./config/config.env "}); to allow the environment variables to actually exist. otherwise we will invoke connectDB(); to no EXISTING environment variables which will run us into errors
connectDB();

// Route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");

// initialize app
const app = express();

// Body parser
// must be placed, probably, directly below where we "initialize app"
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// this is an EXAMPLE. Middleware doesn't just RUN, it needs to be invoked via app.use(logger)
// app.use(logger);

// Dev logging middleware
// NOTE: middleware is run in order so if it depends on anything our middleware must be placed after its dependency
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileupload());

// Set the "./public" as a static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers that we get from const bootcamps
// essentially the first parameter (in this case the route) will be automatically be included within the file of the second parameter (in this case our "router directory")
// it's thanks to this line that we will no longer have to write "/api/v1/bootcamps" in any of our routes found in our ./routes/bootcamps.js file as that url path will be automatically be assigned by default in the file found in the second parameter
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);

// Error Middleware
// NOTE: middleware is run in order so if it depends on anything our middleware must be placed after its dependency, that's why errorHandler is placed after "Mount routers" that we got from const bootcamps aka app.use("/api/v1/bootcamps", bootcamps)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// set up server
// here we are placing our app.listen(...) into the const server variable so we can close the server when we get an unhandled rejection
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
      .inverse
  )
);

// handle unhandled promise rejections, instead of having to go to "./config/db.js" and use try-catch blocks, we can easily handle those unhandled promise rejections with the below code and utilizing the "server" variable from app.listen(...)
process.on(`unhandledRejection`, (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // close server & exit process
  server.close(() => process.exit(1));
});
