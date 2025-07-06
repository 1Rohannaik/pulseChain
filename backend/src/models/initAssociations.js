const Users = require("./userModel");
const Document = require("./documentModel");
const EmergencyContact = require("./emergencyModel");

function initAssociations() {
  Users.hasMany(Document, { foreignKey: "userId", as: "documents" });
  Document.belongsTo(Users, { foreignKey: "userId", as: "user" });

  Users.hasMany(EmergencyContact, {
    foreignKey: "userId",
    as: "emergencyContacts",
  });
  EmergencyContact.belongsTo(Users, { foreignKey: "userId", as: "user" });
}

module.exports = initAssociations;
