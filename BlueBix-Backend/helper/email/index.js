const nodemailer = require("nodemailer");
const ejs = require("ejs");
const htmlToText = require("html-to-text");
const email = require("../mail");

// const transport = nodemailer.createTransport({
//   host: email.host,
//   port: email.port,
//   // secure: true,
//   auth: {
//     user: email.username,
//     pass: email.password
//   }
// });

const generateHTML = (filename, options = {}) => {
  var html = "";

  ejs.renderFile(`${__dirname}/../../views/email/${filename}.ejs`, { mail_data: options.data }, {}, (err, str) => {
    if (err) {
      console.log('Error in mail template', err)
    } else {
      html = str;
    }
  })
  return html;
};
exports.functionName = async function (req, res, next) {

}
exports.send = async (options, req) => {

  const getSmtpSendObj = (req && req.user) ? await email.from(req.user) : { "email_send": { "email": process.env.FROM, smtp_password: options.from_user_password } }
  console.log('getSmtpSendObj :>>', getSmtpSendObj.email_send.email);

  if (!getSmtpSendObj?.email_send) {
    console.log("Somethings went wrong with the mail from credentials")
  } else {
    const html = generateHTML(options.filename, options);
    const text = htmlToText.fromString(html);

    const mailOptions = {
      // from: email.from,
      from: getSmtpSendObj.email_send.email,
      to: options.user.email,
      subject: options.subject,
      text,
      html,
    };

    if (options.attachments) {
      mailOptions.attachments = options.attachments
    }

    const transport = nodemailer.createTransport({
      host: options.smtp_host,
      port: options.smtp_port,
      auth: {
        // user: options.from_user_email,
        // pass: options.from_user_password
        user: getSmtpSendObj.email_send.email,
        pass: getSmtpSendObj.email_send.smtp_password
      }
    });
    return transport.sendMail(mailOptions);
  }
};
