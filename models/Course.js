const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a course title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  weeks: {
    type: String,
    required: [true, "Please add number of weeks"],
  },
  tuition: {
    type: Number,
    required: [true, "Please add tuition cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add a minimum skill"],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // bootcamp is important because, in this case, the "Course" is attached to a Bootcamp.
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  // Course is now attached to a User
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// NOTE: when you define a "static" method you can invoke it directly on the model itself. for example: ModelName.staticMethodBeingInvokedDirectlyOnModel()
// Course.goFish();

// NOTE: when you define a standard method you invoke it via the INSTANCE of the model. for example: modelInstance.methodBeingInvokedOnInstance()
// const courses = Course.find();
// courses.goFish();

// those notes were so we can understand what the static method does because we about to make one
// Static method to get average of course tuitions
// remember this is only the definition, we gotta invoke it to run it so we'll invoke it in the getAverageCost() after save/before remove
// NOTE: although this functionality DOES WORK, it only works when you upload a course but when you delete a course it DOES NOT CHANGE the value. Something to keep in mind moving forward. Although this functionality is "finished" and "works" it is NOT "complete" so currently avoid re-creating this kind of functionality in your own applications
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  // console.log("Calculating average cost...".blue);

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
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  // console.log(obj);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
CourseSchema.post("save", function () {
  // we can use this.constructor like this because we are in the model
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
