const validation = require("./validation");
module.exports = [
  {
    title: "ogrn",
    allowNull: true,
    message: "Введите ОГРН",
    validate: validation.ogrn,
  },
  {
    title: "inn",
    allowNull: "ogrn",
    message: "Введите ИНН",
    validate: validation.inn,
    //и т. д.
  },
  {
    title: "phone",
    allowNull: true,
    message: "Введите телефон организации в формате 7ХХХХХХХХХХ",
    validate: validation.phone,
  },
  {
    title: "mail",
    allowNull: "phone",
    message: "Введите почту организации",
    validate: validation.mail,
  },
  {
    title: "phone_personal",
    allowNull: true,
    message: "Введите контактный телефон в формате 7ХХХХХХХХХХ",
    validate: validation.phone_personal,
  },
  {
    title: "mail_personal",
    allowNull: "phone_personal",
    message: "Введите контактную почту",
    validate: validation.mail_personal,
  },
  {
    title: "fio",
    allowNull: false,
    message: "Введите ФИО зарегистрированного руководителя (полностью)",
    validate: validation.fio_personal,
  },
  {
    title: "password",
    allowNull: false,
    message: "Введите пароль от 4-х символов",
    validate: validation.password_personal,
  },
];
