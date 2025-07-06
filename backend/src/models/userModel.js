const { DataTypes } = require("sequelize");
const sequelize = require("../lib/db");

const Users = sequelize.define(
  "Users",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("patient", "medical"),
      allowNull: false,
    },
    licenseId: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [5, 50],
      },
    },

    // ✅ Updated fields for MySQL
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bloodType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    allergies: {
      type: DataTypes.JSON, // ✅ use JSON instead of ARRAY
      allowNull: true,
    },
    medications: {
      type: DataTypes.JSON, // ✅
      allowNull: true,
    },
    conditions: {
      type: DataTypes.JSON, // ✅
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "Users",
  }
);

module.exports = Users;
