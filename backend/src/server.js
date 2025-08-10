const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();
const cookieParser = require("cookie-parser");
const errorHandler = require("./lib/error");
const sequelize = require("./lib/db");
const session = require("./middleware/sessionMiddleware");
const limiter = require("./middleware/rateLimiter");
const redisClient = require("./lib/redis");

// Attach redis client to app.locals for use in controllers
app.locals.redis = redisClient;

// Models
require("./models/userModel");
require("./models/documentModel");
require("./models/emergencyModel");
require("./models/initAssociations")();

// Routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const qrRoutes = require("./routes/qrRoutes");
const documentRoutes = require("./routes/documentRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

app.use(
  cors({
    origin: ["https://pulsechain-1.onrender.com"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(session);

// API routes
app.use("/api/v1/users", limiter, authRoutes);
app.use("/api/v1/profile", limiter, profileRoutes);
app.use("/api/v1/qr", limiter, qrRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/emergency", limiter, emergencyRoutes);
app.use("/api/v1/chat-bot", limiter, chatbotRoutes);

app.use(errorHandler);

sequelize
  .sync()
  .then(() => {
    console.log("DB connected successfully");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });
