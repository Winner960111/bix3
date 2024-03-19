const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateLoginInput(data) {
  let errors = {};

    data.user_type = !isEmpty(data.user_type) ? data.user_type : "";
   
    if (!Validator.isAlpha(data.user_type)) {
        errors.user_type = "Enter User Type in Characters";
    }

    if (Validator.isEmpty(data.user_type)) {
        errors.user_type = "User Type is required";
    }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};