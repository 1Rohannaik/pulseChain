const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");
const { protectRoute } = require("../middleware/authMiddleware");

router.get("/", protectRoute, getProfile);
router.put("/", protectRoute, updateProfile);

module.exports = router;
