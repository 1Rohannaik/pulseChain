const Users = require("../models/userModel");
const Document = require("../models/documentModel");
const EmergencyContact = require("../models/emergencyModel");

exports.getEmergencyInfo = async (req, res) => {
  try {
    const { userId } = req.params;

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
          as: "documents", // 👈 must match the alias in `hasMany`
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
    console.error("Emergency fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
