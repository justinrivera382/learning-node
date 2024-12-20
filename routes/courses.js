const express = require("express");

const { getCourses } = require("../controllers/courses");

// the params must be merged for us to use the "re-route" we did from "./routes/bootcamps.js"
const router = express.Router({ mergeParams: true });

router.route("/").get(getCourses);

module.exports = router;
