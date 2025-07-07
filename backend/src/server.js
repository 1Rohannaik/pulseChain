const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();
const cookieParser = require("cookie-parser");
const errorHandler = require("./lib/error");
const sequelize = require("./lib/db");

// Load all models BEFORE associations
require("./models/userModel");
require("./models/documentModel");
require("./models/emergencyModel");

// Setup associations between models
const initAssociations = require("./models/initAssociations");
initAssociations(); // e.g., User.hasMany(EmergencyContact), etc.

// Routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const qrRoutes = require("./routes/qrRoutes");
const documentRoutes = require("./routes/documentRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

// CORS Middleware
app.use(
  cors({
    origin: "https://pulsechain-1.onrender.com", // Frontend origin
    credentials: true, // Allows cookies and auth headers
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Mount API route handlers
app.use("/api/v1/users", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/qr", qrRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/emergency", emergencyRoutes);
app.use("/api/v1/chat-bot", chatbotRoutes);

// Global error handler
app.use(errorHandler);

// Connect to DB and Start Server
sequelize
  .sync() 
  .then(() => {
    console.log("DB connected successfully");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(" DB connection failed:", err);
  });
