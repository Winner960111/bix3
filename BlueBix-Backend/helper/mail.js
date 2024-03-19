const { get_smtp_detail } = require("../services/smtp/smtp.services");

const host = process.env.EMAIL_HOST;
const port = process.env.EMAIL_PORT;
const username = process.env.EMAIL_USER;
const password = process.env.EMAIL_PASSWORD;
const encryption = process.env.EMAIL_ENCRYPTION;
// const from = process.env.FROM;

const from = async function (user) {
  return await get_smtp_detail(user._id);
}

module.exports = {
  host: host,
  port: port,
  username: username,
  password: password,
  encryption: encryption,
  from: from
};
