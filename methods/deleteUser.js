const { Client } = require("../sequelize.js");
module.exports = async function (data) {
  let user;
  try{
    user = await Client.findOne({where: data})
  } catch{
    return null
  }
  if(!user){
    return null
  }
  return await Client.destroy({ where: data });
};
