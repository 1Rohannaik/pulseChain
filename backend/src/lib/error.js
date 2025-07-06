const { ValidationError, UniqueConstraintError } = require("sequelize");
const jwt = require("jsonwebtoken");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Sequelize Validation Errors
  if (err instanceof ValidationError) {
    statusCode = 400;
    message = err.errors.map((error) => error.message).join(", ");
  }

  // Handle Unique Constraint Errors
  if (err instanceof UniqueConstraintError) {
    statusCode = 400;
    message = "Duplicate entry: This data already exists.";
  }

  // Handle Not Found Errors
  if (err.name === "NotFoundError") {
    statusCode = 404;
    message = "Resource not found.";
  }

  // Handle JWT Authentication Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Authentication failed.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired. Please log in again.";
  }

  // Handle Unauthorized Access (e.g., protected routes)
  if (err.name === "UnauthorizedError") {
    statusCode = 403;
    message = "You are not authorized to access this resource.";
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;
