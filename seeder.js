// We need "fs" because we'll be dealing with files by bringing in the data from the "./_data" folder and then we'll be using the "mongoose" module to connect to our database and then we'll be using the "dotenv" module to bring in our environment variables
const fs = require("fs");
const mongoose = require("mongoose");

// notice how we are "requiring" colors here, and didn't have to do that with other files that were "attached" to the "server.js" file. It appears that we don't need to "require" it on files that are "children" of any files that are the parent of a file that already has colors "required" in it. Like "./server.js" for example.
const colors = require("colors");

// gives us access to mongo_uri
const dotenv = require("dotenv");

// load environment variables
dotenv.config({ path: "./config/config.env" });

// load models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");

// connect to database
mongoose.connect(process.env.MONGO_URI);

// read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

// Import into database
const importData = async () => {
  try {
    // we don't need to respond with anything, the goal is to just import the data into the database, therefore we don't need to save it into a variable
    await Bootcamp.create(bootcamps);
    // had to comment out temporarily for "Calculating Average Cost With Aggregate" so we could test out the aggregate functionality that we created
    // await Course.create(courses);

    console.log("Data Imported...".green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();

    console.log("Data Destroyed...".red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// this is a way to run the "importData" function from the command line. We can run this by typing "node seeder -i" in the terminal
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
