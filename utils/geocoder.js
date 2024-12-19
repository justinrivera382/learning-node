// after importing the geocoder module, we are creating a new instance of the geocoder with the options that we have set up in the config.env file, and then we are exporting the geocoder module so that we can use it in other files, in this case the "./models/Bootcamp.js" file
const NodeGeocoder = require("node-geocoder");

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
