const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateJobApplyingShortListCandidateInput(data) {
  let errors = {};

    data.job_opening_id = !isEmpty(data.job_opening_id) ? data.job_opening_id : "";
    data.candidate_id = !isEmpty(data.candidate_id) ? data.candidate_id : "";
    
    let checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

    // let ObjectId = checkForHexRegExp.test(data.candidate_id)



    if (Validator.isEmpty(data.job_opening_id)) {
        errors.job_opening_id = "Job Opening Id is required";
    }

    
    if (!data.candidate_id.match(checkForHexRegExp)) {
        errors.candidate_id = "Candidate Id is invalid";
    }

    if (Validator.isEmpty(data.candidate_id)) {
        errors.candidate_id = "Candidate Id is required";
    }

  
  return {
    errors,
    isValid: isEmpty(errors)
  };
};