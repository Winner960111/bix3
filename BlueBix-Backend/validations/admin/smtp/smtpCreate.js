const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateSmtpInput(data) {
  let errors = {};

    data.form_type = !isEmpty(data.form_type) ? data.form_type : "";
    data.email_type = !isEmpty(data.email_type) ? data.email_type : "";
    data.email_protocol = !isEmpty(data.email_protocol) ? data.email_protocol : "";
    data.email_encryption = !isEmpty(data.email_encryption) ? data.email_encryption : "";
    data.smtp_host = !isEmpty(data.smtp_host) ? data.smtp_host : "";
    data.smtp_port = !isEmpty(data.smtp_port) ? data.smtp_port : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    // data.smtp_user_name = !isEmpty(data.smtp_user_name) ? data.smtp_user_name : "";
    data.smtp_password = !isEmpty(data.smtp_password) ? data.smtp_password : "";
    data.email_charset = !isEmpty(data.email_charset) ? data.email_charset : "";
    data.user_id = !isEmpty(data.user_id) ? data.user_id : "";


    if (Validator.isEmpty(data.form_type)) {
        errors.form_type = "Form Type is required";
    }

    if (Validator.isEmpty(data.email_type)) {
        errors.email_type = "Email Type is required";
    }

    if (Validator.isEmpty(data.email_protocol)) {
        errors.email_protocol = "Email Protocol is required";
    }


    if (Validator.isEmpty(data.email_encryption)) {
        errors.email_encryption = "Email Encryption is required";
    }


    if (Validator.isEmpty(data.smtp_host)) {
        errors.smtp_host = "Smtp Host is required";
    }


    if (!Validator.isNumeric(data.smtp_port.toString())) {
        errors.smtp_port = "Enter Smtp Port in Number";
    }

    if (Validator.isEmpty(data.smtp_port)) {
        errors.smtp_port = "Smtp Port is required";
    }

    if (!Validator.isEmail(data.email)) {
        errors.email = "Email is invalid";
    }


    if (Validator.isEmpty(data.email)) {
        errors.email = "Email is required";
    }

    if (Validator.isEmpty(data.user_id)) {
        errors.user_id = "User Id is required";
    }


    // if (!Validator.isEmail(data.smtp_user_name)) {
    //     errors.smtp_user_name = "Smtp User Name is invalid";
    // }


    // if (Validator.isEmpty(data.smtp_user_name)) {
    //     errors.smtp_user_name = "Smtp User Name is required";
    // }


    if (Validator.isEmpty(data.smtp_password)) {
        errors.smtp_password = "Smtp Password is required";
    }


  return {
    errors,
    isValid: isEmpty(errors)
  };
};