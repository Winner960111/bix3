const Validator = require("validator");
const isEmpty = require('../is-empty');

module.exports = function validateRoleInput(data) {
  let errors = {};

    data.role_name = !isEmpty(data.role_name) ? data.role_name : "";
    data.status = !isEmpty(data.status) ? data.status : "";
   
    if (!Validator.isAlpha(data.role_name)) {
        errors.role_name = "Enter Role Name in Characters";
    }

    if (Validator.isEmpty(data.role_name)) {
        errors.role_name = "Role Name is required";
    }

    if (Validator.isEmpty(data.status)) {
        errors.status = "Status is required";
    }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};