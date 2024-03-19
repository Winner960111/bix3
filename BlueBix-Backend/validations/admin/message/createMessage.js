const Validator = require("validator");
const isEmpty = require("../../is-empty");

module.exports = function validateRegisterInput(data, url = "") {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.message = !isEmpty(data.message) ? data.message : "";
  data.candidate_id = !isEmpty(data.candidate_id) ? data.candidate_id : "";
  data.company_id = !isEmpty(data.company_id) ? data.company_id : "";
  data.opening_id = !isEmpty(data.opening_id) ? data.opening_id : "";
  data.user_id = !isEmpty(data.user_id) ? data.user_id : "";
  data.contact_id = !isEmpty(data.contact_id) ? data.contact_id : "";
  data.user_role = !isEmpty(data.user_role) ? data.user_role : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Title is required";
  }

  if (Validator.isEmpty(data.message)) {
    errors.message = "Message is required";
  }

  if (Validator.isEmpty(data.candidate_id)) {
    errors.candidate_id = "Candidate Id is required";
  }

  if (Validator.isEmpty(data.company_id)) {
    errors.company_id = "Company Id is required";
  }

  if (Validator.isEmpty(data.opening_id)) {
    errors.opening_id = "Opening Id is required";
  }

  if (Validator.isEmpty(data.user_id)) {
    errors.user_id = "User Id is required";
  }

  if (Validator.isEmpty(data.contact_id)) {
    errors.contact_id = "Contact Id is required";
  }

  if (Validator.isEmpty(data.user_role)) {
    errors.user_role = "User role is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
