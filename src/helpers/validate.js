const validPassword = (password) =>
  password.match(/\d/) && password.match(/[a-zA-Z]/);

module.exports = { validPassword };
