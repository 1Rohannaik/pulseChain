const express = require("express");
const {
  getEmergencyInfoFromToken,
} = require("../controllers/emergencyController");
const router = express.Router();

// GET /api/v1/emergency/info-from-token?token=...
router.get("/info-from-token", getEmergencyInfoFromToken);

module.exports = router;
