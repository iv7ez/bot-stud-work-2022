const Sequelize = require("sequelize");
module.exports = {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  index: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  title: {
    type: Sequelize.STRING(256),
    allowNull: false,
  },
  path: {
    type: Sequelize.TEXT("long"),
    allowNull: false,
  },
};
