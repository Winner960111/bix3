const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validatePlanInput(data) {
  let errors = {};

    data.plan_name = !isEmpty(data.plan_name) ? data.plan_name : "";
    data.candidate_view_limit = !isEmpty(data.candidate_view_limit) ? data.candidate_view_limit : "";
    data.email_limit = !isEmpty(data.email_limit) ? data.email_limit : "";
    data.job_opening_limit = !isEmpty(data.job_opening_limit) ? data.job_opening_limit : "";
    data.plan_price = !isEmpty(data.plan_price) ? data.plan_price : "";
    data.plan_duration = !isEmpty(data.plan_duration) ? data.plan_duration : "";


    if (Validator.isEmpty(data.plan_name)) {
        errors.plan_name = "Plan Name is required";
    }

    if (!Validator.isNumeric(data.candidate_view_limit.toString())) {
        errors.candidate_view_limit = "Enter Candidate View Limit in Number";
    }

    if (Validator.isEmpty(data.candidate_view_limit)) {
        errors.candidate_view_limit = "Candidate View Limit is required";
    }

    if (!Validator.isNumeric(data.email_limit.toString())) {
        errors.email_limit = "Enter Email Limit in Number";
    }

    if (Validator.isEmpty(data.email_limit)) {
        errors.email_limit = "Email Limit is required";
    }

    if (!Validator.isNumeric(data.job_opening_limit.toString())) {
        errors.job_opening_limit = "Enter Job Opening Limit in Number";
    }

    if (Validator.isEmpty(data.job_opening_limit)) {
        errors.job_opening_limit = "Job Opening Limit is required";
    }

    if (!Validator.isNumeric(data.plan_price.toString())) {
        errors.plan_price = "Enter Plan Price in Number";
    }

    if (Validator.isEmpty(data.plan_price)) {
        errors.plan_price = "Plan Price is required";
    }

    if (Validator.isEmpty(data.plan_duration)) {
        errors.plan_duration = "Plan Duration is required";
    }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};