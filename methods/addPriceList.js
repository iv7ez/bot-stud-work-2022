const { PriceList } = require("../sequelize");
const data = require("../examples/priceLists_example.json");
module.exports = async function () {
  const list = await PriceList.findOne({ where: {} });
  if (!list) {
    await PriceList.bulkCreate(data);
  }
  return true;
};
