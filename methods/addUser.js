const { Client, Collaborator } = require("../sequelize.js");
const argon2 = require("argon2");
const axios = require("axios").default;
const rgxps = require("../assets/validation");
require("dotenv").config();
async function validate(data) {
  if (data.inn == null && data.ogrn == null) {
    return { error: 1 };
  }
  if (data.phone == null && data.mail == null) {
    return { error: 1 };
  }
  if (data.phone_personal == null && data.mail_personal == null) {
    return { error: 1 };
  }
  if (data.fio == null || data.password == null) {
    return { error: 1 };
  }
  for (let key in data) {
    if (data[key] && !rgxps[key].test(data[key])) {
      return { error: 1 };
    }
  }
  const { mail, phone } = data;
  const user = await Client.findOne({ where: { mail } });
  if (mail && user) {
    return { error: 2 };
  }
  const admin = await Collaborator.findOne({ where: { mail } });
  if (mail && admin) {
    return { error: 2 };
  }
  const user2 = await Client.findOne({ where: { phone } });
  if (phone && user2) {
    return { error: 2 };
  }
  const admin2 = await Collaborator.findOne({ where: { phone } });
  if (phone && admin2) {
    return { error: 2 };
  }
  const req = data.inn || data.ogrn;
  let res_fns = { error: 0 };
  try {
    const response = await axios({
      method: "post",
      url: `https://api-fns.ru/api/egr?req=${req}&key=${process.env.FNS_API_KEY}`,
    });
    const { items } = response.data;
    console.log(JSON.stringify(items), 777);
    if (!items.length) {
      return { error: 3 };
    }
    const item = items[0];
    if (
      (data.inn && item["ЮЛ"]["ИНН"] != data.inn) ||
      (data.ogrn && item["ЮЛ"]["ОГРН"] != data.ogrn)
    ) {
      return { error: 3 };
    }
    if (
      (data.mail && !item["ЮЛ"]["Контакты"]["e-mail"].includes(data.mail)) ||
      (data.phone &&
        !item["ЮЛ"]["Контакты"]["Телефон"].find((tel) =>
          new RegExp(data.phone).test(tel)
        ))
    ) {
      return { error: 3 };
    }
    if (item["ЮЛ"]["Статус"] != "Действующее") {
      return { error: 3 };
    }
  } catch (err) {
    res_fns = { error: 3 };
  }

  return res_fns;
}
module.exports = async function (userData) {
  const test = await validate(userData);
  if (test.error) {
    return test;
  }
  const passwordHashed = await argon2.hash(userData.password);
  userData.password = passwordHashed;
  const client = await Client.create({ ...userData, verified: false });
  return client;
};
