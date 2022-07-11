const { Client } = require("../sequelize");
module.exports = async function (clientId) {
  await Client.update({ chat_id: null }, { where: { id: clientId } });
  return true
};
