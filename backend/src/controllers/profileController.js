const Users = require("../models/userModel");
const EmergencyContact = require("../models/emergencyModel");


const getProfile = async (req, res, next) => {
  try {
    const user = await Users.findByPk(req.user.id, {
      include: [{ model: EmergencyContact, as: "emergencyContacts" }],
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      age,
      bloodType,
      allergies,
      medications,
      conditions,
      emergencyContacts,
    } = req.body;

    if (!fullName) {
      return res.status(400).json({ message: "Full name is required" });
    }

    const userId = req.user.id;

    // Update user profile data
    await Users.update(
      {
        fullName,
        age: age ?? null,
        bloodType: bloodType ?? null,
        allergies: Array.isArray(allergies) ? allergies : [],
        medications: Array.isArray(medications) ? medications : [],
        conditions: Array.isArray(conditions) ? conditions : [],
      },
      { where: { id: userId } }
    );

    // Replace emergency contacts
    await EmergencyContact.destroy({ where: { userId } });

    if (Array.isArray(emergencyContacts) && emergencyContacts.length > 0) {
      const newContacts = emergencyContacts.map((contact) => ({
        name: contact.name,
        relationship: contact.relationship || "",
        phone: contact.phone,
        userId,
      }));

      await EmergencyContact.bulkCreate(newContacts);
    }

    // Return updated profile
    const updatedUser = await Users.findByPk(userId, {
      include: [{ model: EmergencyContact, as: "emergencyContacts" }],
      attributes: { exclude: ["password"] },
    });

    res.json({ message: "Profile updated", profile: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { getProfile, updateProfile };
