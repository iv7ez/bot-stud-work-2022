const { Client, Message, ClientMessage } = require("../sequelize.js");
module.exports = async function (text, tg) {
  const msg = await Message.create({ text });
  /*
    const offline_users = await Client.findAll({
        where: {chat_id: null}
    })
    */
  const users = await Client.findAll({
    where: {},
  });
  for (let user of users) {
    if (user.chat_id) {
      tg.sendMessage(user.chat_id, text);
    } else {
      await ClientMessage.create({
        client_id: user.id,
        message_id: msg.id,
      });
    }
  }
  return msg;
};
