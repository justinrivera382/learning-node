const express = require("express");
// initialize router and we will no longer have access to app here and instead we will be using "router"
// the entire point of the express.Router() is to give us the ability to "modularize" and maintain our url paths more easily
// you should see when we go use the "user signup" route where we will be authenticating users with a different route in, probably, a different file called "authentication.js" or something like that
const router = express.Router();

// basic route template creation using EXPRESS
// app.get("/", (req, res) => {
//   res.status(200).json({ success: true, data: { id: 1 } });
// });

// since we will be using router change "app.[crud operation here]("/...")" to "router.[crud operation here]("/...")"
router.get("/", (req, res) => {
  res.status(200).json({ success: true, msg: "Show all bootcamps" });
});

router.get("/:id", (req, res) => {
  res
    .status(200)
    .json({ success: true, msg: `Show bootcamp ${req.params.id}` });
});

router.post("/", (req, res) => {
  res.status(200).json({ success: true, msg: "Create new bootcamp" });
});

router.put("/:id", (req, res) => {
  res
    .status(200)
    .json({ success: true, msg: `Updated bootcamp ${req.params.id}` });
});

router.delete("/:id", (req, res) => {
  res
    .status(200)
    .json({ success: true, msg: `Deleted bootcamp ${req.params.id}` });
});

module.exports = router;
