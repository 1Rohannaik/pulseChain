const bcrypt = require("bcryptjs");
const { generateToken } = require("../lib/utilis");
const User = require("../models/userModel");
const { signupSchema } = require("../../utils/validation");
const cache = require("../lib/cacheHelper");

// SIGNUP
const signup = async (req, res) => {
  try {
    const redis = req.app.locals.redis;

    // Joi schema validation
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { fullName, email, password, role, licenseId } = value;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      licenseId: role === "medical" ? licenseId : null,
    });

    if (newUser) {
      generateToken(newUser.id, res);

      // Invalidate any user list cache
      await cache.delSafe(redis, `user:${newUser.id}`);
      await cache.delSafe(redis, "users:all");

      return res.status(201).json({
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const redis = req.app.locals.redis;
    const cacheKey = cache.hashKey("userByEmail", email);

    // Try cache first
    let user = await cache.getSafe(redis, cacheKey);
    if (user) {
      console.log("Serving user from cache");
      user = JSON.parse(user);
    } else {
      user = await User.findOne({ where: { email } });
      if (user) {
        await cache.setSafe(redis, cacheKey, 3600, JSON.stringify(user));
      }
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user.id, res);

    await cache.setSafe(redis, `user:${user.id}`, 3600, JSON.stringify(user));

    res.status(200).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    });
  } catch (error) {
    console.error("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// LOGOUT
const logout = async (req, res) => {
  try {
    const redis = req.app.locals.redis;

    res.cookie("jwt", "", { maxAge: 0 });

    if (req.user?.id) {
      await cache.delSafe(redis, `user:${req.user.id}`);
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// CHECK AUTH
const checkAuth = async (req, res) => {
  try {
    const redis = req.app.locals.redis;
    const cacheKey = `user:${req.user.id}`;

    let cachedUser = await cache.getSafe(redis, cacheKey);
    if (cachedUser) {
      console.log("Serving checkAuth from cache");
      return res.status(200).json(JSON.parse(cachedUser));
    }

    const freshUser = await User.findByPk(req.user.id);
    if (freshUser) {
      await cache.setSafe(redis, cacheKey, 3600, JSON.stringify(freshUser));
    }

    res.status(200).json(freshUser);
  } catch (error) {
    console.error("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  signup,
  login,
  logout,
  checkAuth,
};
