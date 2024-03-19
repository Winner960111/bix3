const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateInput(data) {
  let errors = {};

    data.company_id = !isEmpty(data.company_id) ? data.company_id : "";

    if (Validator.isEmpty(data.company_id)) {
        errors.company_id = "Company Id is required";
    }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};