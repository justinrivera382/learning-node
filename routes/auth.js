const express = require("express");
const { register, login, getMe } = require("../controllers/auth");

const router = express.Router();

// protecting our routes by checking their credentials, essentially creating that "private" routes we talked about in "./controllers" directory
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;
