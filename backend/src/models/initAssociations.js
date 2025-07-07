const Users = require("./userModel");
const Document = require("./documentModel");
const EmergencyContact = require("./emergencyModel");

function initAssociations() {
  Users.hasMany(Document, {
    foreignKey: "userId",
    as: "documents",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Document.belongsTo(Users, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Users.hasMany(EmergencyContact, {
    foreignKey: "userId",
    as: "emergencyContacts",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  EmergencyContact.belongsTo(Users, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
}

module.exports = initAssociations;
