const express = require("express");
const router = express.Router();
const { getEmergencyInfo } = require("../controllers/emergencyController");

router.get("/:userId", getEmergencyInfo);

module.exports = router;
