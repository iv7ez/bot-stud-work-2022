const { Client, PriceList } = require("../sequelize.js");
const argon2 = require("argon2");
const rgxps = require("../assets/validation");
function validate(data) {
  if (!Object.keys(data).length) {
    return false;
  }
  for (let key in data) {
    if (rgxps[key] && !rgxps[key].test(data[key])) {
      return false;
    }
  }
  return true;
}
module.exports = async function (newData, id, role) {
  if (!validate(newData)) {
    return false;
  }
  if (role == "user") {
    delete newData.ogrn;
    delete newData.inn;
    delete newData.mail;
    delete newData.phone;
  }
  if (role == "admin") {
    delete newData.password;
  }
  if ("password" in newData) {
    newData.password = await argon2.hash(newData.password);
  }
  if ("coefficient" in newData) {
    const pricelist = await PriceList.findByPk(newData.coefficient);
    if (!pricelist) {
      return false;
    }
  }
  const user = await Client.update(newData, { where: { id } });
  return user;
};
