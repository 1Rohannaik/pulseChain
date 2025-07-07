// controllers/emergencyController.js
const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");
const Document = require("../models/documentModel");
const EmergencyContact = require("../models/emergencyModel");

exports.getEmergencyInfoFromToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Missing token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await Users.findByPk(userId, {
      attributes: [
        "id",
        "fullName",
        "age",
        "bloodType",
        "allergies",
        "medications",
        "conditions",
      ],
      include: [
        {
          model: EmergencyContact,
          as: "emergencyContacts",
          attributes: ["name", "relationship", "phone"],
        },
        {
          model: Document,
          as: "documents",
          attributes: ["id", "title", "category", "date", "content"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      id: user.id,
      name: user.fullName,
      age: user.age,
      bloodType: user.bloodType,
      allergies: user.allergies || [],
      medications: user.medications || [],
      conditions: user.conditions || [],
      emergencyContacts: user.emergencyContacts,
      documents: user.documents,
    });
  } catch (err) {
    console.error("Emergency token fetch error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
