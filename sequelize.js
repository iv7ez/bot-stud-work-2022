require("dotenv").config();
const Sequelize = require("sequelize");
const collaborator = require("./models/collaborator"),
  client = require("./models/client"),
  message = require("./models/message"),
  price_list = require("./models/price_list")
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: "localhost",
    define: {
      timestamps: false,
    },
  }
);
const Collaborator = sequelize.define("collaborator", collaborator);
const Client = sequelize.define("client", client);
const Message = sequelize.define("message", message);
const ClientMessage = sequelize.define("client_message");
const PriceList = sequelize.define("price_list", price_list)
Client.belongsToMany(Message, {
  through: "client_message",
  as: "messages",
  foreignKey: "client_id",
});
Message.belongsToMany(Client, {
  through: "client_message",
  as: "clients",
  foreignKey: "message_id",
});
module.exports = {
  sequelize,
  Collaborator,
  Client,
  Message,
  ClientMessage,
  PriceList
};
