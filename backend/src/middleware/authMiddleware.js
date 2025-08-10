const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const redisClient = require("../lib/redis"); 

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const cacheKey = `user:${decoded.userId}:auth`;

    // 1. Check Redis
    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
      console.log("📦 Auth cache hit");
      req.user = JSON.parse(cachedUser);
      return next();
    }

    console.log("💾 Auth cache miss, querying DB");

    // 2. Fetch from DB
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Store in Redis for 30 min
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(user));

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { protectRoute };
