const express = require("express");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });

  const qrUrl = `https://pulsechain-1.onrender.com/emergency/access?token=${token}`;

  try {
    const qrDataURL = await QRCode.toDataURL(qrUrl);
    res.json({ qrCode: qrDataURL, token });
  } catch (err) {
    console.error("QR generation failed:", err);
    res.status(500).json({ error: "QR generation failed" });
  }
});

module.exports = router;
