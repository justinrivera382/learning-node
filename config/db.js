// connecting to our database with mongoose in this file
const mongoose = require("mongoose");

const connectDB = async () => {
  // process.env.MONGO_URI is visible via "./server.js" where it runs because when the dotenv.config({ path: "./config/config.env" }) runs, all environment variables will be "temporarily" visible to the GLOBAL "process", aka the "window" object of the server (it's not really the server I think, but currently that is pointless to know)
  const conn = await mongoose.connect(process.env.MONGO_URI);

  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
