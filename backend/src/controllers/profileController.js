const Users = require("../models/userModel");
const EmergencyContact = require("../models/emergencyModel");
const redisClient = require("../lib/redis");
const cache = require("../lib/cacheHelper");

const getProfile = async (req, res, next) => {
  try {
    const cacheKey = `user:${req.user.id}:profile`;

    // 1. Try Redis first using cacheHelper
    const cachedProfile = await cache.getSafe(redisClient, cacheKey);
    if (cachedProfile) {
      console.log("Cache hit for profile");
      return res.json(JSON.parse(cachedProfile));
    }

    console.log("💾 Cache miss, fetching from DB");

    // 2. Fetch from DB
    const user = await Users.findByPk(req.user.id, {
      include: [{ model: EmergencyContact, as: "emergencyContacts" }],
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Store in Redis (expires in 1 hour)
    await cache.setSafe(redisClient, cacheKey, 3600, JSON.stringify(user));

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

    // 1. Update profile in DB
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

    // 2. Replace emergency contacts
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

    // 3. Get updated profile
    const updatedUser = await Users.findByPk(userId, {
      include: [{ model: EmergencyContact, as: "emergencyContacts" }],
      attributes: { exclude: ["password"] },
    });

    // 4. Update Redis cache safely
    const cacheKey = `user:${userId}:profile`;
    await cache.setSafe(
      redisClient,
      cacheKey,
      3600,
      JSON.stringify(updatedUser)
    );

    res.json({ message: "Profile updated", profile: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getProfile, updateProfile };
