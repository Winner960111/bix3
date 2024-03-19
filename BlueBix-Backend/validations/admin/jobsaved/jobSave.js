const Validator = require("validator");
const isEmpty = require('../../is-empty');

module.exports = function validateJobSaveInput(data,url='') {
    let errors = {};

    
    data.job_opening_id         = !isEmpty(data.job_opening_id) ? data.job_opening_id : "";
    data.candidate_id        = !isEmpty(data.candidate_id) ? data.candidate_id : "";
 

    if (Validator.isEmpty(data.job_opening_id)) {
        errors.opening_id = "Job Opening Id is required";
    }

    if (Validator.isEmpty(data.candidate_id)) {
        errors.candidate_id = "Candidate Id is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
