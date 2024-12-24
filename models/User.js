const crypto = require("crypto");
// can't make a new schema for database withOUT Mongoose!
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a nam"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  role: {
    type: String,
    enum: ["user", "publisher"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    // the point of select is when we get the user through our api it won't actually show/return the password
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
// makes passwords secure
// I was confused about the "next" parameter so I looked it up and it said:
// Middleware (next): The next function is used specifically in Mongoose middleware (such as pre and post hooks), where you want to either proceed with the next middleware or handle errors. It is necessary in those cases to control the flow of the operation (e.g., saving the document, updating, etc.).
// Instance Methods (this): The getSignedJwtToken method you're defining is a custom instance method on the User model, not a middleware. This method doesn't need next() because it's not part of the middleware chain that Mongoose needs to control the flow for.
// Your method is simply a function that generates a JWT and returns it. It operates on the specific instance of a User, and it doesn’t involve async operations or Mongoose middleware that would require the next function.
UserSchema.pre("save", async function (next) {
  // if-statement matters because ".pre("save")" always runs whenever a model instance uses ".save()". for example "userModelInstance.save(...)" which will run all ".pre("save")" that exist in the Model Schema. in this example it would be the User Model Schema.
  // therefore, it, originally, would want us to change the password, but using the if-statement we can check if we modified the password, if we did we can encrypt and update it, if not we can just go to the "next()" middleware
  if (!this.isModified("password")) {
    next();
  }

  // genSalt is "how encrypted" you want it to be and 10 is the recommended value
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  // because this is NOT a static method, we're calling this._id on the actual user and will have access to the user
  // to clarify, we DO have access to a specific user instance's id because it is NOT a static method
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
// NOTE ".matchPassword()" is NOT a static method, therefore it is called on the actual user instance meaning it has access to the actual hashed password on the user instance
UserSchema.methods.matchPassword = async function (loginPassword) {
  return await bcrypt.compare(loginPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiration time, in this case 10 minutes
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
