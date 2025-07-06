const express = require("express");
const {
  checkAuth,
  login,
  logout,
  signup,
} = require("../controllers/authController");
const { protectRoute } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check", protectRoute, checkAuth);

module.exports = router;
