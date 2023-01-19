const bcrypt = require("bcrypt");
require("dotenv").config({ path: "../Config/.env" });

const checkPassword = (password, hash) => {
  return bcrypt.compare(password, hash);
};

const genHash = (password) => {
  const saltRounds = Number(process.env.SALT_ROUNDS);
  return bcrypt.hashSync(password, saltRounds);
};

module.exports = { checkPassword, genHash };
