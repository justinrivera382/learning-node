const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title for the review"],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, "Please add some text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a rating between 1 and 10"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // NOTE any references to other "tables" is necessary when it needs to be a part of something. in this case a review cannot exist without being a part of, in this case, a bootcamp
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  // Review is now attached to a User
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// prevents user from creating more than 1 review per bootcamp
ReviewSchema.index(
  {
    bootcamp: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

// NOTE: when you define a standard method you invoke it via the INSTANCE of the model. for example: modelInstance.methodBeingInvokedOnInstance()
// const courses = Course.find();
// courses.goFish();

// those notes were so we can understand what the static method does because we about to make one
// Static method to get average of course tuitions
// remember this is only the definition, we gotta invoke it to run it so we'll invoke it in the getAverageRating() after save/before remove
// NOTE: although this functionality DOES WORK, it only works when you upload a review but when you delete a review it DOES NOT CHANGE the value. Something to keep in mind moving forward. Although this functionality is "finished" and "works" it is NOT "complete" so currently avoid re-creating this kind of functionality in your own applications
// But I do not know that to be the case YET for the review. Gotta see more first then can confirm it or not.
// DOES NOT WORK when you delete or update a review's rating. So this is a bust.
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  // this is known as a pipeline and there are different steps in the pipeline
  const obj = await this.aggregate([
    {
      // we're matching the bootcamp attached to the CourseSchema (which is essentially an an object id) with the received bootcampId
      $match: { bootcamp: bootcampId },
    },
    {
      // this is the calculated object we want to create
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post("save", function () {
  // we can use this.constructor like this because we are in the model
  this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before remove
ReviewSchema.pre("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Review", ReviewSchema);
