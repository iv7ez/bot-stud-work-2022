const { PriceList } = require("../sequelize.js");
module.exports = async function (params = {}) {
  return await PriceList.findAll({ where: params });
};
