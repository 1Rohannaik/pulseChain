// routes/qrRoutes.js
const express = require("express");
const QRCode = require("qrcode");
const router = express.Router();

// Example: GET /api/v1/qr/:userId
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const emergencyUrl = `http://localhost:5173/emergency/${userId}`;

  try {
    const qrDataURL = await QRCode.toDataURL(emergencyUrl);
    res.json({ qrCode: qrDataURL }); 
  } catch (err) {
    console.error("QR generation failed:", err);
    res.status(500).json({ error: "QR generation failed" });
  }
});

module.exports = router;
