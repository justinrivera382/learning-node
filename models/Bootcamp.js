const mongoose = require("mongoose");
const slugify = require("slugify");

const BootcampSchema = new mongoose.Schema({
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
});

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

module.exports = mongoose.model("Bootcamp", BootcampSchema);
