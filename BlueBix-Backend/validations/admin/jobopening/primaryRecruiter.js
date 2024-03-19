const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validatePrimaryRecruitInput(data) {
  let errors = {};

    data.account_owner_id = !isEmpty(data.account_owner_id) ? data.account_owner_id : "";

    if (Validator.isEmpty(data.account_owner_id)) {
        errors.account_owner_id = "Account Owner Id is required";
    }
    
  return {
    errors,
    isValid: isEmpty(errors)
  };
};