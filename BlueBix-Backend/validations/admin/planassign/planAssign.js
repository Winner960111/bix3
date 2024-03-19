const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validatePlanAssignInput(data) {
  let errors = {};

    data.plan_id = !isEmpty(data.plan_id) ? data.plan_id : "";
    data.company_id = !isEmpty(data.company_id) ? data.company_id : "";
  

    if (Validator.isEmpty(data.plan_id)) {
        errors.plan_id = "Plan Id is required";
    }

    if (Validator.isEmpty(data.company_id)) {
        errors.company_id = "Company Id is required";
    }


  return {
    errors,
    isValid: isEmpty(errors)
  };
};