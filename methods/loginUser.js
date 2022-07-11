const argon2 = require("argon2");
const { QueryTypes } = require("sequelize");
const {
  Client,
  Collaborator,
  Message,
  ClientMessage,
  sequelize,
} = require("../sequelize");
async function getMessages(client_id) {
  const msgs = [];
  const messages = await ClientMessage.findAll({
    where: {
      client_id,
    },
  });
  for (let message of messages) {
    const msg = await Message.findByPk(message.message_id);
    msgs.push(msg);
  }
  return msgs;
}
module.exports = async function (data, userType, chat_id) {
  if (userType == "user") {
    let user = await sequelize.query(
      `SELECT * FROM clients WHERE mail = '${data.email}' OR phone = '${data.phone}'`,
      {
        type: QueryTypes.SELECT,
      }
    );
    if (user[0]) {
      const password_correct = await argon2.verify(
        user[0].password,
        data.password
      );
      if (!password_correct) {
        user = [];
      }
    }
    user = user[0];
    let messages = []
    if (user) {
      await Client.update(
        {
          chat_id,
        },
        {
          where: {
            id: user.id,
          },
        }
      );
      messages = await getMessages(user.id);
      await ClientMessage.destroy({
        where: {
          client_id: user.id,
        },
      });
    }

    return {
      user: user,
      messages,
    };
  }
  if (userType == "admin") {
    let admin = await sequelize.query(
      `SELECT * FROM collaborators WHERE mail = '${data.email}' OR phone = '${data.phone}'`,
      {
        type: QueryTypes.SELECT,
      }
    );
    if (admin[0]) {
      const password_correct = await argon2.verify(
        admin[0].password,
        data.password
      );
      if (!password_correct) {
        admin = [];
      }
    }
    return { user: admin[0] };
  }
};
