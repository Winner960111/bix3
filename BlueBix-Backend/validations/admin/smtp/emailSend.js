const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateEmailSendInput(data) {
  let errors = {};

    data.email = !isEmpty(data.email) ? data.email : "";
    data.to = !isEmpty(data.to) ? data.to : "";
  
    

    if (!Validator.isEmail(data.email)) {
        errors.email = "Email is invalid";
    }

    if (Validator.isEmpty(data.email)) {
        errors.email = "Email is required";
    }

    if (!Validator.isEmail(data.to)) {
        errors.to = "Email Receiver is invalid";
    }

    if (Validator.isEmpty(data.to)) {
        errors.to = "Email Receiver is required";
    }

    // if (data.to.length == 0) {
    //     errors.to = "Email Receiver is required";
    // }


  


  return {
    errors,
    isValid: isEmpty(errors)
  };
};