// const moment = require('moment');

const mongoose = require("mongoose");
const EmailActivity = require("../services/emailactivity/emailactivity.model");
const mail = require('../helper/email/index');

exports.getMomentObject = (date, format = "DD-MM-YYYY") => {
  return moment(date, format);
};

exports.getDefaultMessage = () => {
  return {
    title: "Admin Title",
    body: "Admin Body",
    background_img: process.env.BASE_URL_IP + '/message/default/qr_code.png',
    is_admin: true
  }
};

exports.sendMailNotification = async (file, subject, user_id, name, email, footer_content, idCheck = true, main_content = {}, req) => {
  const match = {
    email_type: file,
  };

  if (idCheck) {
    match.status = true
    match.user_id = mongoose.Types.ObjectId(user_id)
  }

  let is_email_activity_allowed = await EmailActivity.aggregate([

    {
      $match: match
    },
    {
      $lookup: {
        from: 'emailtemplates',
        localField: 'email_type',
        foreignField: 'email_type',
        as: 'email_template',
      }
    },
    {
      $project: {
        "email_template.content": 1,
      }
    }
  ]);

  if (is_email_activity_allowed.length > 0) {

    const email_template = is_email_activity_allowed[0].email_template[0];

    const send_mail = {
      name,
      content: main_content ? main_content : email_template.content,
      footer_content: footer_content,
    };

    const mail_options = {
      filename: file,
      data: send_mail,
      subject,
      from_user_email: "test.knptech.2023@gmail.com",
      from_user_password: "qufezstbbfkkxhid",
      smtp_host: "smtp.gmail.com",
      smtp_port: 465,
      user: {
        email
      },
    };

    await mail.send(mail_options, req);
  }
}

