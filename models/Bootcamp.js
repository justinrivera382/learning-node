const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Name can not be more than 500 characters"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL with HTTP or HTTPS",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number can not be longer than 20 characters"],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Buttmuncher",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating can not be more than 10"],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // now we have a user associated to a bootcamp
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    // Virtuals are important to "reverse populate" our data from courses to bootcamps
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create bootcamp slug from the name
// we use "pre" because we want this to occur before the "save"
// we use a normal function not an arrow function because of the scoping of the "this" keyword
// This is IMPORTANT because if we have the slug available to pull from a frontend like REACT, it makes it more user friendly for SEO purposes. This is why the "slugify api" is so great
BootcampSchema.pre("save", function (next) {
  // the code console.log("Slugify ran", this.name) was to "prove" that we can have access to our "document data" in our mongodb database that exists thanks to the schema we created in "./models/Bootcamp.js"
  // console.log("Slugify ran", this.name);

  // slugifying the name created by our BootcampSchema. remember we are "pre" on it so our middleware will receive the entire body of data (in this case we want to grab specifically the name) => slugify receives the body of data (we want the name here) to then slugify will do something to the name, in this case "slugify" it => and then save it onto our BootcampSchema. which is great because it allows us to manipulate/use data for any other of our fields created in our BootcampSchema
  this.slug = slugify(this.name, { lower: true });
  // next() is always important in middleware, it's used to know when we need to move on to the next middleware/functionality
  next();
});

// Geocode & create location field
// note that the ".geocode" method is asynchronous and that's why we use the "async/await" syntax
BootcampSchema.pre("save", async function (next) {
  // REMEMBER, we can access any of the fields in our BootcampSchema using the "this" keyword. And we must use the standard function syntax for the "this" keyword to work as we expect
  const loc = await geocoder.geocode(this.address);
  // this.location must have type of "Point" because they're required in our BootcampSchema
  // this.location must have coordinates because they're required in our BootcampSchema
  // Keep in mind that the structure of this.location is the way that it is because if we look at the "Node Geocoder" docs on Github, the input we receive from "Node Geocoder" is an array of objects. And in this case we're just grabbing the first object in the array and all of its properties (formattedAddress, street: streetName, ..., country)
  // Quick note, had to use country instead of countryCode because the API GeoCodio doesn't seem to have a countryCode property
  // Update: turns out there is also no "stateCode" property, so we have to use "state" instead
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].state,
    zipcode: loc[0].zipcode,
    country: loc[0].country,
  };

  // Do not save address in database, the address itself doesn't need to be saved since we saved all the location data that we created for our BootcampSchema into our "location" field
  this.address = undefined;

  next();
});

// Cascade delete courses when a bootcamp is deleted
// Note any function that takes in a parameter called "next" is a middleware function
// We are able to delete the course during bootcamp removal because of the ".pre(...)" method as it will perform this operation BEFORE the actual deletion
BootcampSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Courses being removed from bootcamp ${this._id}`);
    await this.model("Course").deleteMany({ bootcamp: this._id });
    next();
  }
);

// Reverse populate with virtuals
BootcampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
