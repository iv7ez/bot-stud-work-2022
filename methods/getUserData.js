const { Client, PriceList } = require("../sequelize.js");
module.exports = async function (userData) {
  const client = await Client.findOne({where: userData});
  if(client.coefficient){
    const pricelist = await PriceList.findByPk(client.coefficient);
    client.coefficient = pricelist.path
  }
  return client;
};