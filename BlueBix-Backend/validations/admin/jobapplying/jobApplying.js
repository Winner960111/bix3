const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateJobApplyingInput(data) {
  let errors = {};

  data.job_opening_id = !isEmpty(data.job_opening_id) ? data.job_opening_id : "";
  data.opening_title = !isEmpty(data.opening_title) ? data.opening_title : "";
  data.candidate_id = !isEmpty(data.candidate_id) ? data.candidate_id : "";
  data.company_id = !isEmpty(data.company_id) ? data.company_id : "";
  // data.recruiter_id = !isEmpty(data.recruiter_id) ? data.recruiter_id : "";

  let checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

  // if (!Validator.isLength(data.opening_title, {
  //   min: 2,
  //   max: 40
  // })
  // ) {
  //   errors.opening_title = "Enter Opening Title between 2 to 40 Characters";
  // }

  // if (!data.opening_title.match(alpha_name_pattern)) {
  //   errors.opening_title = "Enter Opening Title in Characters";
  // }

  if (Validator.isEmpty(data.opening_title)) {
    errors.opening_title = "Opening Title is required";
  }


  if (Validator.isEmpty(data.job_opening_id)) {
    errors.job_opening_id = "Job Opening Id is required";
  }

  if (!data.candidate_id.match(checkForHexRegExp)) {
    errors.candidate_id = "Candidate Id is invalid";
  }

  if (Validator.isEmpty(data.candidate_id)) {
    errors.candidate_id = "Candidate Id is required";
  }

  if (!data.company_id.match(checkForHexRegExp)) {
    errors.company_id = "Company Id is invalid";
  }

  if (Validator.isEmpty(data.company_id)) {
    errors.company_id = "Company Id is required";
  }

  // if (!data.recruiter_id.match(checkForHexRegExp)) {
  //   errors.recruiter_id = "Recruiter Id is invalid";
  // }

  // if (Validator.isEmpty(data.recruiter_id)) {
  //   errors.recruiter_id = "Recruiter Id is required";
  // }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};