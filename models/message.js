const Sequelize = require("sequelize");
module.exports = {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  text: {
    type: Sequelize.TEXT("long"),
    allowNull: false,
  },
};
