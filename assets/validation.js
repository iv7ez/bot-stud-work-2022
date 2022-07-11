module.exports = {
  inn: /^\d{10}(\d{2})?$/,
  ogrn: /^\d{13}$/,
  phone: /^\d{11}$/,
  mail: /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/,
  phone_personal: /^\d{11}$/,
  mail_personal:
    /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/,
  fio: /(\S\s?){3}/,
  password: /\S{4}/,
};
