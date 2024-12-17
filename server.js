const express = require("express");
const dotenv = require("dotenv");

// Route files
const bootcamps = require("./routes/bootcamps");

// Load env vars
// keep in mind that this makes it "temporarily" available via a "global" path known on the server side called "process", like the window object in the client
dotenv.config({ path: "./config/config.env" });

// initialize app
const app = express();

// Mount routers that we get from const bootcamps
// essentially the first parameter (in this case the route) will be automatically be included within the file of the second parameter (in this case our "router directory")
// it's thanks to this line that we will no longer have to write "/api/v1/bootcamps" in any of our routes found in our ./routes/bootcamps.js file as that url path will be automatically be assigned by default in the file found in the second parameter
app.use("/api/v1/bootcamps", bootcamps);

const PORT = process.env.PORT || 5000;

// set up server
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
